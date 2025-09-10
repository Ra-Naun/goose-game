import {
  MatchStatus,
  type ActiveMatchIsEnded,
  type GameMatch,
  type GameMatchFromServer,
} from "../API/types/match.types";
import type { ServerUserRoleEnum, UserFromServer, UserInfoFromServer } from "../API/types/user.types";
import type { User, OnlineUserInfo, UserRoleEnum } from "../store/types";

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

export const parseServerUserInfoToClientUserInfo = (serverUser: UserInfoFromServer): OnlineUserInfo => {
  return {
    id: serverUser.id,
    email: serverUser.email,
    avatarUrl: serverUser.avatarUrl,
    username: serverUser.username,
    roles: parseServerUserRolesToClientRoles(serverUser.roles),
    isOnline: serverUser.isOnline,
  };
};

export const parseServerMatchDataToClientMatchData = (serverMatchData: GameMatchFromServer): GameMatch => {
  const clientMatchData: GameMatch = {
    ...serverMatchData,
    scoresLastTimeUpdate: {
      ...Object.keys(serverMatchData.scores).reduce(
        (acc, userId) => {
          acc[userId] = Date.now();
          return acc;
        },
        {} as GameMatch["scoresLastTimeUpdate"]
      ),
    },
  };

  return clientMatchData;
};

export const parseServerMatchDataToClientMatchDataWithEndedMatches = (
  serverMatchData: GameMatchFromServer | ActiveMatchIsEnded
): GameMatch | ActiveMatchIsEnded => {
  if (serverMatchData.status === MatchStatus.FINISHED) {
    return serverMatchData as ActiveMatchIsEnded;
  }

  return parseServerMatchDataToClientMatchData(serverMatchData);
};
