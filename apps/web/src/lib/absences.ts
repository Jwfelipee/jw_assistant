export type AbsenceStatus = "ACTIVE" | "ENDED" | "CANCELLED";

export type AbsenceView = {
  id: string;
  participantId: string;
  startsOn: string;
  endsOn: string | null;
  status: AbsenceStatus;
  acknowledgedAt: string | null;
  hasJustification: boolean;
  createdAt: string;
  updatedAt: string;
  justification?: string | null;
};

export type AbsenceAlertView = AbsenceView & {
  participantName: string;
};

export type CreateAbsenceInput = {
  startsOn: string;
  endsOn?: string | null;
  justification?: string;
};

export const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  ACTIVE: "Ativa",
  ENDED: "Encerrada",
  CANCELLED: "Cancelada",
};

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

export async function listParticipantAbsences(
  participantId: string,
  revealJustification = false,
): Promise<AbsenceView[]> {
  const query = revealJustification ? "?revealJustification=true" : "";
  const res = await fetch(
    `/api/participants/${participantId}/absences${query}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AbsenceView[]>;
}

export async function createAbsence(
  participantId: string,
  input: CreateAbsenceInput,
): Promise<AbsenceView> {
  const res = await fetch(`/api/participants/${participantId}/absences`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startsOn: input.startsOn,
      endsOn: input.endsOn || null,
      justification: input.justification?.trim()
        ? input.justification.trim()
        : undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AbsenceView>;
}

export async function revealAbsenceJustification(
  absenceId: string,
): Promise<AbsenceView> {
  const res = await fetch(`/api/absences/${absenceId}/reveal`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AbsenceView>;
}

export async function acknowledgeAbsence(
  absenceId: string,
): Promise<AbsenceView> {
  const res = await fetch(`/api/absences/${absenceId}/acknowledge`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AbsenceView>;
}

export async function reactivateAbsence(
  absenceId: string,
): Promise<AbsenceView> {
  const res = await fetch(`/api/absences/${absenceId}/reactivate`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AbsenceView>;
}

export async function listAbsenceAlerts(): Promise<AbsenceAlertView[]> {
  const res = await fetch("/api/absences/alerts", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json() as Promise<AbsenceAlertView[]>;
}
