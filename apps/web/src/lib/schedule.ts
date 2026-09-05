import { AssignmentRole, PartTopic } from "@jw/shared";

export type SlotView = {
  id: string;
  role: AssignmentRole;
  participantId: string | null;
  participantName: string | null;
};

export type WeekPartView = {
  id: string;
  partTypeId: string;
  partTypeCode: string;
  partTypeLabel: string;
  title: string;
  sortOrder: number;
  topic: PartTopic;
  countsAsMinistryPractice: boolean;
  deletable: boolean;
  slots: SlotView[];
};

export type WeekView = {
  id: string;
  weekStartDate: string;
  meetingDate: string;
  parts: WeekPartView[];
};

export type MonthView = {
  id: string;
  yearMonth: string;
  year: number;
  month: number;
  bimester: { id: string; year: number; index: number };
  weeks: WeekView[];
  complete: boolean;
};

export type SoftAlert = {
  code: string;
  message: string;
};

export type AssignResult = {
  assigned: boolean;
  requiresConfirmation: boolean;
  alerts: SoftAlert[];
  slot: SlotView;
};

export type SuggestResult = {
  role: AssignmentRole;
  partId: string;
  suggestion: {
    id: string;
    name: string;
    sex: string;
    privilege: string;
    counter: number;
  } | null;
  candidatesCount: number;
};

export type EligibleParticipant = {
  id: string;
  name: string;
  sex: string;
  privilege: string;
  counter: number;
};

export type IneligibleVisible = {
  id: string;
  name: string;
  reasonCode: string;
  reason: string;
};

export type EligibleParticipantsResult = {
  slotId: string;
  role: AssignmentRole;
  eligible: EligibleParticipant[];
  ineligibleVisible: IneligibleVisible[];
};

export type NextMonthInfo = {
  yearMonth: string;
  exists: boolean;
  complete: boolean;
  openSlots: number | null;
  href: string;
};

export type HistoryItem = {
  id: string;
  role: AssignmentRole;
  participantId: string | null;
  participantName: string | null;
  partTitle: string;
  partTopic: PartTopic;
  partTypeLabel: string;
  meetingDate: string;
  weekStartDate: string;
  yearMonth: string;
};

export type HistoryResult = {
  total: number;
  page: number;
  limit: number;
  items: HistoryItem[];
};

export type HistoryQuery = {
  q?: string;
  from?: string;
  to?: string;
  participantId?: string;
  topic?: PartTopic;
  role?: AssignmentRole;
  page?: number;
  limit?: number;
};

export const ROLE_LABELS: Record<AssignmentRole, string> = {
  [AssignmentRole.TITULAR]: "Titular",
  [AssignmentRole.AJUDANTE]: "Ajudante",
  [AssignmentRole.DIRIGENTE]: "Dirigente",
  [AssignmentRole.LEITOR]: "Leitor",
};

export const TOPIC_LABELS: Record<PartTopic, string> = {
  [PartTopic.OUT_OF_TOPIC]: "Abertura e encerramento",
  [PartTopic.TREASURES]: "Tesouros da Palavra de Deus",
  [PartTopic.MINISTRY]: "Faça seu melhor no ministério",
  [PartTopic.CHRISTIAN_LIFE]: "Nossa vida cristã",
};

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

export function formatYearMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return yearMonth;
  const name = MONTH_NAMES[m - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${y}`;
}

export function formatDateBr(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

export function countOpenSlots(week: WeekView): number {
  return week.parts.reduce(
    (n, part) => n + part.slots.filter((s) => !s.participantId).length,
    0,
  );
}

export function countFilledSlots(week: WeekView): number {
  return week.parts.reduce(
    (n, part) => n + part.slots.filter((s) => s.participantId).length,
    0,
  );
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(" ");
    if (typeof data.message === "string" && data.message.length > 0) {
      return data.message;
    }
  } catch {
    /* ignore */
  }
  return "Não foi possível concluir a operação.";
}

export async function ensureMonth(yearMonth: string): Promise<MonthView> {
  const res = await fetch(`/api/schedule/months/${yearMonth}/ensure`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<MonthView>;
}

export async function getMonth(yearMonth: string): Promise<MonthView> {
  const res = await fetch(`/api/schedule/months/${yearMonth}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<MonthView>;
}

export async function fetchNextMonth(): Promise<NextMonthInfo> {
  const res = await fetch("/api/schedule/next-month", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<NextMonthInfo>;
}

export async function listEligibleParticipants(
  slotId: string,
): Promise<EligibleParticipantsResult> {
  const res = await fetch(`/api/slots/${slotId}/eligible-participants`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<EligibleParticipantsResult>;
}

export async function assignSlot(
  slotId: string,
  participantId: string,
  confirm = false,
): Promise<AssignResult> {
  const res = await fetch(`/api/slots/${slotId}/assign`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId, confirm }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<AssignResult>;
}

export async function unassignSlot(slotId: string): Promise<{ ok: true; slot: SlotView }> {
  const res = await fetch(`/api/slots/${slotId}/assign`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ ok: true; slot: SlotView }>;
}

export async function suggestForPart(
  partId: string,
  role: AssignmentRole,
  excludeParticipantId?: string,
): Promise<SuggestResult> {
  const qs = new URLSearchParams({ role });
  if (excludeParticipantId) {
    qs.set("excludeParticipantId", excludeParticipantId);
  }
  const res = await fetch(`/api/parts/${partId}/suggest?${qs}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<SuggestResult>;
}

export async function addWeekPart(
  weekId: string,
  partTypeId: string,
  title?: string,
): Promise<WeekPartView> {
  const res = await fetch(`/api/schedule/weeks/${weekId}/parts`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partTypeId,
      ...(title?.trim() ? { title: title.trim() } : {}),
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<WeekPartView>;
}

export async function removeWeekPart(partId: string): Promise<{ ok: true }> {
  const res = await fetch(`/api/schedule/parts/${partId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ ok: true }>;
}

export async function updatePartTitle(
  partId: string,
  title: string,
): Promise<{ id: string; title: string; partTypeLabel: string }> {
  const res = await fetch(`/api/schedule/parts/${partId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{
    id: string;
    title: string;
    partTypeLabel: string;
  }>;
}

export async function fetchAssignmentHistory(
  query: HistoryQuery = {},
): Promise<HistoryResult> {
  const qs = new URLSearchParams();
  if (query.q?.trim()) qs.set("q", query.q.trim());
  if (query.from) qs.set("from", query.from);
  if (query.to) qs.set("to", query.to);
  if (query.participantId) qs.set("participantId", query.participantId);
  if (query.topic) qs.set("topic", query.topic);
  if (query.role) qs.set("role", query.role);
  if (query.page) qs.set("page", String(query.page));
  if (query.limit) qs.set("limit", String(query.limit));
  const suffix = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`/api/assignments/history${suffix}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<HistoryResult>;
}
