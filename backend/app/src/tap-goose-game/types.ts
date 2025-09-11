export enum MatchStatus {
  WAITING = 'WAITING',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
}

export type MatchPlayers = { [playerId: string]: MatchPlayerInfo };
export type PlayerScores = { [playerId: string]: number };

export type SerializedMatchPlayers = { [playerId: string]: string };
export type SerializedPlayerScore = { [playerId: string]: string };

export interface GameMatch {
  id: string;
  title: string;
  players: MatchPlayers;
  scores: PlayerScores;
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
export interface GameMatchCacheItem
  extends Omit<GameMatch, 'scores' | 'players' | 'status'> {
  serverId: string;
}

export type MatchPlayerInfo = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
};

export interface HistoryOfGameMatch {
  id: string;
  title: string;
  status: MatchStatus;
  players: MatchPlayers;
  scores: PlayerScores;
  maxPlayers: number;
  cooldownMs: number;
  matchDurationSeconds: number;
  createdTime: number;
  startTime: number;
  endTime: number;
}
