import { useEffect } from "react";
import { Navigate, useNavigate } from "@tanstack/react-router";

import { useAuthCheck } from "@/src/hooks/user/useAuthCheck";
import { Loading } from "@/src/components/Goose-UI/Loading";
import { UserNotificationService } from "@/src/services/userNotificationService";
import { Layout } from "@/src/components/Layout";
import { userService } from "@/src/services/userService";
import { loginPath, getStartPagePath } from "./paths";

type AuthWrapperProps = {
  children: React.ReactNode;
  isAllowed: boolean;
  redirectTo: string;
};

const AuthWrapper = ({ children, isAllowed, redirectTo }: AuthWrapperProps) => {
  const { loading } = useAuthCheck();

  if (loading) return <Loading className="min-h-screen" />;

  if (!isAllowed) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
};

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, error, user } = useAuthCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (error?.message) {
      UserNotificationService.showError(error.message);
    }
  }, [error?.message]);

  return (
    <AuthWrapper isAllowed={isAuthenticated} redirectTo="/login">
      {isAuthenticated && (
        <Layout
          user={user}
          logout={async () => {
            try {
              await userService.logout();
              navigate({ to: loginPath });
            } catch (error) {
              UserNotificationService.showError(`Logout failed, please try again. Error: ${(error as Error).message}`);
            }
          }}
        >
          {children}
        </Layout>
      )}
    </AuthWrapper>
  );
};

export const RequireNoAuth = ({ children }: { children: React.ReactNode }) => {
  const redirectTo = getStartPagePath();
  return (
    <AuthWrapper isAllowed={!useAuthCheck().isAuthenticated} redirectTo={redirectTo}>
      {children}
    </AuthWrapper>
  );
};
