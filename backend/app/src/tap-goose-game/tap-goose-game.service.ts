import { Injectable, NotFoundException } from '@nestjs/common';
import { REDIS_EVENTS, REDIS_KEYS } from './config';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import { CreateGooseMatchRequestDto, UserGooseTapPubSubEventDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { $Enums } from '@prisma/client';
import {
  GameMatch,
  HistoryOfGameMatch,
  MatchStatus,
  ActiveMatchIsEnded,
  MatchPlayers,
  PlayerScores,
} from './types';
import { MatchSchedulerService } from './match-scheduler.service';
import { UserDto } from 'src/user/dto/user.dto';
import { HelperService } from './helper.service';
import { UserRoleEnum } from 'src/user/dto/types';
import { validateDto } from 'src/utils/validateDto';

@Injectable()
export class TapGooseGameService {
  constructor(
    private readonly cacheService: ExternalCacheService,
    private readonly pubSubService: PubSubService,
    private readonly prisma: PrismaService,
    private readonly matchScheduler: MatchSchedulerService,
    private readonly helper: HelperService,
  ) { }

  private readonly throttleLimitMs = 10; //in ms

  async createMatch(
    user: UserDto,
    dto: CreateGooseMatchRequestDto,
  ): Promise<string> {
    return await this.matchScheduler.createMatch(user, dto);
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

  private async validateTapGoose(matchId: string, playerId: string) {
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

    const matchStatus: MatchStatus | null = await this.cacheService.get(
      REDIS_KEYS.getMatchStatusKey(matchId),
    );

    if (!matchStatus) {
      throw new Error('Match status not found');
    }
    if (matchStatus === MatchStatus.WAITING)
      throw new Error('Match has not started yet');
    if (matchStatus === MatchStatus.FINISHED)
      throw new Error('Match has ended');
    if (matchStatus !== MatchStatus.ONGOING) {
      throw new Error('Invalid match status');
    }
    const isPlayerInMatch = await this.helper.isPlayerInMatchCache(
      matchId,
      playerId,
    );
    if (!isPlayerInMatch) throw new Error('Player not found');
  }

  async tapGoose(matchId: string, user: UserDto): Promise<void> {
    // Примечание: текущая реализация хранит только текущее состояние игры в Redis.
    // Если в игре возникнут требования хранения полной истории, отката состояний,
    // поддержки сложной бизнес-логики с множеством правил,
    // а также масштабирования — можно начать использовать подход Event Sourcing и CQRS.

    // Так же в случае высокой нагрузки можно рассмотреть агрегацию кликов или батчинг
    // обновлений на сервере, но в простом случае при хорошем масштабировании это не обязательно

    await this.validateTapGoose(matchId, user.id);

    const tapCount = await this.cacheService.hincrby(
      REDIS_KEYS.getMatchTapsKey(matchId),
      user.id,
      1,
    );

    const isUserRoleNikita = user.roles.includes(UserRoleEnum.NIKITA);

    const increment = isUserRoleNikita ? 0 : tapCount % 10 === 0 ? 10 : 1;

    const scoresKey = REDIS_KEYS.getMatchScoresKey(matchId);
    const newScore = await this.cacheService.hincrby(
      scoresKey,
      user.id,
      increment,
    );

    const msg = await validateDto(UserGooseTapPubSubEventDto, {
      matchId,
      playerId: user.id,
      score: newScore,
    });

    await this.pubSubService.publish(
      REDIS_EVENTS.GOOSE_MATCH_TAP,
      JSON.stringify(msg),
    );
  }

  async getAvailableMatches(userId: string): Promise<GameMatch[]> {
    return this.helper.getAvailableMatches(userId);
  }

  async getPlayerActiveMatch(
    userId: string,
    matchId: string,
  ): Promise<GameMatch | ActiveMatchIsEnded> {
    try {
      return await this.helper.getPlayerActiveMatchFromCache(userId, matchId);
    } catch (error) {
      const isPlayerInMatchDB = await this.helper.isPlayerInMatchFromDB(
        matchId,
        userId,
      );

      if (!isPlayerInMatchDB) {
        throw error;
      }
      const matchStatusFromDB = await this.helper.getMatchStatusFromDB(matchId);
      if (matchStatusFromDB === $Enums.MatchStatus.FINISHED) {
        return {
          status: MatchStatus.FINISHED,
        };
      }
      throw error;
    }
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
                    email: true,
                    avatarUrl: true,
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
        const players: MatchPlayers = {};
        const scores: PlayerScores = {};
        for (const s of match.scores) {
          if (s.user) {
            scores[s.playerId] = s.score;
            players[s.playerId] = {
              id: s.playerId,
              username: s.user.username,
              email: s.user.email,
              avatarUrl: s.user.avatarUrl,
            };
          }
        }

        return {
          id: match.id,
          title: match.title,
          scores: scores,
          players: players,
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
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!match || match.status !== $Enums.MatchStatus.FINISHED) {
      throw new NotFoundException('Match not found or not finished');
    }

    const players: MatchPlayers = {};
    const scores: PlayerScores = {};

    for (const s of match.scores) {
      if (s.user) {
        scores[s.playerId] = s.score;
        players[s.playerId] = {
          id: s.playerId,
          username: s.user.username,
          email: s.user.email,
          avatarUrl: s.user.avatarUrl,
        };
      }
    }

    return {
      id: match.id,
      title: match.title,
      scores: scores,
      players: players,
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
