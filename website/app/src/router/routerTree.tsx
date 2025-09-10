// src/router.tsx
import { createRoute, createRootRoute, Outlet, Navigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
// Страницы
import { Login } from "@/src/pages/Auth/Login";
import { Register } from "@/src/pages/Auth/Register";
import { Lobby } from "@/src/pages/Games/TapGoose/Lobby";
import { Match } from "@/src/pages/Games/TapGoose/Match";
import { MatchHistory } from "@/src/pages/Games/TapGoose/MatchHistory";
import { Profile } from "@/src/pages/Profile";
import { NotFound } from "@/src/pages/NotFound";
import { RequireAuth, RequireNoAuth } from "./authWrappers";
import {
  getStartPagePath,
  loginPath,
  profilePath,
  registerPath,
  rootPath,
  tapGooseLobbyPath,
  tapGooseMatchHistoryPath,
  tapGooseMatchPath,
} from "./paths";

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
  path: tapGooseLobbyPath,
  component: () => (
    <RequireAuth>
      <Lobby />
    </RequireAuth>
  ),
});

export const matchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: tapGooseMatchPath,
  component: () => (
    <RequireAuth>
      <Match />
    </RequireAuth>
  ),
});

export const matchHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: tapGooseMatchHistoryPath,
  component: () => (
    <RequireAuth>
      <MatchHistory />
    </RequireAuth>
  ),
});
