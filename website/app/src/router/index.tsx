import { createRouter } from "@tanstack/react-router";
import {
  lobbyRoute,
  loginRoute,
  matchHistoryRoute,
  matchRoute,
  profileRoute,
  registerRoute,
  rootRedirectRoute,
  rootRoute,
} from "./routerTree";

export const routeTree = rootRoute.addChildren([
  rootRedirectRoute,
  loginRoute,
  registerRoute,
  lobbyRoute,
  matchRoute,
  matchHistoryRoute,
  profileRoute,
]);

export const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
