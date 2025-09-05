export enum ServerUserRoleEnum {
  ADMIN = "ADMIN",
  USER = "USER",
  NIKITA = "NIKITA",
}

export type UserFromServer = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  roles: ServerUserRoleEnum[];
  activeGameId?: string | null;
};

export type UserInfoFromServer = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  roles: ServerUserRoleEnum[];
  isOnline: boolean;
  activeGameId?: string | null;
};
