export type PublicLinkSettingsKey =
  | "publicLinkCurrentWeekEnabled"
  | "publicLinkNextWeekEnabled"
  | "publicLinkCurrentMonthEnabled"
  | "publicLinkNextMonthEnabled";

export type PublicScheduleLink = {
  key: PublicLinkSettingsKey;
  label: string;
  path: string;
  description: string;
};

export const PUBLIC_SCHEDULE_LINKS: PublicScheduleLink[] = [
  {
    key: "publicLinkCurrentWeekEnabled",
    label: "Esta semana",
    path: "/esta-semana",
    description: "Designações da semana atual",
  },
  {
    key: "publicLinkNextWeekEnabled",
    label: "Próxima semana",
    path: "/proxima-semana",
    description: "Designações da semana seguinte",
  },
  {
    key: "publicLinkCurrentMonthEnabled",
    label: "Este mês",
    path: "/este-mes",
    description: "Programação do mês atual",
  },
  {
    key: "publicLinkNextMonthEnabled",
    label: "Próximo mês",
    path: "/proximo-mes",
    description: "Programação do mês seguinte",
  },
];
