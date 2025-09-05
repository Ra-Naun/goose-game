// src/router.tsx
import { createRoute, createRootRoute, Outlet, Navigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
// Страницы
import { Login } from "@/src/pages/Auth/Login";
import { Register } from "@/src/pages/Auth/Register";
import { Lobby } from "@/src/pages/Games/TapGoose/Lobby";
import { Match } from "@/src/pages/Games/TapGoose/Match/Match";
import { MatchHistory } from "@/src/pages/Games/TapGoose/Match/MatchHistory";
import { Profile } from "@/src/pages/Profile";
import { NotFound } from "@/src/pages/NotFound";
import { RequireAuth, RequireNoAuth } from "./authWrappers";
import {
  getStartPagePath,
  loginPath,
  profilePath,
  registerPath,
  rootPath,
  tapGooseLobbyPaths,
  tapGooseMatchHistoryPaths,
  tapGooseMatchPaths,
} from "./pathes";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: NotFound,
});

export const rootRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: rootPath,
  component: () => <Navigate to={getStartPagePath()} replace />,
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: loginPath,
  component: () => (
    <RequireNoAuth>
      <Login />
    </RequireNoAuth>
  ),
});

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: profilePath,
  component: () => (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  ),
});

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: registerPath,
  component: () => (
    <RequireNoAuth>
      <Register />
    </RequireNoAuth>
  ),
});

export const lobbyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: tapGooseLobbyPaths,
  component: () => (
    <RequireAuth>
      <Lobby />
    </RequireAuth>
  ),
});

export const matchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: tapGooseMatchPaths,
  component: () => (
    <RequireAuth>
      <Match />
    </RequireAuth>
  ),
});

export const matchHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: tapGooseMatchHistoryPaths,
  component: () => (
    <RequireAuth>
      <MatchHistory />
    </RequireAuth>
  ),
});
