export enum MatchStatus {
  WAITING = 'WAITING',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
}

export interface GameMatch {
  id: string;
  title: string;
  players: Record<string, number>;
  status: MatchStatus;
  maxPlayers: number;
  cooldownMs: number;
  matchDurationSeconds: number;
  createdTime: number; // timestamp
  startTime?: number; // timestamp начала раунда
  endTime?: number; // timestamp окончания раунда
}

export interface GameMatchCacheItem extends GameMatch {
  serverId: string;
}

export type UserMatchScore = {
  playerId: string;
  username: string;
  score: number;
};

export interface HistoryOfGameMatch {
  id: string;
  title: string;
  players: Array<UserMatchScore>;
  status: MatchStatus;
  maxPlayers: number;
  cooldownMs: number;
  matchDurationSeconds: number;
  createdTime: number;
  startTime: number;
  endTime: number;
}
