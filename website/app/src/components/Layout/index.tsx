import React from "react";
import type { User } from "@/src/store/types";
import { UserAvatar } from "./UserAvatar";
import { GoToHome } from "./GoToHome";
import { GameListNav } from "./GameListNav";
import { useWebSocketEventHandlers } from "@/src/hooks/useWebSocketEventHandlers";
import { useIAMOnline } from "@/src/hooks/useIAMOnline";
import { useConnectWebSocket } from "@/src/hooks/useConnectWebSocket";

type LayoutProps = {
  user: User;
  logout: () => void;
};

export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({ user, logout, children }) => {
  useConnectWebSocket();
  useWebSocketEventHandlers();
  useIAMOnline();

  return (
    <div className="w-full min-h-screen flex flex-col">
      <header className="w-full bg-gray-900 shadow-md flex items-center justify-center relative">
        <div className="absolute left-0 top-0 w-full h-16 bg-gradient-to-b from-gray-800/70 to-transparent pointer-events-none z-1"></div>
        <div className="container w-full flex items-center justify-between py-3 ">
          <GoToHome />
          <GameListNav />
          <UserAvatar user={user} logout={logout} />
        </div>
      </header>

      <main className="w-full flex justify-center">
        <div className="container w-full flex-1 ">{children}</div>
      </main>
    </div>
  );
};
