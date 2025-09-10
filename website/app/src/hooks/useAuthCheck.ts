import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/src/store/userStore";
import { userService } from "@/src/services/userService";
import { STALE_TIME } from "@/src/config/tanQuery";
import { useMemo } from "react";

export function useAuthCheck() {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    },
    enabled: !user,
    staleTime: STALE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (query.error) {
    setUser(null);
  }

  return useMemo(
    () =>
      ({
        loading: query.isLoading,
        error: query.error,
        isAuthenticated: !!user,
        user,
        refetch: query.refetch,
      }) as Readonly<{
        loading: typeof query.isLoading;
        error: typeof query.error;
        isAuthenticated: boolean;
        refetch: typeof query.refetch;
      }> &
      (
        | Readonly<{
          isAuthenticated: true;
          user: NonNullable<typeof user>;
        }>
        | Readonly<{
          isAuthenticated: false;
          user: null;
        }>
      ),
    [query.isLoading, query.error, user, query.refetch]
  );
}
