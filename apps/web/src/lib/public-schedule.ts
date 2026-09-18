import { AssignmentRole, PartTopic } from "@jw/shared";

export type PublicScheduleScope =
  | "current-week"
  | "next-week"
  | "current-month"
  | "next-month";

export type PublicSlotView = {
  role: AssignmentRole;
  roleLabel: string;
  participantName: string | null;
};

export type PublicPartView = {
  partTypeLabel: string;
  title: string;
  topic: PartTopic;
  topicLabel: string;
  slots: PublicSlotView[];
};

export type PublicWeekView = {
  meetingDate: string;
  weekStartDate: string;
  parts: PublicPartView[];
};

export type PublicScheduleView = {
  congregationName: string;
  scope: PublicScheduleScope;
  title: string;
  yearMonth?: string;
  weeks: PublicWeekView[];
};

export type PublicScheduleSlug =
  | "esta-semana"
  | "proxima-semana"
  | "este-mes"
  | "proximo-mes";

export type PublicScheduleFetchResult =
  | PublicScheduleView
  | { disabled: true }
  | { error: string };

function getApiOrigin(): string {
  return process.env.API_ORIGIN ?? "http://localhost:3001";
}

export function formatPublicParticipantName(name: string | null | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : "—";
}

export async function fetchPublicSchedule(
  slug: PublicScheduleSlug,
): Promise<PublicScheduleFetchResult> {
  try {
    const res = await fetch(`${getApiOrigin()}/public/schedule/${slug}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      return { disabled: true };
    }

    if (!res.ok) {
      return { error: "Não foi possível carregar a programação." };
    }

    return (await res.json()) as PublicScheduleView;
  } catch {
    return { error: "Não foi possível carregar a programação." };
  }
}
