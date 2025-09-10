export const tapGooseLobbyPath = "/games/tap-goose/lobby";
export const tapGooseMatchPath = "/games/tap-goose/match/$matchId";
export const tapGooseMatchHistoryPath = "/games/tap-goose/match/$matchId/history";

export const profilePath = "/profile";
export const loginPath = "/login";
export const registerPath = "/register";
export const rootPath = "/";

// Здесь можно расширить логику построения путей, если потребуется.
// Например, если добавить несколько игр, и главное меню, где можно выбрать в какую игру поиграть.
export const getStartPagePath = () => tapGooseLobbyPath;
