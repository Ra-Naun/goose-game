export const DEFAULT_MATCH_TILE = "Новый матч";

export const DEFAULT_MAX_PLAYERS_IN_MATCH = 10;

export type TimeToStartOption = {
  title: string;
  value: number;
  default?: true;
};

export const TIME_TO_START_OPTIONS: Array<TimeToStartOption> = [
  {
    title: "10 секунд",
    value: 10 * 1000,
  },
  {
    title: "30 секунд",
    value: 30 * 1000,
    default: true,
  },
  {
    title: "1 минута",
    value: 60 * 1000,
  },
  {
    title: "5 минут",
    value: 5 * 60 * 1000,
  },
  {
    title: "15 минут",
    value: 15 * 60 * 1000,
  },
  {
    title: "30 минут",
    value: 30 * 60 * 1000,
  },
];

export const getTimeToStartDefaultValue = () => TIME_TO_START_OPTIONS.find((item) => item.default)?.value;

export type MatchDurationOption = {
  title: string;
  value: number;
  default?: true;
};

export const MATCH_DURATION_OPTIONS: Array<MatchDurationOption> = [
  {
    title: "30 секунд",
    value: 30,
  },
  {
    title: "1 минута",
    value: 60,
    default: true,
  },
  {
    title: "3 минуты",
    value: 3 * 60,
  },
  {
    title: "5 минут",
    value: 5 * 60,
  },
  {
    title: "10 минут",
    value: 10 * 60,
  },
];

export const getMatchDurationDefaultValue = () => MATCH_DURATION_OPTIONS.find((item) => item.default)?.value;
