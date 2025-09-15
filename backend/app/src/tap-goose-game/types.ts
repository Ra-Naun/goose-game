export enum MatchStatus {
  WAITING = 'WAITING',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
}

export type GooseMatchPlayers = { [playerId: string]: GooseMatchPlayerInfo };
export type GoosePlayerScores = { [playerId: string]: number };

export type SerializedGooseMatchPlayers = { [playerId: string]: string };
export type SerializedGoosePlayerScore = { [playerId: string]: string };

export interface GooseMatch {
  id: string;
  title: string;
  players: GooseMatchPlayers;
  scores: GoosePlayerScores;
  status: MatchStatus;
  maxPlayers: number;
  cooldownMs: number;
  matchDurationSeconds: number;
  createdTime: number; // timestamp
  startTime?: number; // timestamp начала раунда
  endTime?: number; // timestamp окончания раунда
}

export type ActiveMatchIsEnded = {
  status: MatchStatus.FINISHED;
};
export interface GooseMatchCacheItem
  extends Omit<GooseMatch, 'scores' | 'players' | 'status'> {
  serverId: string;
}

export type GooseMatchPlayerInfo = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
};

export interface HistoryOfGooseGameMatch {
  id: string;
  title: string;
  status: MatchStatus;
  players: GooseMatchPlayers;
  scores: GoosePlayerScores;
  maxPlayers: number;
  cooldownMs: number;
  matchDurationSeconds: number;
  createdTime: number;
  startTime: number;
  endTime: number;
}
