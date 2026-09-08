"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { AssignmentRole, PartTopic } from "@jw/shared";
import { AddWeekPartModal } from "@/components/add-week-part-modal";
import { ParticipantPicker } from "@/components/participant-picker";
import { SortableWeekParts } from "@/components/sortable-week-parts";
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
  reorderWeekParts,
  suggestForPart,
  unassignSlot,
  updatePartTitle,
  type SoftAlert,
  type WeekPartView,
  type WeekView,
} from "@/lib/schedule";
import {
  btnDangerOutline,
  btnOutline,
  btnPrimary,
  btnSecondary,
  fieldClass,
  sectionCardClass,
} from "@/lib/ui";

type PageProps = {
  params: Promise<{ yearMonth: string; weekId: string }>;
};

const TOPIC_ORDER: PartTopic[] = [
  PartTopic.OUT_OF_TOPIC,
  PartTopic.TREASURES,
  PartTopic.MINISTRY,
  PartTopic.CHRISTIAN_LIFE,
];

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
  const [addModalTopic, setAddModalTopic] = useState<
    PartTopic.MINISTRY | PartTopic.CHRISTIAN_LIFE | null
  >(null);
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

  async function onConfirmAddPart(partTypeId: string, title?: string) {
    if (!week) return;
    setAddPending(true);
    setError(null);
    try {
      await addWeekPart(week.id, partTypeId, title);
      await load();
      setAddModalTopic(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível adicionar a parte.",
      );
    } finally {
      setAddPending(false);
    }
  }

  function sortedReorderableIds(
    topic: PartTopic.MINISTRY | PartTopic.CHRISTIAN_LIFE,
  ) {
    if (!week) return [];
    return week.parts
      .filter(
        (p) =>
          p.topic === topic &&
          (topic === PartTopic.MINISTRY || p.partTypeCode !== "ESTUDO_BIBLICO"),
      )
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => p.id);
  }

  async function onReorderTopicParts(
    topic: PartTopic.MINISTRY | PartTopic.CHRISTIAN_LIFE,
    orderedTopicIds: string[],
  ) {
    if (!week) return;
    setError(null);
    const fsmIds =
      topic === PartTopic.MINISTRY
        ? orderedTopicIds
        : sortedReorderableIds(PartTopic.MINISTRY);
    const nvcIds =
      topic === PartTopic.CHRISTIAN_LIFE
        ? orderedTopicIds
        : sortedReorderableIds(PartTopic.CHRISTIAN_LIFE);
    try {
      await reorderWeekParts(week.id, [...fsmIds, ...nvcIds]);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível reordenar as partes.",
      );
      throw err;
    }
  }

  function renderPartBody(part: WeekPartView) {
    return (
      <>
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[var(--ink)]">{part.partTypeLabel}</p>
            {editingPartId === part.id ? (
              <div className="mt-[var(--space-2)] flex flex-col gap-[var(--space-2)]">
                <label className="text-label">
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
                  <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
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
                    className={btnOutline}
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
              className={btnDangerOutline}
              onClick={() => void onRemovePart(part.id)}
            >
              Remover
            </button>
          ) : null}
        </div>

        <ul className="flex flex-col gap-[var(--space-3)] border-l-2 border-[var(--line)] pl-[var(--space-3)]">
          {part.slots.map((slot) => (
            <li key={slot.id} className="flex flex-col gap-[var(--space-2)]">
              <p className="text-[var(--text-sm)] font-medium text-[var(--ink)]">
                {ROLE_LABELS[slot.role]}
                {slot.participantName ? ` — ${slot.participantName}` : " — em aberto"}
              </p>
              <label className="text-label">
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
                  className={btnPrimary}
                  disabled={busySlotId === slot.id}
                  onClick={() => void onSuggest(part, slot.role, slot.id)}
                >
                  Sugerir
                </button>
                {slot.participantId ? (
                  <button
                    type="button"
                    className={btnDangerOutline}
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
      </>
    );
  }

  function renderStaticPart(part: WeekPartView) {
    return (
      <li key={part.id} className="section-card flex flex-col gap-[var(--space-3)]">
        {renderPartBody(part)}
      </li>
    );
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
        <h1 className="mt-[var(--space-1)] font-heading text-[var(--text-xl)]">
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
          className={sectionCardClass}
        >
          <h2
            id="alerts-heading"
            className="font-heading text-[var(--text-lg)]"
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
              className={btnOutline}
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
          className="border-t border-[var(--line)] pt-[var(--space-5)] first:border-t-0 first:pt-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <h2
              id={`topic-${group.topic}`}
              className="font-heading text-[var(--text-lg)]"
            >
              {TOPIC_LABELS[group.topic]}
            </h2>
            {group.topic === PartTopic.MINISTRY ||
            group.topic === PartTopic.CHRISTIAN_LIFE ? (
              <button
                type="button"
                className={btnSecondary}
                onClick={() =>
                  setAddModalTopic(
                    group.topic as
                      | PartTopic.MINISTRY
                      | PartTopic.CHRISTIAN_LIFE,
                  )
                }
              >
                + Adicionar parte
              </button>
            ) : null}
          </div>
          {group.topic === PartTopic.MINISTRY ? (
            <SortableWeekParts
              parts={group.parts.sort((a, b) => a.sortOrder - b.sortOrder)}
              onReorder={(orderedIds) =>
                onReorderTopicParts(PartTopic.MINISTRY, orderedIds)
              }
              renderPart={renderPartBody}
            />
          ) : group.topic === PartTopic.CHRISTIAN_LIFE ? (
            <>
              <SortableWeekParts
                parts={group.parts
                  .filter((p) => p.partTypeCode !== "ESTUDO_BIBLICO")
                  .sort((a, b) => a.sortOrder - b.sortOrder)}
                onReorder={(orderedIds) =>
                  onReorderTopicParts(PartTopic.CHRISTIAN_LIFE, orderedIds)
                }
                renderPart={renderPartBody}
              />
              {group.parts.some((p) => p.partTypeCode === "ESTUDO_BIBLICO") ? (
                <ul className="mt-[var(--space-4)] flex flex-col gap-[var(--space-5)]">
                  {group.parts
                    .filter((p) => p.partTypeCode === "ESTUDO_BIBLICO")
                    .map((part) => renderStaticPart(part))}
                </ul>
              ) : null}
            </>
          ) : (
            <ul className="mt-[var(--space-4)] flex flex-col gap-[var(--space-5)]">
              {group.parts.map((part) => renderStaticPart(part))}
            </ul>
          )}
        </section>
      ))}

      {addModalTopic ? (
        <AddWeekPartModal
          open
          topic={addModalTopic}
          partTypes={
            addModalTopic === PartTopic.MINISTRY ? fsmTypes : nvcTypes
          }
          pending={addPending}
          onClose={() => {
            if (!addPending) setAddModalTopic(null);
          }}
          onConfirm={onConfirmAddPart}
        />
      ) : null}
    </main>
  );
}
