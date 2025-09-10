import { useState } from "react";
import { matchService } from "@/src/services/matchService";
import { UserNotificationService } from "@/src/services/userNotificationService";
import { Button } from "@/src/components/Goose-UI/Forms/Button";
import {
  DEFAULT_MATCH_TILE,
  DEFAULT_MAX_PLAYERS_IN_MATCH,
  getMatchDurationDefaultValue,
  getTimeToStartDefaultValue,
  MATCH_DURATION_OPTIONS,
  TIME_TO_START_OPTIONS,
} from "../config";

export interface CreateMatchPayload {
  title?: string;
  maxPlayers?: number;
  cooldownMs?: number;
  matchDurationSeconds?: number;
}

interface CreateMatchFormProps {
  onClose: () => void;
  onCreated: (matchId: string) => void;
  defaultPayload?: CreateMatchPayload;
}

export const CreateMatchForm: React.FC<CreateMatchFormProps> = ({
  onClose,
  onCreated,
  defaultPayload = {
    title: DEFAULT_MATCH_TILE,
    maxPlayers: DEFAULT_MAX_PLAYERS_IN_MATCH,
    cooldownMs: getTimeToStartDefaultValue() || 30 * 1000,
    matchDurationSeconds: getMatchDurationDefaultValue() || 60,
  },
}) => {
  const [formData, setFormData] = useState<CreateMatchPayload>(defaultPayload);
  const [isCreating, setIsCreating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    let parsedValue;

    switch (true) {
      case name === "title": {
        parsedValue = value;
        break;
      }

      case ["cooldownMs", "matchDurationSeconds"].includes(name): {
        parsedValue = Number(value);
        break;
      }

      case name === "maxPlayers": {
        parsedValue = Math.min(Math.max(0, Number(value)), 100);
        break;
      }

      default:
        parsedValue = value;
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    setIsCreating(true);
    try {
      const matchId = await matchService.createMatchWS(formData);
      onCreated(matchId);
    } catch (error) {
      UserNotificationService.showError(`Ошибка при создании матча: ${(error as Error).message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-gray-100">
      <h3 className="text-lg font-semibold mb-4 ">Создание нового матча</h3>

      <label className="block mb-2">
        Название матча
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 w-full border border-gray-500 rounded px-3 py-2"
          maxLength={50}
          required
          autoFocus
        />
      </label>

      <label className="block mb-2">
        Время до начала матча
        <select
          name="cooldownMs"
          value={formData.cooldownMs}
          onChange={handleChange}
          className="mt-1 w-full border border-gray-500 rounded px-3 py-2"
          required
        >
          {TIME_TO_START_OPTIONS.map((option) => (
            <option className="bg-gray-800" key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Длительность матча (секунды)
        <select
          name="matchDurationSeconds"
          value={formData.matchDurationSeconds}
          onChange={handleChange}
          className="mt-1 w-full border border-gray-500 rounded px-3 py-2"
          required
        >
          {MATCH_DURATION_OPTIONS.map((option) => (
            <option className="bg-gray-800" key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-4">
        Максимальное количество игроков
        <input
          type="number"
          name="maxPlayers"
          value={formData.maxPlayers}
          onChange={handleChange}
          className="mt-1 w-full border border-gray-500 rounded px-3 py-2"
          min={2}
          max={100}
          required
        />
      </label>

      <div className="flex justify-between gap-3">
        <Button type="button" color="danger" onClick={onClose} disabled={isCreating}>
          Отмена
        </Button>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Создаётся..." : "Создать матч"}
        </Button>
      </div>
    </form>
  );
};
