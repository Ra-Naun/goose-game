import { Injectable } from '@nestjs/common';
import uuid4 from 'uuid4';
import { REDIS_EVENTS, REDIS_KEYS } from './config';
import { TapGooseGamePubSubService } from './pub-sub.service';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import { validateDto } from './utils';
import {
  GameMatchDto,
  CreateMatchDto,
  UpdateGooseGameMatchPubSubEventDto,
  UserJoinedOrLeftMatchPubSubEventDto,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameMatch, GameMatchCacheItem, MatchStatus } from './types';
import { getServerId } from 'src/config/env.config';

@Injectable()
export class MatchSchedulerService {
  constructor(
    private readonly cacheService: ExternalCacheService,
    private readonly pubSubService: TapGooseGamePubSubService,
    private readonly prisma: PrismaService,
  ) {
    this.initLoadMatchesAndRunScheduler();
  }

  private async initLoadMatchesAndRunScheduler() {
    const serverId = getServerId();
    const items = await this.cacheService.getManyByPattern<string>(
      REDIS_KEYS.getMatchKey('*'),
    );
    if (!items) return;

    const now = Date.now();

    for (const item of items) {
      if (!item) continue;

      const match: GameMatchCacheItem = JSON.parse(item);

      if (match.serverId !== serverId) {
        continue;
      }

      if (match.status === MatchStatus.WAITING) {
        const elapsedMs = now - match.createdTime;
        const cooldownMs = match.cooldownMs * 1000;
        const remainingMs = Math.max(cooldownMs - elapsedMs, 0);

        const nextStepCallback = async () => {
          await this.startMatch(match.id);
        };

        this.runNextStepAfterTime(remainingMs, nextStepCallback);
      } else if (match.status === MatchStatus.ONGOING && match.startTime) {
        const elapsedSinceStartMs = now - match.startTime;
        const matchDurationMs = match.matchDurationSeconds * 60 * 1000;
        const remainingMs = Math.max(matchDurationMs - elapsedSinceStartMs, 0);

        const nextStepCallback = async () => {
          await this.endMatch(match.id);
        };
        this.runNextStepAfterTime(remainingMs, nextStepCallback);
      }
    }
  }

  private runNextStepAfterTime(
    timeoutMs: number,
    callback: () => void | Promise<void>,
  ) {
    setTimeout(() => callback, timeoutMs);
  }

  private async getMatch(matchId: string): Promise<GameMatchCacheItem> {
    const data = await this.cacheService.get<string>(
      REDIS_KEYS.getMatchKey(matchId),
    );
    if (!data) throw new Error('Match not found');
    const match: GameMatchCacheItem = JSON.parse(data);
    return match;
  }

  async createMatch(playerId: string, dto: CreateMatchDto): Promise<string> {
    const id = uuid4();
    const now = Date.now();

    const match: GameMatchCacheItem = {
      id,
      title: dto.title,
      players: { [playerId]: 0 },
      status: MatchStatus.WAITING,
      createdTime: now,
      cooldownMs: dto.cooldownMs,
      maxPlayers: dto.maxPlayers,
      matchDurationSeconds: dto.matchDurationSeconds,
      serverId: getServerId(),
    };

    const dataForMatchDto: GameMatch = { ...match };
    delete dataForMatchDto['serverId'];
    console.log('~| dataForMatchDto', dataForMatchDto);

    const match_created_msg = await validateDto(GameMatchDto, dataForMatchDto);

    const user_joined_msg = await validateDto(
      UserJoinedOrLeftMatchPubSubEventDto,
      { playerId, matchId: id },
    );
    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_USER_JOINED,
      JSON.stringify(user_joined_msg),
    );

    await this.cacheService.set(
      REDIS_KEYS.getMatchKey(id),
      JSON.stringify(match),
    );

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_CREATED,
      JSON.stringify(match_created_msg),
    );

    const timeoutMs = dto.cooldownMs * 1000;
    const nextStepCallback = async () => {
      await this.startMatch(id);
    };
    this.runNextStepAfterTime(timeoutMs, nextStepCallback);
    return match.id;
  }

  private async startMatch(matchId: string): Promise<void> {
    const now = Date.now();
    const match = await this.getMatch(matchId);
    match.status = MatchStatus.ONGOING;
    match.startTime = now;
    const msg = await validateDto(UpdateGooseGameMatchPubSubEventDto, {
      id: matchId,
      status: match.status,
      startTime: match.startTime,
    });

    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(match));

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_STATE,
      JSON.stringify(msg),
    );

    const timeoutMs = match.matchDurationSeconds * 60 * 1000;
    const nextStepCallback = async () => {
      await this.endMatch(matchId);
    };
    this.runNextStepAfterTime(timeoutMs, nextStepCallback);
  }

  private async endMatch(matchId: string): Promise<void> {
    const now = Date.now();
    const match = await this.getMatch(matchId);
    match.status = MatchStatus.FINISHED;
    match.endTime = now;
    const msg = await validateDto(UpdateGooseGameMatchPubSubEventDto, {
      id: matchId,
      status: match.status,
      endTime: match.endTime,
    });

    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(match));

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_STATE,
      JSON.stringify(msg),
    );
    for (const playerId of Object.keys(match.players)) {
      const msg = await validateDto(UserJoinedOrLeftMatchPubSubEventDto, {
        playerId,
        matchId: match.id,
      });
      await this.pubSubService.publish(
        REDIS_EVENTS.GOOSE_MATCH_USER_LEFT,
        JSON.stringify(msg),
      );
    }
    await this.cacheService.del(REDIS_KEYS.getMatchKey(match.id));
    await this.saveMatchResultsToDatabase(match);
  }

  private saveMatchResultsToDatabase(match: GameMatch) {
    const matchRecord = this.prisma.match.create({
      data: {
        id: match.id,
        title: match.title,
        cooldownMs: match.cooldownMs,
        createdTime: new Date(match.createdTime),
        startTime: new Date(match.startTime!),
        endTime: new Date(match.endTime!),
        matchDurationSeconds: match.matchDurationSeconds,
        maxPlayers: match.maxPlayers,
        status: match.status,
      },
    });

    const playerRecords = Object.entries(match.players).map(
      ([playerId, score]) =>
        this.prisma.userMatchScore.create({
          data: {
            matchId: match.id,
            playerId,
            score,
          },
        }),
    );

    return this.prisma.$transaction([matchRecord, ...playerRecords]);
  }

  async addPlayerToMatch(matchId: string, playerId: string): Promise<void> {
    const match = await this.getMatch(matchId);
    if (match.status === MatchStatus.ONGOING) {
      throw new Error('Cannot join a match that has already started');
    }
    if (match.status === MatchStatus.FINISHED) {
      throw new Error('Cannot join a match that has ended');
    }
    if (playerId in match.players) {
      return;
    }
    if (Object.keys(match.players).length >= match.maxPlayers) {
      throw new Error('Match is full');
    }
    match.players[playerId] = 0;
    const msg = await validateDto(UserJoinedOrLeftMatchPubSubEventDto, {
      playerId,
      matchId,
    });

    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(match));

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_USER_JOINED,
      JSON.stringify(msg),
    );
  }

  async removePlayerFromMatch(
    matchId: string,
    playerId: string,
  ): Promise<void> {
    const match = await this.getMatch(matchId);
    if (!(playerId in match.players)) return;
    delete match.players[playerId];
    const msg = await validateDto(UserJoinedOrLeftMatchPubSubEventDto, {
      playerId,
      matchId,
    });

    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(match));

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_USER_LEFT,
      JSON.stringify(msg),
    );
    if (Object.keys(match.players).length === 0) {
      await this.endMatch(matchId);
    }
  }

  async getAvailableMatches(): Promise<GameMatch[]> {
    const items = await this.cacheService.getManyByPattern<string>(
      REDIS_KEYS.getMatchKey('*'),
    );
    const matches: GameMatch[] = [];
    for (const item of items || []) {
      if (item) {
        const match: GameMatchCacheItem = JSON.parse(item);
        if (match.status === MatchStatus.WAITING) {
          const gameMatch: GameMatch = { ...match };
          delete gameMatch['serverId'];
          matches.push(gameMatch);
        }
      }
    }
    return matches;
  }
}
