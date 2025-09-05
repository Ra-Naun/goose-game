import { create } from "zustand";
import type { GameMatch } from "../API/types/match.types";
import type { TapEvent, UpdateGameMatchDataFromServer, UpdatePartialOnlineUsers, UserInfo } from "./types";

type GameState = {
  onlineUsers: Record<string, UserInfo>; // key is user id

  matches: Record<string, GameMatch>;
  tapEvents: TapEvent[];

  setOnlineUsers: (users: UserInfo[]) => void;
  addMatch: (...matches: GameMatch[]) => void;
  updateMatchState: (matchUpdate: UpdateGameMatchDataFromServer) => void;
  updateOnlineUsers: (users: UpdatePartialOnlineUsers) => void;
  addUserToMatch: (playerId: string, matchId: string) => void;
  removeUserFromMatch: (playerId: string, matchId: string) => void;
  addTapEvent: (tapEvent: TapEvent) => void;
};

export const useGameStore = create<GameState>((set) => ({
  onlineUsers: {},
  matches: {},
  tapEvents: [],

  setOnlineUsers: (users) => {
    const usersMap: Record<string, UserInfo> = {};
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

  addMatch: (...matches) =>
    set((state) => ({
      matches: matches.reduce((acc, match) => ({ ...acc, [match.id]: match }), state.matches),
    })),

  updateMatchState: (matchUpdate) =>
    set((state) => {
      const existing = state.matches[matchUpdate.id];
      if (!existing) return {};
      const updatedMatch = { ...existing, ...matchUpdate };
      return {
        matches: { ...state.matches, [matchUpdate.id]: updatedMatch },
      };
    }),

  addUserToMatch: (playerId, matchId) =>
    set((state) => {
      const match = state.matches[matchId];
      if (!match) return {};
      if (match.players[playerId]) return {};
      const updatedPlayers = { ...match.players, [playerId]: 0 };
      const updatedMatch = { ...match, players: updatedPlayers };
      return {
        matches: { ...state.matches, [matchId]: updatedMatch },
      };
    }),

  removeUserFromMatch: (playerId, matchId) =>
    set((state) => {
      const match = state.matches[matchId];
      if (!match) return {};
      if (!match.players[playerId]) return {};
      const updatedPlayers = { ...match.players };
      delete updatedPlayers[playerId];
      const updatedMatch = { ...match, players: updatedPlayers };
      return {
        matches: { ...state.matches, [matchId]: updatedMatch },
      };
    }),

  addTapEvent: (tapEvent) =>
    set((state) => ({
      tapEvents: [...state.tapEvents, tapEvent],
    })),
}));
