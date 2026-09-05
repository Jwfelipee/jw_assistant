import { Weekday } from "@jw/shared";

export type CongregationSettings = {
  congregationName: string;
  meetingWeekday: Weekday;
};

export async function fetchSettings(): Promise<CongregationSettings | null> {
  const res = await fetch("/api/settings", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as CongregationSettings;
}

export async function updateSettingsRequest(
  payload: CongregationSettings,
): Promise<
  | { ok: true; settings: CongregationSettings }
  | { ok: false; message: string }
> {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 400) {
      return {
        ok: false,
        message: "Revise o nome e o dia da reunião antes de salvar.",
      };
    }
    return {
      ok: false,
      message: "Não foi possível salvar. Tente de novo.",
    };
  }

  const settings = (await res.json()) as CongregationSettings;
  return { ok: true, settings };
}

export const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
  { value: Weekday.MONDAY, label: "Segunda-feira" },
  { value: Weekday.TUESDAY, label: "Terça-feira" },
  { value: Weekday.WEDNESDAY, label: "Quarta-feira" },
  { value: Weekday.THURSDAY, label: "Quinta-feira" },
  { value: Weekday.FRIDAY, label: "Sexta-feira" },
  { value: Weekday.SATURDAY, label: "Sábado" },
  { value: Weekday.SUNDAY, label: "Domingo" },
];
