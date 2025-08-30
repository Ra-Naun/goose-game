import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import uuid4 from 'uuid4';
import { REDIS_EVENTS, REDIS_KEYS, WEBSOCKET_ROOM } from './config';
import { TapGooseGamePubSubService } from './pub-sub.service';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import { validatePubSubMessage } from './utils';
import {
  GameMatchDto,
  UpdateGooseGameMatchPubSubEventDto,
  UserGooseTapPubSubEventDto,
  UserJoinedOrLeftMatchPubSubEventDto,
} from './dto';

const ROUND_DURATION = 60 * 1000; // 60 секунд
const COOLDOWN_DURATION = 30 * 1000; // 30 секунд
const MAX_PLAYERS_IN_MATCH = 10;

enum MatchStatus {
  WAITING = 'WAITING',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
}

interface GameMatch {
  id: string;
  players: Record<string, number>;
  status: MatchStatus;
  cooldownEndTime: number; // timestamp окончания обратного отсчёта
  maxPlayers: number;
  startTime: number; // timestamp начала раунда
  endTime: number; // timestamp окончания раунда
}

@Injectable()
export class TapGooseGameService {
  constructor(
    private readonly cacheService: ExternalCacheService,
    private readonly pubSubService: TapGooseGamePubSubService,
  ) { }

  private readonly throttleLimitMs = 10; //in ms

  private async getMatch(matchId: string): Promise<GameMatch> {
    const data = await this.cacheService.get<string>(
      REDIS_KEYS.getMatchKey(matchId),
    );
    if (!data) throw new Error('Match not found');
    const match: GameMatch = JSON.parse(data);
    return match;
  }

  async createMatch(playerId: string): Promise<void> {
    const id = uuid4();
    const now = Date.now();
    const cooldownEndTime = now + COOLDOWN_DURATION;
    const endTime = cooldownEndTime + ROUND_DURATION;
    const match: GameMatch = {
      id,
      players: { [playerId]: 0 },
      status: MatchStatus.WAITING,
      maxPlayers: MAX_PLAYERS_IN_MATCH,
      startTime: cooldownEndTime,
      cooldownEndTime,
      endTime,
    };

    const user_joined_msg = await validatePubSubMessage(
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

    const match_created_msg = await validatePubSubMessage(GameMatchDto, match);
    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_CREATED,
      JSON.stringify(match_created_msg),
    );
    setTimeout(async () => {
      await this.startMatch(id);
    }, COOLDOWN_DURATION);

    setTimeout(async () => {
      await this.endMatch(id);
    }, COOLDOWN_DURATION + ROUND_DURATION);
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
    if (Object.keys(match.players).length >= MAX_PLAYERS_IN_MATCH) {
      throw new Error('Match is full');
    }
    match.players[playerId] = 0;
    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(match));
    const msg = await validatePubSubMessage(
      UserJoinedOrLeftMatchPubSubEventDto,
      { playerId, matchId },
    );
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
    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(match));
    const msg = await validatePubSubMessage(
      UserJoinedOrLeftMatchPubSubEventDto,
      { playerId, matchId },
    );
    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_USER_LEFT,
      JSON.stringify(msg),
    );
    if (Object.keys(match.players).length === 0) {
      await this.endMatch(matchId);
    }
  }

  async startMatch(matchId: string): Promise<void> {
    const match = await this.getMatch(matchId);
    match.status = MatchStatus.ONGOING;
    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(match));
    const msg = await validatePubSubMessage(
      UpdateGooseGameMatchPubSubEventDto,
      { id: matchId, started: true },
    );
    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_STATE,
      JSON.stringify(msg),
    );
  }

  async endMatch(matchId: string): Promise<void> {
    const match = await this.getMatch(matchId);
    match.status = MatchStatus.FINISHED;
    const key = REDIS_KEYS.getMatchKey(matchId);
    await this.cacheService.set(key, JSON.stringify(match));
    const msg = await validatePubSubMessage(
      UpdateGooseGameMatchPubSubEventDto,
      { id: matchId, ended: true },
    );
    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_STATE,
      JSON.stringify(msg),
    );
    for (const playerId of Object.keys(match.players)) {
      const msg = await validatePubSubMessage(
        UserJoinedOrLeftMatchPubSubEventDto,
        { playerId, matchId: match.id },
      );
      await this.pubSubService.publish(
        REDIS_EVENTS.GOOSE_MATCH_USER_LEFT,
        JSON.stringify(msg),
      );
    }
    await this.cacheService.del(REDIS_KEYS.getMatchKey(match.id));
    // TODO сохранение результатов в БД
  }

  private async validateTapGoose(
    matchId: string,
    playerId: string,
    tapCount: number,
  ) {
    const throttleKey = REDIS_KEYS.getTapThrottleKey(matchId, playerId);
    const now = Date.now();

    const lastTapTsStr = await this.cacheService.get<string>(throttleKey);
    const lastTapTs = lastTapTsStr ? parseInt(lastTapTsStr, 10) : 0;
    if (now - lastTapTs < this.throttleLimitMs)
      throw new Error('Too many taps. Please wait.');

    await this.cacheService.set(
      throttleKey,
      now.toString(),
      this.throttleLimitMs,
    );

    const match = await this.getMatch(matchId);
    if (now < match.cooldownEndTime)
      throw new Error('Match has not started yet');
    if (now > match.endTime) throw new Error('Match has ended');
    if (!(playerId in match.players)) throw new Error('Player not found');
    if (tapCount < 0) throw new Error('Invalid tap count');
  }

  async tapGoose(
    matchId: string,
    playerId: string,
    tapCount: number = 1,
  ): Promise<void> {
    // Примечание: текущая реализация хранит только текущее состояние игры в Redis.
    // Если в игре возникнут требования хранения полной истории, отката состояний,
    // поддержки сложной бизнес-логики с множеством правил,
    // а также масштабирования — можно начать использовать подход Event Sourcing и CQRS.

    await this.validateTapGoose(matchId, playerId, tapCount);
    const match = await this.getMatch(matchId);
    match.players[playerId] += tapCount;
    await this.cacheService.set(
      REDIS_KEYS.getMatchKey(matchId),
      JSON.stringify(match),
    );

    const msg = await validatePubSubMessage(UserGooseTapPubSubEventDto, {
      matchId,
      playerId,
      score: match.players[playerId],
    });
    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_TAP,
      JSON.stringify(msg),
    );
  }
}
