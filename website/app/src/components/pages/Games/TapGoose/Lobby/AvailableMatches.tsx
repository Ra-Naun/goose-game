import { useAvailableMatches } from "@/src/hooks/games/tapGoose/useAvailableMatches";
import { type GameMatch, type JoinToMatchPayload, MatchStatus } from "@/src/API/types/match.types";
import { matchService } from "@/src/services/matchService";
import { useUserStore } from "@/src/store/user/userStore";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { Button, ButtonWithOpacity } from "@/src/components/Goose-UI/Forms/Button";
import { UserNotificationService } from "@/src/services/userNotificationService";
import { UserRoleEnum } from "@/src/store/types";
import { loginPath, tapGooseMatchPath } from "@/src/router/paths";
import { useMemo, useState } from "react";
import { useTimeToStartLeft } from "@/src/hooks/games/tapGoose/useTimeToStartLeft";
import Modal from "@/src/components/Goose-UI/Modal";
import { CreateMatchForm } from "./CreateMatchForm";

type MatchItemProps = {
  match: GameMatch;
  handleJoinToMatch: (matchId: string) => Promise<void>;
  handleReturnToMatch: (matchId: string) => Promise<void>;
};

const MatchItem: React.FC<MatchItemProps> = (props) => {
  const { match, handleJoinToMatch, handleReturnToMatch } = props;
  const user = useUserStore((state) => state.user!);

  const isUserInThisMatch = useMemo(() => {
    if (!user) return false;
    return Object.values(match.players).some((player) => player.id === user.id);
  }, [match.players, user]);

  const timeLeft = useTimeToStartLeft(match);

  return (
    <li key={match.id} className="p-3 border border-gray-700 rounded hover:shadow cursor-pointer">
      <div className="flex justify-start items-center gap-3">
        <p className="font-semibold text-white">{match.title || "Матч"}</p>
        {match.status && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              match.status === MatchStatus.WAITING ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            }`}
          >
            {match.status === MatchStatus.WAITING
              ? `Ожидание ${timeLeft !== null ? timeLeft + "s" : ""}`
              : "В процессе"}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center">
        {match.status && (
          <p className="text-sm text-gray-300">
            Игроков: {Object.keys(match.players).length || 0}/{match.maxPlayers}
          </p>
        )}
        {isUserInThisMatch ? (
          <ButtonWithOpacity
            color="transparent"
            onClick={() => {
              handleReturnToMatch(match.id);
            }}
          >
            Вернуться
          </ButtonWithOpacity>
        ) : (
          <ButtonWithOpacity
            color="transparent"
            onClick={() => {
              handleJoinToMatch(match.id);
            }}
          >
            Присоедениться
          </ButtonWithOpacity>
        )}
      </div>
    </li>
  );
};

export const AvailableMatches: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const { data: availableMatches, isLoading: loadingAvailable, isError: errorAvailable } = useAvailableMatches();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // const isAdmin = !!user?.roles.includes(UserRoleEnum.ADMIN);

  const handleJoinToMatch = async (matchId: string) => {
    const payload: JoinToMatchPayload = {
      matchId,
    };
    try {
      await matchService.joinToMatchWS(payload);
      navigate({ to: tapGooseMatchPath, params: { matchId } });
    } catch (error) {
      UserNotificationService.showError(`Ошибка при присоединении к матчу: ${(error as Error).message}`);
    }
  };

  const handleReturnToMatch = async (matchId: string) => {
    navigate({ to: tapGooseMatchPath, params: { matchId } });
  };

  const handleMatchCreated = (matchId: string) => {
    setIsModalOpen(false);
    navigate({ to: tapGooseMatchPath, params: { matchId } });
  };

  if (!user) {
    return <Navigate to={loginPath} />;
  }

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white ">Доступные матчи</h2>
        {/* {isAdmin && ( */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          Создать матч
        </Button>
        {/* )} */}
      </div>
      {loadingAvailable && <p className="text-gray-400">Загрузка матчей...</p>}
      {errorAvailable && <p className="text-red-400">Ошибка загрузки матчей</p>}
      <ul className="scrollbar overflow-auto space-y-3">
        {availableMatches?.length === 0 && <li className="text-gray-400">Доступных матчей нет</li>}
        {availableMatches?.map((match) => (
          <MatchItem
            key={match.id}
            match={match}
            handleJoinToMatch={handleJoinToMatch}
            handleReturnToMatch={handleReturnToMatch}
          />
        ))}
      </ul>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateMatchForm onClose={() => setIsModalOpen(false)} onCreated={handleMatchCreated} />
      </Modal>
    </>
  );
};
