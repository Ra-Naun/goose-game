import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/src/store/userStore";
import { Input } from "@/src/components/Goose-UI/Forms/Input";
import { Ripple } from "@/src/components/Goose-UI/Ripple";
import { Button } from "@/src/components/Goose-UI/Forms/Button";
import { ApiError } from "@/src/API/helpers/errors";
import { UserNotificationService } from "@/src/services/userNotificationService";
import { userService } from "@/src/services/userService";
import { Link } from "@/src/components/Goose-UI/Link";
import { getStartPagePath } from "@/src/router/pathes";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await userService.loginAndFetchUser(email, password);
      setUser(user);
      navigate({ to: getStartPagePath() });
    } catch (error) {
      let errorMessage = "";
      switch (true) {
        case error instanceof ApiError: {
          errorMessage = `Login failed: ${error.statusCode} - ${error.message}`;
          break;
        }
        default: {
          errorMessage = "Login failed: Unexpected error";
          break;
        }
      }
      UserNotificationService.showError(errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <>
      <section className="h-screen w-full flex justify-center items-center">
        <div className="h-full px-6 py-24">
          <div className="g-6 flex h-full flex-wrap items-center justify-center lg:justify-between">
            <div className="mb-12 md:mb-0 md:w-8/12 lg:w-6/12">
              <img src="/login.svg" className="w-full" alt="Phone image" />
            </div>

            <div className="md:w-8/12 lg:ml-6 lg:w-5/12">
              <h2 className="text-2xl mb-6 text-center text-gray-100">Login</h2>
              {error && <div className="mb-4 text-red-500">{error}</div>}
              <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <Input
                  type="email"
                  name="email"
                  label="Email address"
                  autoComplete="username"
                  size="lg"
                  className="mb-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  name="current-password"
                  label="Password"
                  autoComplete="current-password"
                  size="lg"
                  className="mb-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <Ripple className="w-full">
                  <Button type="submit" className="w-full text-white">
                    Sign in
                  </Button>
                </Ripple>
              </form>
              <p className="mt-4 text-center text-gray-300">
                Don&#39;t have an account?&nbsp;
                <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
