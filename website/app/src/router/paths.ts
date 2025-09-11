export const tapGooseLobbyPath = "/games/tap-goose/lobby" as const;
export const tapGooseMatchPath = "/games/tap-goose/match/$matchId" as const;
export const tapGooseMatchHistoryPath = "/games/tap-goose/match/$matchId/history" as const;

export const profilePath = "/profile" as const;
export const loginPath = "/login" as const;
export const registerPath = "/register" as const;
export const rootPath = "/" as const;

// Здесь можно расширить логику построения путей, если потребуется.
// Например, если добавить несколько игр, и главное меню, где можно выбрать в какую игру поиграть.
export const getStartPagePath = () => tapGooseLobbyPath;
