import { Injectable, NotFoundException } from '@nestjs/common';
import { REDIS_EVENTS, REDIS_KEYS, USER_ONLINE_EXPIRATION } from './config';
import { TapGooseGamePubSubService } from './pub-sub.service';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import { validateDto } from './utils';
import {
  CreateMatchDto,
  UserGooseTapPubSubEventDto,
  UserOnlineChangedPubSubEventDto,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { $Enums } from '@prisma/client';
import {
  GameMatch,
  HistoryOfGameMatch,
  MatchStatus,
  UserMatchScore,
} from './types';
import { MatchSchedulerService } from './match-scheduler.service';

@Injectable()
export class TapGooseGameService {
  constructor(
    private readonly cacheService: ExternalCacheService,
    private readonly pubSubService: TapGooseGamePubSubService,
    private readonly prisma: PrismaService,
    private readonly matchScheduler: MatchSchedulerService,
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

  async createMatch(playerId: string, dto: CreateMatchDto): Promise<string> {
    return await this.matchScheduler.createMatch(playerId, dto);
  }

  async addPlayerToMatch(matchId: string, playerId: string): Promise<void> {
    return this.matchScheduler.addPlayerToMatch(matchId, playerId);
  }

  async removePlayerFromMatch(
    matchId: string,
    playerId: string,
  ): Promise<void> {
    return this.matchScheduler.removePlayerFromMatch(matchId, playerId);
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
    if (match.status === MatchStatus.WAITING)
      throw new Error('Match has not started yet');
    if (match.status === MatchStatus.FINISHED)
      throw new Error('Match has ended');
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

    const msg = await validateDto(UserGooseTapPubSubEventDto, {
      matchId,
      playerId,
      score: match.players[playerId],
    });

    await this.cacheService.set(
      REDIS_KEYS.getMatchKey(matchId),
      JSON.stringify(match),
    );

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_TAP,
      JSON.stringify(msg),
    );
  }

  async IMOnline(playerId: string): Promise<void> {
    const key = REDIS_KEYS.getUserOnlineKey(playerId);

    const isOnline = await this.cacheService.get<boolean>(key);
    await this.cacheService.set(key, true, USER_ONLINE_EXPIRATION);

    setTimeout(
      async () => {
        const isOnline = await this.cacheService.get<boolean>(key);
        if (!isOnline) {
          const msg = await validateDto(UserOnlineChangedPubSubEventDto, {
            playerId,
            isOnline: false,
          });
          await this.pubSubService.publish(
            REDIS_EVENTS.ONLINE_USERS_CHANGED,
            JSON.stringify([msg]),
          );
        }
      },
      (USER_ONLINE_EXPIRATION + 10) * 1000,
    ); // +10 seconds buffer

    if (isOnline) return; // already online, no need to notify

    const msg = await validateDto(UserOnlineChangedPubSubEventDto, {
      playerId,
      isOnline: true,
    });
    await this.pubSubService.publish(
      REDIS_EVENTS.ONLINE_USERS_CHANGED,
      JSON.stringify([msg]),
    );
  }

  async getAvailableMatches(): Promise<GameMatch[]> {
    return this.matchScheduler.getAvailableMatches();
  }

  async getUserMatchesHistory(userId: string): Promise<HistoryOfGameMatch[]> {
    const matchScores = await this.prisma.userMatchScore.findMany({
      where: { playerId: userId },
      include: {
        match: {
          include: {
            scores: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { match: { startTime: 'desc' } },
    });

    const matches: HistoryOfGameMatch[] = matchScores
      .filter((score) => {
        return score.match.status === $Enums.MatchStatus.FINISHED;
      })
      .map((score) => {
        const match = score.match;
        const players: Array<UserMatchScore> = [];
        for (const s of match.scores) {
          if (s.user) {
            players.push({
              playerId: s.playerId,
              username: s.user.username,
              score: s.score,
            });
          }
        }

        return {
          id: match.id,
          title: match.title,
          players,
          status: match.status as MatchStatus,
          maxPlayers: match.maxPlayers,
          cooldownMs: match.cooldownMs,
          matchDurationSeconds: match.matchDurationSeconds,
          createdTime: match.createdTime.getTime(),
          startTime: match.startTime.getTime(),
          endTime: match.endTime.getTime(),
        } as HistoryOfGameMatch;
      });

    return matches;
  }

  async getUserMatchHistory(
    matchId: string,
  ): Promise<HistoryOfGameMatch | null> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        scores: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!match || match.status !== $Enums.MatchStatus.FINISHED) {
      throw new NotFoundException('Match not found or not finished');
    }

    const players: Array<UserMatchScore> = [];

    for (const score of match.scores) {
      if (score.user) {
        players.push({
          playerId: score.playerId,
          username: score.user.username,
          score: score.score,
        });
      }
    }

    return {
      id: match.id,
      title: match.title,
      players,
      status: match.status as MatchStatus,
      maxPlayers: match.maxPlayers,
      cooldownMs: match.cooldownMs,
      matchDurationSeconds: match.matchDurationSeconds,
      createdTime: match.createdTime.getTime(),
      startTime: match.startTime.getTime(),
      endTime: match.endTime.getTime(),
    };
  }
}
