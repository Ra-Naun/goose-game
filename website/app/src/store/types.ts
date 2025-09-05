import type { GameMatch } from "../API/types/match.types";

export enum UserRoleEnum {
  ADMIN = "ADMIN",
  USER = "USER",
  NIKITA = "NIKITA",
}

export type User = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date | undefined;
  roles: UserRoleEnum[];
  activeGameId?: string | null;
};

export type UserInfo = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  roles: UserRoleEnum[];
  isOnline: boolean;
  activeGameId?: string | null;
};

export interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export interface TapEvent {
  matchId: string;
  playerId: string;
  score: number;
}

export type UpdatePartialOnlineUsers = Array<UserInfo>;
export type UpdateGameMatchDataFromServer = Partial<Omit<GameMatch, "id">> & { id: string };
