import type { ServerUserRoleEnum, UserFromServer, UserInfoFromServer } from "../API/types/user.types";
import type { User, UserInfo, UserRoleEnum } from "../store/types";

const parseServerUserRolesToClientRoles = (roles: Array<ServerUserRoleEnum>): Array<UserRoleEnum> => {
  // Здесь можно добавить логику преобразования ролей, если они отличаются между сервером и клиентом
  return roles as unknown as Array<UserRoleEnum>;
};

export const parseServerUserToClientUser = (serverUser: UserFromServer): User => {
  return {
    id: serverUser.id,
    email: serverUser.email,
    avatarUrl: serverUser.avatarUrl,
    username: serverUser.username,
    roles: parseServerUserRolesToClientRoles(serverUser.roles),
    createdAt: new Date(serverUser.createdAt),
    updatedAt: serverUser.updatedAt ? new Date(serverUser.updatedAt) : undefined,
  };
};

export const parseServerUserInfoToClientUserInfo = (serverUser: UserInfoFromServer): UserInfo => {
  return {
    id: serverUser.id,
    email: serverUser.email,
    avatarUrl: serverUser.avatarUrl,
    username: serverUser.username,
    roles: parseServerUserRolesToClientRoles(serverUser.roles),
    isOnline: serverUser.isOnline,
  };
};
