export const tapGooseLobbyPaths = "/games/tap-goose/lobby";
export const tapGooseMatchPaths = "/games/tap-goose/match/$matchId";
export const tapGooseMatchHistoryPaths = "/games/tap-goose/match/$matchId/history";
export const profilePath = "/profile";
export const loginPath = "/login";
export const registerPath = "/register";
export const rootPath = "/";

export const getTapGooseLobbyPath = () => "/games/tap-goose/lobby";
export const getStartPagePath = () => getTapGooseLobbyPath();
export const getTapGooseMatchPath = (matchId: string) => `/games/tap-goose/match/${matchId}`;
export const getTapGooseMatchHistoryPath = (matchId: string) => `/games/tap-goose/match/${matchId}/history`;
export const getProfilePath = () => "/profile";
export const getLoginPath = () => "/login";
export const getRegisterPath = () => "/register";
export const getRootPath = () => "/";
