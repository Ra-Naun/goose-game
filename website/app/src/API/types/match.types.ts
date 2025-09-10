export interface CreateMatchPayload {
  title?: string;
  maxPlayers?: number;
  cooldownMs?: number;
  matchDurationSeconds?: number;
}

export interface JoinToMatchPayload {
  matchId: string;
}

export interface TapGoosePayload {
  matchId: string;
}

export enum MatchStatus {
  WAITING = "WAITING",
  ONGOING = "ONGOING",
  FINISHED = "FINISHED",
}

export type MatchPlayers = { [playerId: string]: MatchPlayerInfo };
export type PlayerScores = { [playerId: string]: number };
export type PlayerScoresLastTimeUpdate = { [playerId: string]: number };

export interface GameMatchFromServer {
  id: string;
  title: string;
  players: MatchPlayers;
  scores: PlayerScores;
  maxPlayers: number;
  status: MatchStatus;
  matchDurationSeconds: number;
  cooldownMs: number;
  createdTime: number; // timestamp
  startTime?: number; // timestamp начала раунда
  cooldownEndTime: number; // timestamp окончания обратного отсчёта
  endTime?: number; // timestamp окончания раунда
}

export interface GameMatch extends GameMatchFromServer {
  scoresLastTimeUpdate: PlayerScores;
}

export type ActiveMatchIsEnded = {
  status: MatchStatus.FINISHED;
};

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
