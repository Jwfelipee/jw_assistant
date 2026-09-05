import {
  Privilege,
  RolePreference,
  Sex,
  privilegesForSex,
} from "@jw/shared";

export type ParticipantCounters = {
  titular: number;
  ajudante: number;
  dirigente: number;
  leitor: number;
  ministryPractice: number;
};

export type AssociationView = {
  id: string;
  otherParticipantId: string;
  otherParticipantName: string;
  reason: string;
  createdAt: string;
};

export type ParticipantListItem = {
  id: string;
  name: string;
  phone: string | null;
  sex: Sex;
  privilege: Privilege;
  rolePreference: RolePreference;
  counters: ParticipantCounters;
};

export type ParticipantDetail = ParticipantListItem & {
  associations: AssociationView[];
  createdAt: string;
  updatedAt: string;
};

export type AssignmentHistoryItem = {
  id: string;
  role: string;
  meetingDate: string;
  weekStartDate: string;
  partTitle: string;
  partTopic: string;
  partTypeLabel: string;
};

export type ParticipantInput = {
  name: string;
  phone?: string | null;
  sex: Sex;
  privilege: Privilege;
  rolePreference: RolePreference;
};

export const SEX_LABELS: Record<Sex, string> = {
  [Sex.MALE]: "Homem",
  [Sex.FEMALE]: "Mulher",
};

export const PRIVILEGE_LABELS: Record<Privilege, string> = {
  [Privilege.ELDER]: "Ancião",
  [Privilege.MINISTERIAL_SERVANT]: "Servo ministerial",
  [Privilege.REGULAR_PIONEER]: "Pioneiro regular",
  [Privilege.REGULAR_PIONEER_SISTER]: "Pioneira regular",
  [Privilege.BAPTIZED]: "Batizado",
  [Privilege.PUBLISHER]: "Publicador",
};

export const ROLE_PREFERENCE_LABELS: Record<RolePreference, string> = {
  [RolePreference.ANY]: "Qualquer papel",
  [RolePreference.PRINCIPAL_ONLY]: "Só titular / dirigente",
  [RolePreference.ASSISTANT_ONLY]: "Só ajudante",
};

export function privilegesForSexLabel(sex: Sex): Privilege[] {
  return [...privilegesForSex(sex)];
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as {
      message?: string | string[];
    };
    if (Array.isArray(data.message)) {
      return data.message.join(" ");
    }
    if (typeof data.message === "string" && data.message.length > 0) {
      return data.message;
    }
  } catch {
    /* ignore */
  }
  return "Não foi possível concluir a operação.";
}

export async function listParticipants(): Promise<ParticipantListItem[]> {
  const res = await fetch("/api/participants", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<ParticipantListItem[]>;
}

export async function getParticipant(id: string): Promise<ParticipantDetail> {
  const res = await fetch(`/api/participants/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<ParticipantDetail>;
}

export async function createParticipant(
  input: ParticipantInput,
): Promise<ParticipantDetail> {
  const res = await fetch("/api/participants", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      phone: input.phone || undefined,
      sex: input.sex,
      privilege: input.privilege,
      rolePreference: input.rolePreference,
    }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<ParticipantDetail>;
}

export async function updateParticipant(
  id: string,
  input: ParticipantInput,
): Promise<ParticipantDetail> {
  const res = await fetch(`/api/participants/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      phone: input.phone?.trim() ? input.phone : null,
      sex: input.sex,
      privilege: input.privilege,
      rolePreference: input.rolePreference,
    }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<ParticipantDetail>;
}

export async function listParticipantAssignments(
  id: string,
): Promise<AssignmentHistoryItem[]> {
  const res = await fetch(`/api/participants/${id}/assignments`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AssignmentHistoryItem[]>;
}

export async function createAssociation(
  participantId: string,
  otherParticipantId: string,
  reason: string,
): Promise<AssociationView> {
  const res = await fetch(`/api/participants/${participantId}/associations`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otherParticipantId, reason }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AssociationView>;
}

export async function deleteAssociation(
  participantId: string,
  associationId: string,
): Promise<void> {
  const res = await fetch(
    `/api/participants/${participantId}/associations/${associationId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}
