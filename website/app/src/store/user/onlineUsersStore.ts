import { create } from "zustand";
import type { UpdatePartialOnlineUsers, OnlineUserInfo } from "../types";

type State = {
  onlineUsers: Record<string, OnlineUserInfo>; // key is user id
  setOnlineUsers: (users: OnlineUserInfo[]) => void;
  updateOnlineUsers: (users: UpdatePartialOnlineUsers) => void;
};

export const useOnlineUsersStore = create<State>((set) => ({
  onlineUsers: {},

  setOnlineUsers: (users) => {
    const usersMap: Record<string, OnlineUserInfo> = {};
    users.forEach((user) => {
      usersMap[user.id] = user;
    });
    set({ onlineUsers: usersMap });
  },

  updateOnlineUsers: (users) =>
    set((state) => {
      const updatedOnlineUsers = { ...state.onlineUsers };
      users.forEach((userInfo) => {
        if (userInfo.isOnline) {
          updatedOnlineUsers[userInfo.id] = userInfo;
        } else {
          delete updatedOnlineUsers[userInfo.id];
        }
      });
      return { onlineUsers: updatedOnlineUsers };
    }),
}));
