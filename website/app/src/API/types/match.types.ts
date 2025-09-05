export interface NewMatchPayload {
  title?: string;
  maxPlayers?: number;
  cooldownMs?: number;
  matchDurationSeconds?: number;
}

export interface JoinToMatchPayload {
  matchId: string;
}

export enum MatchStatus {
  WAITING = "WAITING",
  ONGOING = "ONGOING",
  FINISHED = "FINISHED",
}

export interface GameMatch {
  id: string;
  title: string;
  players: Record<string, number>;
  status: MatchStatus;
  cooldownEndTime: number; // timestamp окончания обратного отсчёта
  maxPlayers: number;
  startTime: number; // timestamp начала раунда
  endTime?: number; // timestamp окончания раунда
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
  createdAt: number;
  startTime: number;
  endTime?: number;
}
