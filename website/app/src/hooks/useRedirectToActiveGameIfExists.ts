import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "../store/userStore";
import { useAuthCheck } from "./useAuthCheck";
import { useEffect } from "react";
import { getTapGooseMatchPath } from "../router/pathes";

export const useRedirectToActiveGameIfExists = () => {
  // TODO IN PROGRESS
  const { isAuthenticated } = useAuthCheck();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated && user?.activeGameId) {
      // TODO можно добавить проверку, если в будущем будет несколько игр:
      navigate({ to: getTapGooseMatchPath(user.activeGameId) });
    }
  }, [isAuthenticated, user?.activeGameId, navigate]);
};
