import { Injectable } from '@nestjs/common';
import uuid4 from 'uuid4';
import { REDIS_EVENTS, REDIS_KEYS } from './config';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import {
  GooseGameMatchDto,
  CreateGooseMatchRequestDto,
  UserJoinedGooseMatchPubSubEventDto,
  UserLeaveGooseMatchPubSubEventDto,
  StartedGooseGameMatchPubSubEventDto,
  EndedGooseGameMatchPubSubEventDto,
  GameMatchCacheItemDto,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  GooseMatch,
  GooseMatchCacheItem,
  GooseMatchPlayerInfo,
  MatchStatus,
} from './types';
import { getServerId } from 'src/config/env.config';
import { UsersService } from 'src/user/user.service';
import { UserDto } from 'src/user/dto';
import { HelperService } from './helper.service';
import { validateDto } from 'src/utils/validateDto';

@Injectable()
export class MatchSchedulerService {
  constructor(
    private readonly cacheService: ExternalCacheService,
    private readonly pubSubService: PubSubService,
    private usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly helper: HelperService,
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
      try {
        if (!item) continue;
        const match: GooseMatchCacheItem = JSON.parse(item);
        const cachedMatchDto = await validateDto(GameMatchCacheItemDto, match);

        const matchStatus: MatchStatus | null = await this.cacheService.get(
          REDIS_KEYS.getMatchStatusKey(cachedMatchDto.id),
        );

        if (cachedMatchDto.serverId !== serverId) {
          continue;
        }

        if (matchStatus === MatchStatus.WAITING) {
          const elapsedMs = now - cachedMatchDto.createdTime;
          const cooldownMs = cachedMatchDto.cooldownMs;
          const remainingMs = Math.max(cooldownMs - elapsedMs, 0);

          const nextStepCallback = async () => {
            await this.startMatch(cachedMatchDto.id);
          };

          this.runNextStepAfterTime(remainingMs, nextStepCallback);
        } else if (
          matchStatus === MatchStatus.ONGOING &&
          cachedMatchDto.startTime
        ) {
          const elapsedSinceStartMs = now - cachedMatchDto.startTime;
          const matchDurationMs = cachedMatchDto.matchDurationSeconds * 1000;
          const remainingMs = Math.max(
            matchDurationMs - elapsedSinceStartMs,
            0,
          );

          const nextStepCallback = async () => {
            await this.endMatch(cachedMatchDto.id);
          };
          this.runNextStepAfterTime(remainingMs, nextStepCallback);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  private runNextStepAfterTime(
    timeoutMs: number,
    callback: () => void | Promise<void>,
  ) {
    setTimeout(() => callback(), timeoutMs);
  }

  async createMatch(
    user: UserDto,
    dto: CreateGooseMatchRequestDto,
  ): Promise<string> {
    const matchId = uuid4();
    const now = Date.now();

    const currentPlayerInfo: GooseMatchPlayerInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };

    const matchMetadata: GooseMatchCacheItem = {
      id: matchId,
      title: dto.title,
      createdTime: now,
      cooldownMs: dto.cooldownMs,
      maxPlayers: dto.maxPlayers,
      matchDurationSeconds: dto.matchDurationSeconds,
      serverId: getServerId(),
    };

    const matchMetadataDto = await validateDto(
      GameMatchCacheItemDto,
      matchMetadata,
    );

    const scores = { [user.id]: 0 };
    const players = { [user.id]: currentPlayerInfo };
    const status = MatchStatus.WAITING;

    const dataForMatchCreatedPubSubEvent: GooseMatch = {
      ...matchMetadataDto,
      status,
      scores,
      players,
    };
    delete dataForMatchCreatedPubSubEvent['serverId'];
    const matchCreatedMsg = await validateDto(
      GooseGameMatchDto,
      dataForMatchCreatedPubSubEvent,
    );

    await this.helper.clearMatchCache(matchId);

    await this.cacheService.set(
      REDIS_KEYS.getMatchKey(matchId),
      JSON.stringify(matchMetadata),
    );
    await this.cacheService.set(REDIS_KEYS.getMatchStatusKey(matchId), status);

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_CREATED,
      JSON.stringify(matchCreatedMsg),
    );

    await this.addPlayerToMatch(matchId, user.id);

    const timeoutMs = dto.cooldownMs;
    const nextStepCallback = async () => {
      await this.startMatch(matchId);
    };
    this.runNextStepAfterTime(timeoutMs, nextStepCallback);
    return matchMetadata.id;
  }

  private async startMatch(matchId: string): Promise<void> {
    const now = Date.now();
    const matchMetaData = await this.helper.getMatchMetaDataFromCache(matchId);
    await this.cacheService.set(
      REDIS_KEYS.getMatchStatusKey(matchId),
      MatchStatus.ONGOING,
    );
    matchMetaData.startTime = now;
    const msg = await validateDto(StartedGooseGameMatchPubSubEventDto, {
      id: matchId,
      startTime: matchMetaData.startTime,
    });

    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(matchMetaData));

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_STARTED,
      JSON.stringify(msg),
    );

    const timeoutMs = matchMetaData.matchDurationSeconds * 1000;
    const nextStepCallback = async () => {
      await this.endMatch(matchId);
    };
    this.runNextStepAfterTime(timeoutMs, nextStepCallback);
  }

  private async endMatch(matchId: string): Promise<void> {
    const now = Date.now();
    const matchStatus: MatchStatus | null = await this.cacheService.get(
      REDIS_KEYS.getMatchStatusKey(matchId),
    );
    const matchMetaData = await this.helper.getMatchMetaDataFromCache(matchId);
    if (matchStatus === MatchStatus.FINISHED) {
      return;
    }

    await this.cacheService.set(
      REDIS_KEYS.getMatchStatusKey(matchId),
      MatchStatus.FINISHED,
    );

    matchMetaData.endTime = now;
    const msg = await validateDto(EndedGooseGameMatchPubSubEventDto, {
      id: matchId,
      endTime: matchMetaData.endTime,
    });

    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(matchMetaData));

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_ENDED,
      JSON.stringify(msg),
    );

    const players = await this.helper.getMatchPlayersFromCache(matchId);
    const scores = await this.helper.getMatchPlayersScoresFromCache(matchId);

    for (const playerId of Object.keys(scores)) {
      const msg = await validateDto(UserLeaveGooseMatchPubSubEventDto, {
        playerId,
        matchId,
      });
      await this.pubSubService.publish(
        REDIS_EVENTS.GOOSE_MATCH_USER_LEAVE,
        JSON.stringify(msg),
      );
    }

    const match: GooseMatch = {
      ...matchMetaData,
      scores,
      players,
      status: MatchStatus.FINISHED,
    };
    delete match['serverId'];
    await this.saveMatchResultsToDatabase(match);
    await this.helper.clearMatchCache(matchId);
  }

  private saveMatchResultsToDatabase(match: GooseMatch) {
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

    const playerRecords = Object.entries(match.scores).map(
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
    await this.helper.validateAddPlayerToMatch(matchId, playerId);

    const user = await this.usersService.findById(playerId);
    if (!user) throw new Error('User not found');

    const matchPlayerInfo: GooseMatchPlayerInfo = {
      id: playerId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };

    const msg = await validateDto(UserJoinedGooseMatchPubSubEventDto, {
      matchPlayerInfo,
      matchId,
    });

    await this.cacheService.hset(REDIS_KEYS.getMatchPlayersKey(matchId), {
      [playerId]: JSON.stringify(matchPlayerInfo),
    });
    await this.cacheService.hset(REDIS_KEYS.getMatchScoresKey(matchId), {
      [playerId]: '0',
    });
    await this.cacheService.hset(REDIS_KEYS.getMatchTapsKey(matchId), {
      [playerId]: '0',
    });

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_USER_JOINED,
      JSON.stringify(msg),
    );
  }

  async removePlayerFromMatch(
    matchId: string,
    playerId: string,
  ): Promise<void> {
    const isPlayerInMatch = await this.helper.isPlayerInMatchCache(
      matchId,
      playerId,
    );

    if (!isPlayerInMatch) throw new Error('Player is not in the match');

    const msg = await validateDto(UserLeaveGooseMatchPubSubEventDto, {
      playerId,
      matchId,
    });

    await this.helper.clearMatchPlayerCache(matchId, playerId);

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_USER_LEAVE,
      JSON.stringify(msg),
    );

    const isMatchEmpty = await this.helper.isMatchEmpty(matchId);
    if (isMatchEmpty) {
      await this.endMatch(matchId);
    }
  }
}
