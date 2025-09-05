import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/src/store/userStore";
import { userService } from "@/src/services/userService";
import { STALE_TIME } from "@/src/config/tanQuery";

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
  });

  if (query.error) {
    setUser(null);
  }

  return {
    loading: query.isLoading,
    error: query.error,
    isAuthenticated: !!user,
    refetch: query.refetch,
  };
}
