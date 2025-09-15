import { Injectable, NotFoundException } from '@nestjs/common';
import { REDIS_KEYS } from './config';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import {
  ActiveMatchIsEnded,
  GooseMatch,
  GooseMatchCacheItem,
  GooseMatchPlayerInfo,
  GooseMatchPlayers,
  MatchStatus,
  GoosePlayerScores,
  SerializedGooseMatchPlayers,
  SerializedGoosePlayerScore,
} from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameMatchCacheItemDto, GooseGameMatchDto } from './dto';
import { validateDto } from 'src/utils/validateDto';

@Injectable()
export class HelperService {
  constructor(
    private readonly cacheService: ExternalCacheService,
    private readonly prisma: PrismaService,
  ) { }

  async getMatchMetaDataFromCache(
    matchId: string,
  ): Promise<GameMatchCacheItemDto> {
    const data = await this.cacheService.get<string>(
      REDIS_KEYS.getMatchKey(matchId),
    );
    if (!data) throw new Error('Match not found');
    const match: GooseMatchCacheItem = JSON.parse(data);
    const dto = await validateDto(GameMatchCacheItemDto, match);
    return dto;
  }

  async isPlayerInMatchCache(matchId: string, playerId: string) {
    const playersKey = REDIS_KEYS.getMatchPlayersKey(matchId);
    const isPlayerInMatch = await this.cacheService.hexists(
      playersKey,
      playerId,
    );
    return isPlayerInMatch;
  }

  async getAvailableMatches(userId: string): Promise<GooseGameMatchDto[]> {
    const playerMatches = await this.getPlayerMatchesIdsFromCache(userId);

    const items = await this.cacheService.getManyByPattern<string>(
      REDIS_KEYS.getMatchKey('*'),
    );

    const matchesPromises: Array<Promise<GooseGameMatchDto>> = [];
    for (const item of items || []) {
      try {
        if (!item) {
          continue;
        }
        const match: GooseMatchCacheItem = JSON.parse(item);
        const cachedMatchDto = await validateDto(GameMatchCacheItemDto, match);
        const matchStatus: MatchStatus | null = await this.cacheService.get(
          REDIS_KEYS.getMatchStatusKey(cachedMatchDto.id),
        );
        if (
          matchStatus === MatchStatus.WAITING ||
          (matchStatus === MatchStatus.ONGOING &&
            playerMatches.has(cachedMatchDto.id))
        ) {
          const players = await this.getMatchPlayersFromCache(
            cachedMatchDto.id,
          );
          const scores = await this.getMatchPlayersScoresFromCache(
            cachedMatchDto.id,
          );
          const gameMatch: GooseMatch = {
            ...cachedMatchDto,
            scores,
            players,
            status: matchStatus,
          };
          delete gameMatch['serverId'];
          const gameMatchDto = validateDto(GooseGameMatchDto, gameMatch);
          matchesPromises.push(gameMatchDto);
        }
      } catch (error) {
        console.error(error);
      }
    }
    return await Promise.all(matchesPromises);
  }

  async getPlayerActiveMatchFromCache(
    userId: string,
    matchId: string,
  ): Promise<GooseGameMatchDto> {
    const matchMetaData = await this.getPlayerMatchStrict(userId, matchId);
    const matchStatus: MatchStatus | null = await this.cacheService.get(
      REDIS_KEYS.getMatchStatusKey(matchId),
    );
    if (!matchStatus) {
      throw new NotFoundException('Match status not found');
    }
    const players = await this.getMatchPlayersFromCache(matchMetaData.id);
    const scores = await this.getMatchPlayersScoresFromCache(matchMetaData.id);
    const gameMatch: GooseMatch = {
      ...matchMetaData,
      scores,
      players,
      status: matchStatus,
    };
    delete gameMatch['serverId'];
    const gameMatchDto = await validateDto(GooseGameMatchDto, gameMatch);
    return gameMatchDto;
  }

  async isPlayerInMatchFromDB(matchId: string, playerId: string) {
    const matchScore = await this.prisma.userMatchScore.findFirst({
      where: { matchId, playerId },
      select: { playerId: true },
    });

    if (matchScore) return true;
    return false;
  }

  async getMatchStatusFromDB(matchId: string) {
    const matchScore = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { status: true },
    });

    return matchScore?.status;
  }

  async isMatchFull(matchId: string) {
    const playersKey = REDIS_KEYS.getMatchPlayersKey(matchId);
    const playersCount = await this.cacheService.hlen(playersKey);
    const matchMetaData = await this.getMatchMetaDataFromCache(matchId);
    return playersCount >= Number(matchMetaData.maxPlayers);
  }

  async isMatchEmpty(matchId: string) {
    const playersKey = REDIS_KEYS.getMatchPlayersKey(matchId);
    const playersCount = await this.cacheService.hlen(playersKey);
    return playersCount === 0;
  }

  async validateAddPlayerToMatch(matchId: string, playerId: string) {
    const matchStatus: MatchStatus | null = await this.cacheService.get(
      REDIS_KEYS.getMatchStatusKey(matchId),
    );

    if (!matchStatus) {
      throw new Error('Match status not found');
    }

    if (matchStatus === MatchStatus.ONGOING) {
      throw new Error('Cannot join a match that has already started');
    }
    if (matchStatus === MatchStatus.FINISHED) {
      throw new Error('Cannot join a match that has ended');
    }

    const isPlayerInMatch = await this.isPlayerInMatchCache(matchId, playerId);
    if (isPlayerInMatch) {
      throw new Error('Player already in match');
    }

    const isMatchFull = await this.isMatchFull(matchId);
    if (isMatchFull) {
      throw new Error('Match is full');
    }
  }

  async clearMatchCache(matchId: string) {
    await this.cacheService.del(REDIS_KEYS.getMatchKey(matchId));
    await this.cacheService.del(REDIS_KEYS.getMatchPlayersKey(matchId));
    await this.cacheService.del(REDIS_KEYS.getMatchScoresKey(matchId));
    await this.cacheService.del(REDIS_KEYS.getMatchTapsKey(matchId));
    await this.cacheService.del(REDIS_KEYS.getMatchStatusKey(matchId));
  }

  async clearMatchPlayerCache(matchId: string, playerId: string) {
    await this.cacheService.hdel(
      REDIS_KEYS.getMatchPlayersKey(matchId),
      playerId,
    );
    await this.cacheService.hdel(
      REDIS_KEYS.getMatchScoresKey(matchId),
      playerId,
    );
    await this.cacheService.hdel(REDIS_KEYS.getMatchTapsKey(matchId), playerId);
  }

  async getPlayerMatchesIdsFromCache(playerId: string): Promise<Set<string>> {
    const matchKeys = await this.cacheService.keys(
      REDIS_KEYS.getMatchPlayersKey('*'),
    );
    const matches = new Set<string>();
    for (const key of matchKeys) {
      const isPlayer = await this.cacheService.hexists(key, playerId);
      if (isPlayer) {
        const matchId = key.replace(REDIS_KEYS.MATCH_PLAYERS_PREFIX, '');
        matches.add(matchId);
      }
    }
    return matches;
  }

  async getPlayerMatches(
    playerId: string,
  ): Promise<Array<GameMatchCacheItemDto>> {
    const ids = await this.getPlayerMatchesIdsFromCache(playerId);
    const matches: GameMatchCacheItemDto[] = [];
    for (const matchId of ids) {
      try {
        const match = await this.getMatchMetaDataFromCache(matchId);
        matches.push(match);
      } catch (err) {
        console.error(err);
      }
    }
    return matches;
  }

  private async getPlayerMatchStrict(
    playerId: string,
    matchId: string,
  ): Promise<GameMatchCacheItemDto> {
    const isPlayer = await this.isPlayerInMatchCache(matchId, playerId);

    if (!isPlayer) {
      throw new NotFoundException('Player is not in this match');
    }
    const matchMetaData = await this.getMatchMetaDataFromCache(matchId);
    return matchMetaData;
  }

  async getMatchPlayersFromCache(matchId: string): Promise<GooseMatchPlayers> {
    const playersMap: SerializedGooseMatchPlayers =
      await this.cacheService.hgetall(REDIS_KEYS.getMatchPlayersKey(matchId));
    const players: GooseMatchPlayers = Object.entries(playersMap).reduce(
      (acc, [playerId, playerSerialized]) => {
        acc[playerId] = JSON.parse(playerSerialized) as GooseMatchPlayerInfo;
        return acc;
      },
      {} as GooseMatchPlayers,
    );
    return players;
  }

  async getMatchPlayersScoresFromCache(
    matchId: string,
  ): Promise<GoosePlayerScores> {
    const scoresMap: SerializedGoosePlayerScore =
      await this.cacheService.hgetall(REDIS_KEYS.getMatchScoresKey(matchId));
    const scores: GoosePlayerScores = Object.entries(scoresMap).reduce(
      (acc, [playerId, scoreSerialized]) => {
        acc[playerId] = parseInt(scoreSerialized);
        return acc;
      },
      {} as GoosePlayerScores,
    );
    return scores;
  }
}
