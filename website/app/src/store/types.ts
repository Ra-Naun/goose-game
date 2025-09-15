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
  avatarUrl: string;
  createdAt: Date;
  updatedAt: Date | undefined;
  roles: UserRoleEnum[];
  activeGameId?: string | null;
};

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  roles: UserRoleEnum[];
  activeGameId?: string | null;
}

export type OnlineUserInfo = UserInfo & {
  isOnline: boolean;
};

export type UpdatePartialOnlineUsers = Array<OnlineUserInfo>;
export type UpdateGameMatchDataFromServer = Partial<Omit<GameMatch, "id">> & { id: string };

export type StartedGameMatchDataFromServer = {
  startTime: number;
  id: string;
};

export type EndedGameMatchDataFromServer = {
  endTime: number;
  id: string;
};

export interface ChatMessage {
  id: string;
  userInfo: UserInfo;
  channelId: string;
  content: string;
  sendedAt: number;
  createdAt: number;
  updatedAt?: number;
}
