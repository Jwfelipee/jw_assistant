import {
  PartTopic,
  Privilege,
  Sex,
  SlotMode,
  type AssignmentRole,
} from "@jw/shared";

export type PartTypeDto = {
  id: string;
  code: string;
  topic: PartTopic;
  label: string;
  allowedSexes: Sex[];
  slotMode: SlotMode;
  roles: AssignmentRole[];
  privileges: Privilege[];
  allowedPrivileges: Privilege[];
  isSystem: boolean;
  deletable: boolean;
  countsAsMinistryPractice: boolean;
  defaultSortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePartTypeInput = {
  topic: PartTopic;
  label: string;
  allowedSexes: Sex[];
  slotMode: SlotMode;
  privileges?: Privilege[];
  countsAsMinistryPractice?: boolean;
};

export type UpdatePartTypeInput = {
  label?: string;
  allowedSexes?: Sex[];
  slotMode?: SlotMode;
  privileges?: Privilege[];
  countsAsMinistryPractice?: boolean;
};

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(" ");
    if (typeof data.message === "string") return data.message;
  } catch {
    /* ignore */
  }
  return "Não foi possível concluir a operação.";
}

export async function listPartTypes(
  topic?: PartTopic,
): Promise<PartTypeDto[]> {
  const qs = topic ? `?topic=${encodeURIComponent(topic)}` : "";
  const res = await fetch(`/api/catalog/part-types${qs}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<PartTypeDto[]>;
}

export async function createPartType(
  input: CreatePartTypeInput,
): Promise<PartTypeDto> {
  const res = await fetch("/api/catalog/part-types", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<PartTypeDto>;
}

export async function updatePartType(
  id: string,
  input: UpdatePartTypeInput,
): Promise<PartTypeDto> {
  const res = await fetch(`/api/catalog/part-types/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<PartTypeDto>;
}

export async function deletePartType(id: string): Promise<void> {
  const res = await fetch(`/api/catalog/part-types/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}
