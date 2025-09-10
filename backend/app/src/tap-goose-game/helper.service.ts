import { Injectable, NotFoundException } from '@nestjs/common';
import { REDIS_KEYS } from './config';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import {
  ActiveMatchIsEnded,
  GameMatch,
  GameMatchCacheItem,
  MatchPlayerInfo,
  MatchPlayers,
  MatchStatus,
  PlayerScores,
  SerializedMatchPlayers,
  SerializedPlayerScore,
} from './types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HelperService {
  constructor(
    private readonly cacheService: ExternalCacheService,
    private readonly prisma: PrismaService,
  ) { }

  async getMatchMetaDataFromCache(
    matchId: string,
  ): Promise<GameMatchCacheItem> {
    const data = await this.cacheService.get<string>(
      REDIS_KEYS.getMatchKey(matchId),
    );
    if (!data) throw new Error('Match not found');
    const match: GameMatchCacheItem = JSON.parse(data);
    return match;
  }

  async isPlayerInMatchCache(matchId: string, playerId: string) {
    const playersKey = REDIS_KEYS.getMatchPlayersKey(matchId);
    const isPlayerInMatch = await this.cacheService.hexists(
      playersKey,
      playerId,
    );
    return isPlayerInMatch;
  }

  async getAvailableMatches(userId: string): Promise<GameMatch[]> {
    const playerMatches = await this.getPlayerMatchesIdsFromCache(userId);

    const items = await this.cacheService.getManyByPattern<string>(
      REDIS_KEYS.getMatchKey('*'),
    );

    const matches: GameMatch[] = [];
    for (const item of items || []) {
      if (item) {
        const match: GameMatchCacheItem = JSON.parse(item);
        const matchStatus: MatchStatus | null = await this.cacheService.get(
          REDIS_KEYS.getMatchStatusKey(match.id),
        );
        if (
          matchStatus === MatchStatus.WAITING ||
          (matchStatus === MatchStatus.ONGOING && playerMatches.has(match.id))
        ) {
          const players = await this.getMatchPlayersFromCache(match.id);
          const scores = await this.getMatchPlayersScoresFromCache(match.id);
          const gameMatch: GameMatch = {
            ...match,
            scores,
            players,
            status: matchStatus,
          };
          delete gameMatch['serverId'];
          matches.push(gameMatch);
        }
      }
    }
    return matches;
  }

  async getPlayerActiveMatchFromCache(
    userId: string,
    matchId: string,
  ): Promise<GameMatch | ActiveMatchIsEnded> {
    const matchMetaData = await this.getPlayerMatchStrict(userId, matchId);
    const matchStatus: MatchStatus | null = await this.cacheService.get(
      REDIS_KEYS.getMatchStatusKey(matchId),
    );
    if (!matchStatus) {
      throw new NotFoundException('Match status not found');
    }
    const players = await this.getMatchPlayersFromCache(matchMetaData.id);
    const scores = await this.getMatchPlayersScoresFromCache(matchMetaData.id);
    const gameMatch: GameMatch = {
      ...matchMetaData,
      scores,
      players,
      status: matchStatus,
    };
    delete gameMatch['serverId'];
    return gameMatch;
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

  async getPlayerMatches(playerId: string) {
    const ids = await this.getPlayerMatchesIdsFromCache(playerId);
    const matches: GameMatchCacheItem[] = [];
    for (const matchId of ids) {
      try {
        const match = await this.getMatchMetaDataFromCache(matchId);
        matches.push(match);
      } catch {
        // Ignore missing matches
      }
    }
    return matches;
  }

  private async getPlayerMatchStrict(playerId: string, matchId: string) {
    const isPlayer = await this.isPlayerInMatchCache(matchId, playerId);

    if (!isPlayer) {
      throw new NotFoundException('Player is not in this match');
    }
    const matchMetaData = await this.getMatchMetaDataFromCache(matchId);
    return matchMetaData;
  }

  async getMatchPlayersFromCache(matchId: string): Promise<MatchPlayers> {
    const playersMap: SerializedMatchPlayers = await this.cacheService.hgetall(
      REDIS_KEYS.getMatchPlayersKey(matchId),
    );
    const players: MatchPlayers = Object.entries(playersMap).reduce(
      (acc, [playerId, playerSerialized]) => {
        acc[playerId] = JSON.parse(playerSerialized) as MatchPlayerInfo;
        return acc;
      },
      {} as MatchPlayers,
    );
    return players;
  }

  async getMatchPlayersScoresFromCache(matchId: string): Promise<PlayerScores> {
    const scoresMap: SerializedPlayerScore = await this.cacheService.hgetall(
      REDIS_KEYS.getMatchScoresKey(matchId),
    );
    const scores: PlayerScores = Object.entries(scoresMap).reduce(
      (acc, [playerId, scoreSerialized]) => {
        acc[playerId] = parseInt(scoreSerialized);
        return acc;
      },
      {} as PlayerScores,
    );
    return scores;
  }
}
