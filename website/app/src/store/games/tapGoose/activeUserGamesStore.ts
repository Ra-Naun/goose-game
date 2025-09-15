import { create } from "zustand";
import {
  MatchStatus,
  type ActiveMatchIsEnded,
  type GameMatch,
  type MatchPlayerInfo,
} from "@/src/API/types/match.types";
import type { UpdateGameMatchDataFromServer } from "../../types";

type State = {
  match: GameMatch | ActiveMatchIsEnded | null;
  getMatch: () => GameMatch | ActiveMatchIsEnded | null;
  setMatch: (match: GameMatch | ActiveMatchIsEnded) => void;
  removeMatch: () => void;
  updateMatchState: (matchUpdate: UpdateGameMatchDataFromServer) => void;
  addUserToMatch: (matchPlayerInfo: MatchPlayerInfo) => void;
  removeUserFromMatch: (playerId: string) => void;
};

export const useActiveUserGameStore = create<State>((set, get) => ({
  match: null,
  getMatch: () => get().match,
  setMatch: (match) => set({ match }),
  removeMatch: () => set({ match: null }),

  updateMatchState: (matchUpdate) =>
    set((state) => {
      const existing = state.match;
      if (!existing || existing.status === MatchStatus.FINISHED) return {};
      const updatedMatch = { ...existing, ...matchUpdate };
      return {
        match: updatedMatch,
      };
    }),

  addUserToMatch: (matchPlayerInfo) =>
    set((state) => {
      const match = state.match;
      if (!match || match.status === MatchStatus.FINISHED) return {};
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
        match: updatedMatch,
      };
    }),

  removeUserFromMatch: (playerId) =>
    set((state) => {
      const match = state.match;
      if (!match || match.status === MatchStatus.FINISHED) return {};
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
        match: updatedMatch,
      };
    }),
}));
