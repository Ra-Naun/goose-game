import { create } from "zustand";
import { type GameMatch, type MatchPlayerInfo } from "@/src/API/types/match.types";
import type { UpdateGameMatchDataFromServer } from "./types";

type State = {
  matches: Record<string, GameMatch>;
  setMatches: (matches: GameMatch[]) => void;
  getMatchById: (matchId: string) => GameMatch | undefined;
  addMatch: (match: GameMatch) => void;
  removeMatch: (matchId: string) => void;
  updateMatchState: (matchUpdate: UpdateGameMatchDataFromServer) => void;
  addUserToMatch: (matchPlayerInfo: MatchPlayerInfo, matchId: string) => void;
  removeUserFromMatch: (playerId: string, matchId: string) => void;
};

export const useAvailableGamesStore = create<State>((set, get) => ({
  matches: {},

  setMatches: (matches) => {
    const matchesMap: Record<string, GameMatch> = {};
    matches.forEach((match) => {
      matchesMap[match.id] = match;
    });
    set({ matches: matchesMap });
  },

  getMatchById: (matchId) => get().matches[matchId],

  addMatch: (match) =>
    set((state) => ({
      matches: { ...state.matches, [match.id]: match },
    })),

  removeMatch: (matchId) => {
    set((state) => {
      if (!state.matches[matchId]) {
        return {};
      }
      const { [matchId]: _, ...rest } = state.matches;
      return { matches: rest };
    });
  },

  updateMatchState: (matchUpdate) =>
    set((state) => {
      const existing = state.matches[matchUpdate.id];
      if (!existing) return {};
      const updatedMatch = { ...existing, ...matchUpdate };
      return {
        matches: { ...state.matches, [matchUpdate.id]: updatedMatch },
      };
    }),

  addUserToMatch: (matchPlayerInfo, matchId) =>
    set((state) => {
      const match = state.matches[matchId];
      if (!match) return {};
      if (matchPlayerInfo.id in match.players) return {};
      const updatedPlayers: GameMatch["players"] = { ...match.players, [matchPlayerInfo.id]: matchPlayerInfo };
      const updatedScores: GameMatch["scores"] = { ...match.scores, [matchPlayerInfo.id]: 0 };
      const updatedScoresLastTimeUpdate: GameMatch["scoresLastTimeUpdate"] = {
        ...match.scoresLastTimeUpdate,
        [matchPlayerInfo.id]: Date.now(),
      };
      const updatedMatch: GameMatch = {
        ...match,
        players: updatedPlayers,
        scores: updatedScores,
        scoresLastTimeUpdate: updatedScoresLastTimeUpdate,
      };
      return {
        matches: { ...state.matches, [matchId]: updatedMatch },
      };
    }),

  removeUserFromMatch: (playerId, matchId) =>
    set((state) => {
      const match = state.matches[matchId];
      if (!match) return {};
      if (!(playerId in match.players)) return {};

      const updatedPlayers: GameMatch["players"] = { ...match.players };
      const updatedScores: GameMatch["scores"] = { ...match.scores };
      const updatedScoresLastTimeUpdate: GameMatch["scoresLastTimeUpdate"] = { ...match.scoresLastTimeUpdate };

      if (playerId in updatedPlayers) {
        delete updatedPlayers[playerId];
      }
      if (playerId in updatedScores) {
        delete updatedScores[playerId];
      }
      if (playerId in updatedScoresLastTimeUpdate) {
        delete updatedScoresLastTimeUpdate[playerId];
      }
      const updatedMatch: GameMatch = {
        ...match,
        players: updatedPlayers,
        scores: updatedScores,
        scoresLastTimeUpdate: updatedScoresLastTimeUpdate,
      };
      return {
        matches: { ...state.matches, [matchId]: updatedMatch },
      };
    }),
}));
