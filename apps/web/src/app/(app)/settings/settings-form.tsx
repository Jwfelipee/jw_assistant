"use client";

import { FormEvent, useState } from "react";
import { Weekday } from "@jw/shared";
import {
  updateSettingsRequest,
  WEEKDAY_OPTIONS,
  type CongregationSettings,
} from "@/lib/settings";
import { btnPrimaryLg, btnRowClass, fieldClass } from "@/lib/ui";

type Props = {
  initial: CongregationSettings;
};

export function SettingsForm({ initial }: Props) {
  const [congregationName, setCongregationName] = useState(
    initial.congregationName,
  );
  const [meetingWeekday, setMeetingWeekday] = useState<Weekday>(
    initial.meetingWeekday,
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    const trimmed = congregationName.trim();
    if (!trimmed) {
      setError("Informe o nome da congregação.");
      return;
    }

    setPending(true);
    const result = await updateSettingsRequest({
      congregationName: trimmed,
      meetingWeekday,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setCongregationName(result.settings.congregationName);
    setMeetingWeekday(result.settings.meetingWeekday);
    setSaved(true);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="settings-stage flex w-full flex-col gap-[var(--space-5)]"
      noValidate
    >
      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor="congregationName" className="text-label">
          Nome da congregação
        </label>
        <input
          id="congregationName"
          name="congregationName"
          type="text"
          required
          maxLength={200}
          value={congregationName}
          onChange={(e) => {
            setCongregationName(e.target.value);
            setSaved(false);
          }}
          className={`${fieldClass} py-[var(--space-3)] text-[var(--text-base)]`}
        />
      </div>

      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor="meetingWeekday" className="text-label">
          Dia da reunião
        </label>
        <select
          id="meetingWeekday"
          name="meetingWeekday"
          value={meetingWeekday}
          onChange={(e) => {
            setMeetingWeekday(e.target.value as Weekday);
            setSaved(false);
          }}
          className={`${fieldClass} py-[var(--space-3)] text-[var(--text-base)]`}
        >
          {WEEKDAY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-[var(--text-sm)] leading-relaxed text-[var(--muted)]">
          A data no S-140 usa este dia dentro da semana (início na segunda).
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {saved ? (
        <p
          role="status"
          className="text-[var(--text-sm)] text-[var(--accent)]"
        >
          Configurações salvas.
        </p>
      ) : null}

      <div className={btnRowClass}>
        <button type="submit" disabled={pending} className={btnPrimaryLg}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
