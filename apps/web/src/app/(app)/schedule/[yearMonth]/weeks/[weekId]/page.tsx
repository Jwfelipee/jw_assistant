"use client";

import Link from "next/link";
import { FormEvent, use, useCallback, useEffect, useMemo, useState } from "react";
import { AssignmentRole, PartTopic } from "@jw/shared";
import { ParticipantPicker } from "@/components/participant-picker";
import { listPartTypes, type PartTypeDto } from "@/lib/catalog";
import {
  ROLE_LABELS,
  TOPIC_LABELS,
  addWeekPart,
  assignSlot,
  ensureMonth,
  formatDateBr,
  formatYearMonthLabel,
  removeWeekPart,
  suggestForPart,
  unassignSlot,
  updatePartTitle,
  type SoftAlert,
  type WeekPartView,
  type WeekView,
} from "@/lib/schedule";

type PageProps = {
  params: Promise<{ yearMonth: string; weekId: string }>;
};

const TOPIC_ORDER: PartTopic[] = [
  PartTopic.OUT_OF_TOPIC,
  PartTopic.TREASURES,
  PartTopic.MINISTRY,
  PartTopic.CHRISTIAN_LIFE,
];

const fieldClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)]";

const btnPrimary =
  "rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60";

const btnGhost =
  "rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60";

type PendingConfirm = {
  slotId: string;
  participantId: string;
  alerts: SoftAlert[];
};

export default function WeekSchedulePage({ params }: PageProps) {
  const { yearMonth, weekId } = use(params);
  const [week, setWeek] = useState<WeekView | null>(null);
  const [fsmTypes, setFsmTypes] = useState<PartTypeDto[]>([]);
  const [nvcTypes, setNvcTypes] = useState<PartTypeDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busySlotId, setBusySlotId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null,
  );
  const [suggestionNote, setSuggestionNote] = useState<string | null>(null);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [partTitleError, setPartTitleError] = useState<string | null>(null);
  const [savingPartId, setSavingPartId] = useState<string | null>(null);
  const [addTopic, setAddTopic] = useState<PartTopic.MINISTRY | PartTopic.CHRISTIAN_LIFE>(
    PartTopic.MINISTRY,
  );
  const [addPartTypeId, setAddPartTypeId] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addPending, setAddPending] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const [month, fsm, nvc] = await Promise.all([
      ensureMonth(yearMonth),
      listPartTypes(PartTopic.MINISTRY),
      listPartTypes(PartTopic.CHRISTIAN_LIFE),
    ]);
    const found = month.weeks.find((w) => w.id === weekId) ?? null;
    if (!found) {
      throw new Error("Semana não encontrada neste mês.");
    }
    setWeek(found);
    setFsmTypes(fsm);
    setNvcTypes(nvc.filter((t) => t.code !== "ESTUDO_BIBLICO"));
  }, [yearMonth, weekId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar a semana.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const addableTypes = useMemo(() => {
    return addTopic === PartTopic.MINISTRY ? fsmTypes : nvcTypes;
  }, [addTopic, fsmTypes, nvcTypes]);

  useEffect(() => {
    if (addableTypes.length === 0) {
      setAddPartTypeId("");
      return;
    }
    if (!addableTypes.some((t) => t.id === addPartTypeId)) {
      setAddPartTypeId(addableTypes[0]!.id);
    }
  }, [addableTypes, addPartTypeId]);

  const partsByTopic = useMemo(() => {
    if (!week) return [];
    return TOPIC_ORDER.map((topic) => ({
      topic,
      parts: week.parts.filter((p) => p.topic === topic),
    })).filter((g) => g.parts.length > 0);
  }, [week]);

  async function applyAssign(
    slotId: string,
    participantId: string,
    confirm: boolean,
  ): Promise<"ok" | "confirm" | "error"> {
    setBusySlotId(slotId);
    setError(null);
    setSuggestionNote(null);
    try {
      const result = await assignSlot(slotId, participantId, confirm);
      if (result.requiresConfirmation) {
        setPendingConfirm({
          slotId,
          participantId,
          alerts: result.alerts,
        });
        return "confirm";
      }
      setPendingConfirm(null);
      await load();
      return "ok";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível designar.",
      );
      return "error";
    } finally {
      setBusySlotId(null);
    }
  }

  async function onConfirmAlerts() {
    if (!pendingConfirm) return;
    await applyAssign(
      pendingConfirm.slotId,
      pendingConfirm.participantId,
      true,
    );
  }

  async function onUnassign(slotId: string) {
    setBusySlotId(slotId);
    setError(null);
    try {
      await unassignSlot(slotId);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível remover.",
      );
    } finally {
      setBusySlotId(null);
    }
  }

  async function onSuggest(part: WeekPartView, role: AssignmentRole, slotId: string) {
    setBusySlotId(slotId);
    setError(null);
    setSuggestionNote(null);
    try {
      const currentAssignee = part.slots.find((s) => s.id === slotId)?.participantId;
      const result = await suggestForPart(
        part.id,
        role,
        currentAssignee ?? undefined,
      );
      if (!result.suggestion) {
        setSuggestionNote("Nenhum participante elegível encontrado.");
        return;
      }
      const assignResult = await applyAssign(
        slotId,
        result.suggestion.id,
        false,
      );
      if (assignResult !== "error") {
        setSuggestionNote(`Sugerido: ${result.suggestion.name}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível sugerir.",
      );
    } finally {
      setBusySlotId(null);
    }
  }

  function startEditingPart(part: WeekPartView) {
    setEditingPartId(part.id);
    setEditTitle(part.title ?? "");
    setPartTitleError(null);
  }

  function cancelEditingPart() {
    setEditingPartId(null);
    setEditTitle("");
    setPartTitleError(null);
  }

  async function savePartTitle(partId: string) {
    setSavingPartId(partId);
    setPartTitleError(null);
    try {
      const updated = await updatePartTitle(partId, editTitle);
      setWeek((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          parts: prev.parts.map((p) =>
            p.id === partId ? { ...p, title: updated.title } : p,
          ),
        };
      });
      setEditingPartId(null);
      setEditTitle("");
    } catch (err) {
      setPartTitleError(
        err instanceof Error ? err.message : "Não foi possível salvar o tema.",
      );
    } finally {
      setSavingPartId(null);
    }
  }

  async function onRemovePart(partId: string) {
    setError(null);
    try {
      await removeWeekPart(partId);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível remover a parte.",
      );
    }
  }

  async function onAddPart(event: FormEvent) {
    event.preventDefault();
    if (!week || !addPartTypeId) return;
    setAddPending(true);
    setError(null);
    try {
      await addWeekPart(week.id, addPartTypeId, addTitle || undefined);
      setAddTitle("");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível adicionar a parte.",
      );
    } finally {
      setAddPending(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[50dvh] items-center justify-center px-[var(--page-pad)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-6)] px-[var(--page-pad)] py-[var(--space-8)]">
      <header className="page-rise border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">
          <Link
            href={`/schedule/${yearMonth}`}
            className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {formatYearMonthLabel(yearMonth)}
          </Link>
        </p>
        <h1 className="mt-[var(--space-1)] font-[family-name:var(--font-brand)] text-[var(--text-xl)] font-semibold text-[var(--ink)]">
          {week
            ? `Reunião ${formatDateBr(week.meetingDate)}`
            : "Semana"}
        </h1>
        {week ? (
          <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
            Semana a partir de {formatDateBr(week.weekStartDate)}
          </p>
        ) : null}
      </header>

      {error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {suggestionNote ? (
        <p className="text-[var(--text-sm)] text-[var(--accent)]" role="status">
          {suggestionNote}
        </p>
      ) : null}

      {pendingConfirm ? (
        <section
          aria-labelledby="alerts-heading"
          className="border border-[var(--line)] bg-[var(--surface)] p-[var(--space-4)]"
        >
          <h2
            id="alerts-heading"
            className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
          >
            Confirmar apesar dos alertas
          </h2>
          <ul className="mt-[var(--space-3)] flex flex-col gap-[var(--space-2)]">
            {pendingConfirm.alerts.map((alert) => (
              <li
                key={alert.code + alert.message}
                className="text-[var(--text-sm)] text-[var(--ink)]"
              >
                {alert.message}
              </li>
            ))}
          </ul>
          <div className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-3)]">
            <button
              type="button"
              className={btnPrimary}
              disabled={busySlotId === pendingConfirm.slotId}
              onClick={() => void onConfirmAlerts()}
            >
              Confirmar designação
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => setPendingConfirm(null)}
            >
              Cancelar
            </button>
          </div>
        </section>
      ) : null}

      {partsByTopic.map((group) => (
        <section
          key={group.topic}
          aria-labelledby={`topic-${group.topic}`}
          className="border-t border-[var(--line)] pt-[var(--space-5)]"
        >
          <h2
            id={`topic-${group.topic}`}
            className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
          >
            {TOPIC_LABELS[group.topic]}
          </h2>
          <ul className="mt-[var(--space-4)] flex flex-col gap-[var(--space-5)]">
            {group.parts.map((part) => (
              <li key={part.id} className="flex flex-col gap-[var(--space-3)]">
                <div className="flex items-start justify-between gap-[var(--space-3)]">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--ink)]">
                      {part.partTypeLabel}
                    </p>
                    {editingPartId === part.id ? (
                      <div className="mt-[var(--space-2)] flex flex-col gap-[var(--space-2)]">
                        <label className="text-[var(--text-sm)] text-[var(--muted)]">
                          Tema
                          <input
                            className={`${fieldClass} mt-[var(--space-1)]`}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") cancelEditingPart();
                            }}
                            maxLength={300}
                            autoFocus
                          />
                        </label>
                        {partTitleError ? (
                          <p
                            role="alert"
                            className="text-[var(--text-sm)] text-[var(--danger)]"
                          >
                            {partTitleError}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-[var(--space-2)]">
                          <button
                            type="button"
                            className={btnPrimary}
                            disabled={savingPartId === part.id}
                            onClick={() => void savePartTitle(part.id)}
                          >
                            {savingPartId === part.id ? "Salvando…" : "Salvar"}
                          </button>
                          <button
                            type="button"
                            className={btnGhost}
                            disabled={savingPartId === part.id}
                            onClick={cancelEditingPart}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-[var(--space-1)]">
                        {part.title && part.title !== part.partTypeLabel ? (
                          <p className="text-[var(--text-sm)] text-[var(--muted)]">
                            Tema: {part.title}
                          </p>
                        ) : null}
                        {part.title && part.title !== part.partTypeLabel ? (
                          <button
                            type="button"
                            className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                            aria-label="Editar tema"
                            onClick={() => startEditingPart(part)}
                          >
                            ✎ Editar tema
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-[var(--text-sm)] text-[var(--muted)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                            onClick={() => startEditingPart(part)}
                          >
                            Adicionar tema…
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {part.deletable ? (
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => void onRemovePart(part.id)}
                    >
                      Remover
                    </button>
                  ) : null}
                </div>

                <ul className="flex flex-col gap-[var(--space-3)] border-l-2 border-[var(--line)] pl-[var(--space-3)]">
                  {part.slots.map((slot) => (
                    <li
                      key={slot.id}
                      className="flex flex-col gap-[var(--space-2)]"
                    >
                      <p className="text-[var(--text-sm)] font-medium text-[var(--ink)]">
                        {ROLE_LABELS[slot.role]}
                        {slot.participantName
                          ? ` — ${slot.participantName}`
                          : " — em aberto"}
                      </p>
                      <label className="text-[var(--text-sm)] text-[var(--muted)]">
                        Participante
                        <div className="mt-[var(--space-1)]">
                          <ParticipantPicker
                            slotId={slot.id}
                            value={slot.participantId}
                            participantName={slot.participantName}
                            disabled={busySlotId === slot.id}
                            busy={busySlotId === slot.id}
                            onSelect={(participantId) =>
                              void applyAssign(slot.id, participantId, false)
                            }
                          />
                        </div>
                      </label>
                      <div className="flex flex-wrap gap-[var(--space-2)]">
                        <button
                          type="button"
                          className={btnGhost}
                          disabled={busySlotId === slot.id}
                          onClick={() =>
                            void onSuggest(part, slot.role, slot.id)
                          }
                        >
                          Sugerir
                        </button>
                        {slot.participantId ? (
                          <button
                            type="button"
                            className={btnGhost}
                            disabled={busySlotId === slot.id}
                            onClick={() => void onUnassign(slot.id)}
                          >
                            Limpar
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section
        aria-labelledby="add-part-heading"
        className="border-t border-[var(--line)] pt-[var(--space-5)]"
      >
        <h2
          id="add-part-heading"
          className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
        >
          Adicionar parte
        </h2>
        <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
          Inclua partes FSM ou NVC extras nesta semana.
        </p>
        <form
          onSubmit={(e) => void onAddPart(e)}
          className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]"
        >
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            Seção
            <select
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={addTopic}
              onChange={(e) =>
                setAddTopic(
                  e.target.value as
                    | PartTopic.MINISTRY
                    | PartTopic.CHRISTIAN_LIFE,
                )
              }
            >
              <option value={PartTopic.MINISTRY}>
                {TOPIC_LABELS[PartTopic.MINISTRY]}
              </option>
              <option value={PartTopic.CHRISTIAN_LIFE}>
                {TOPIC_LABELS[PartTopic.CHRISTIAN_LIFE]}
              </option>
            </select>
          </label>
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            Tipo
            <select
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={addPartTypeId}
              onChange={(e) => setAddPartTypeId(e.target.value)}
              required
            >
              {addableTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            Tema (opcional)
            <input
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              maxLength={300}
              placeholder="Texto livre do tema"
            />
          </label>
          <button
            type="submit"
            className={`${btnPrimary} self-start`}
            disabled={addPending || !addPartTypeId}
          >
            {addPending ? "Adicionando…" : "Adicionar"}
          </button>
        </form>
      </section>
    </main>
  );
}
