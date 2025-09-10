import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/src/components/Goose-UI/Forms/Input";
import { Ripple } from "@/src/components/Goose-UI/Ripple";
import { Button } from "@/src/components/Goose-UI/Forms/Button";
import { useUserStore } from "@/src/store/userStore";
import { UserNotificationService } from "@/src/services/userNotificationService";
import { userService } from "@/src/services/userService";
import { ApiError } from "@/src/API/helpers/errors";
import { Link } from "@/src/components/Goose-UI/Link";
import { getStartPagePath } from "@/src/router/paths";

export const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await userService.registerAndFetchUser(email, username, password);
      setUser(user);
      UserNotificationService.showSuccess("Registration successful");
      navigate({ to: getStartPagePath() });
    } catch (error) {
      let errorMessage = "";
      switch (true) {
        case error instanceof ApiError: {
          errorMessage = `Registration failed: ${error.statusCode} - ${error.message}`;
          break;
        }
        default: {
          errorMessage = "Registration failed: Unexpected error";
          break;
        }
      }
      UserNotificationService.showError(errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <section className="h-screen">
      <div className="container h-full px-6 py-24">
        <div className="g-6 flex h-full flex-wrap items-center justify-center lg:justify-between">
          <div className="mb-12 md:mb-0 md:w-8/12 lg:w-6/12">
            <img src="/login.svg" className="w-full" alt="Phone image" />
          </div>
          <div className="md:w-8/12 lg:ml-6 lg:w-5/12">
            <h2 className="text-2xl mb-6 text-center text-gray-100">Register</h2>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <Input
                type="email"
                label="Email address"
                autoComplete="email"
                size="lg"
                className="mb-6 px-3 py-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="text"
                label="Username"
                autoComplete="username"
                size="lg"
                className="mb-6 px-3 py-2 border rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                autoComplete="current-password"
                size="lg"
                className="mb-6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Ripple className="w-full">
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </Ripple>
            </form>
            <p className="mt-4 text-center text-gray-300">
              Already have an account?&nbsp;
              <Link to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
