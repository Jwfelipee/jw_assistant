"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ABSENCE_STATUS_LABELS,
  createAbsence,
  listParticipantAbsences,
  revealAbsenceJustification,
  reactivateAbsence,
  type AbsenceView,
} from "@/lib/absences";

const fieldClass =
  "rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-base)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)]";

type Props = {
  participantId: string;
  /** When set (e.g. from home alert), prefill form for a new period. */
  preferNewPeriod?: boolean;
};

function formatPeriod(absence: AbsenceView): string {
  if (!absence.endsOn) {
    return `${absence.startsOn} · sem data fim`;
  }
  return `${absence.startsOn} → ${absence.endsOn}`;
}

export function ParticipantAbsencesSection({
  participantId,
  preferNewPeriod = false,
}: Props) {
  const [absences, setAbsences] = useState<AbsenceView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string | null>>({});
  const [revealPending, setRevealPending] = useState<string | null>(null);
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [openEnded, setOpenEnded] = useState(false);
  const [justification, setJustification] = useState("");
  const [showForm, setShowForm] = useState(preferNewPeriod);

  const load = useCallback(async () => {
    const rows = await listParticipantAbsences(participantId);
    setAbsences(rows);
  }, [participantId]);

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
              : "Não foi possível carregar as ausências.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (preferNewPeriod) {
      setShowForm(true);
    }
  }, [preferNewPeriod]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setPending(true);
    try {
      await createAbsence(participantId, {
        startsOn,
        endsOn: openEnded ? null : endsOn || null,
        justification: justification.trim() || undefined,
      });
      setStartsOn("");
      setEndsOn("");
      setOpenEnded(false);
      setJustification("");
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Não foi possível registrar.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onReveal(absenceId: string) {
    setRevealPending(absenceId);
    setFormError(null);
    try {
      const row = await revealAbsenceJustification(absenceId);
      setRevealed((prev) => ({
        ...prev,
        [absenceId]: row.justification ?? null,
      }));
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Não foi possível mostrar a justificativa.",
      );
    } finally {
      setRevealPending(null);
    }
  }

  async function onReactivate(absenceId: string) {
    setFormError(null);
    try {
      await reactivateAbsence(absenceId);
      await load();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Não foi possível reativar.",
      );
    }
  }

  if (error) {
    return (
      <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
        {error}
      </p>
    );
  }

  return (
    <section aria-labelledby="absences-heading">
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <div>
          <h2
            id="absences-heading"
            className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
          >
            Ausências
          </h2>
          <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
            Períodos em que a pessoa não entra nas listas de designação.
          </p>
        </div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="shrink-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Registrar
          </button>
        ) : null}
      </div>

      {showForm ? (
        <form
          onSubmit={onCreate}
          className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)] border-t border-[var(--line)] pt-[var(--space-4)]"
        >
          <div className="flex flex-col gap-[var(--space-2)]">
            <label
              htmlFor="absence-starts"
              className="text-[var(--text-sm)] text-[var(--muted)]"
            >
              Início
            </label>
            <input
              id="absence-starts"
              type="date"
              required
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
              className={fieldClass}
            />
          </div>

          <label className="flex items-center gap-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)]">
            <input
              type="checkbox"
              checked={openEnded}
              onChange={(e) => {
                setOpenEnded(e.target.checked);
                if (e.target.checked) setEndsOn("");
              }}
              className="size-4 accent-[var(--accent)]"
            />
            Sem data de fim (não designável até reativar)
          </label>

          {!openEnded ? (
            <div className="flex flex-col gap-[var(--space-2)]">
              <label
                htmlFor="absence-ends"
                className="text-[var(--text-sm)] text-[var(--muted)]"
              >
                Fim
              </label>
              <input
                id="absence-ends"
                type="date"
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
                className={fieldClass}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-[var(--space-2)]">
            <label
              htmlFor="absence-justification"
              className="text-[var(--text-sm)] text-[var(--muted)]"
            >
              Justificativa (opcional, oculta na listagem)
            </label>
            <textarea
              id="absence-justification"
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className={fieldClass}
              placeholder="Somente quem pedir para ver verá este texto"
            />
          </div>

          {formError ? (
            <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-[var(--space-3)]">
            <button
              type="submit"
              disabled={pending}
              className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Salvar ausência"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormError(null);
              }}
              className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : formError ? (
        <p
          role="alert"
          className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--danger)]"
        >
          {formError}
        </p>
      ) : null}

      {absences.length === 0 ? (
        <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--muted)]">
          Nenhuma ausência registrada.
        </p>
      ) : (
        <ul className="mt-[var(--space-3)] flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {absences.map((absence) => {
            const justificationText = revealed[absence.id];
            const isRevealed = Object.prototype.hasOwnProperty.call(
              revealed,
              absence.id,
            );
            const canReactivate = absence.status === "ACTIVE";

            return (
              <li key={absence.id} className="py-[var(--space-3)]">
                <p className="text-[var(--text-base)] text-[var(--ink)]">
                  {formatPeriod(absence)}
                </p>
                <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--muted)]">
                  {ABSENCE_STATUS_LABELS[absence.status]}
                  {!absence.endsOn && absence.status === "ACTIVE"
                    ? " · bloqueia todas as listas"
                    : null}
                </p>

                {absence.hasJustification ? (
                  <div className="mt-[var(--space-2)]">
                    {!isRevealed ? (
                      <button
                        type="button"
                        disabled={revealPending === absence.id}
                        onClick={() => void onReveal(absence.id)}
                        className="text-[var(--text-sm)] text-[var(--accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
                      >
                        {revealPending === absence.id
                          ? "Carregando…"
                          : "Mostrar justificativa"}
                      </button>
                    ) : (
                      <p className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)]">
                        {justificationText?.trim()
                          ? justificationText
                          : "Sem texto de justificativa."}
                      </p>
                    )}
                  </div>
                ) : null}

                {canReactivate ? (
                  <button
                    type="button"
                    onClick={() => void onReactivate(absence.id)}
                    className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    Reativar
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
