"use client";

import Link from "next/link";
import { FormEvent, use, useCallback, useEffect, useMemo, useState } from "react";
import { ParticipantAbsencesSection } from "@/components/participant-absences";
import {
  PRIVILEGE_LABELS,
  ROLE_PREFERENCE_LABELS,
  SEX_LABELS,
  createAssociation,
  deleteAssociation,
  getParticipant,
  listParticipantAssignments,
  listParticipants,
  type AssignmentHistoryItem,
  type ParticipantDetail,
  type ParticipantListItem,
} from "@/lib/participants";

type PageProps = {
  params: Promise<{ id: string }>;
};

const fieldClass =
  "rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-base)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)]";

export default function ParticipantDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [preferNewPeriod, setPreferNewPeriod] = useState(false);
  const [participant, setParticipant] = useState<ParticipantDetail | null>(
    null,
  );
  const [assignments, setAssignments] = useState<AssignmentHistoryItem[]>([]);
  const [allParticipants, setAllParticipants] = useState<ParticipantListItem[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [assocError, setAssocError] = useState<string | null>(null);
  const [otherId, setOtherId] = useState("");
  const [reason, setReason] = useState("");
  const [assocPending, setAssocPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPreferNewPeriod(params.get("newAbsence") === "1");
  }, []);

  const load = useCallback(async () => {
    const [detail, history, people] = await Promise.all([
      getParticipant(id),
      listParticipantAssignments(id),
      listParticipants(),
    ]);
    setParticipant(detail);
    setAssignments(history);
    setAllParticipants(people);
  }, [id]);

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
              : "Não foi possível carregar o participante.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const associationOptions = useMemo(() => {
    if (!participant) return [];
    const linked = new Set(
      participant.associations.map((a) => a.otherParticipantId),
    );
    return allParticipants.filter(
      (p) => p.id !== participant.id && !linked.has(p.id),
    );
  }, [allParticipants, participant]);

  async function onCreateAssociation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!participant) return;
    setAssocError(null);
    setAssocPending(true);
    try {
      await createAssociation(participant.id, otherId, reason);
      setOtherId("");
      setReason("");
      await load();
    } catch (err) {
      setAssocError(
        err instanceof Error ? err.message : "Não foi possível associar.",
      );
    } finally {
      setAssocPending(false);
    }
  }

  async function onRemoveAssociation(associationId: string) {
    if (!participant) return;
    setAssocError(null);
    try {
      await deleteAssociation(participant.id, associationId);
      await load();
    } catch (err) {
      setAssocError(
        err instanceof Error ? err.message : "Não foi possível remover.",
      );
    }
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-0 w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-4)] px-[var(--page-pad)] py-[var(--space-8)]">
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
        <Link href="/participants" className="text-[var(--text-sm)] text-[var(--accent)]">
          Voltar à lista
        </Link>
      </main>
    );
  }

  if (!participant) {
    return (
      <main className="flex min-h-[50dvh] items-center justify-center px-[var(--page-pad)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
      </main>
    );
  }

  const { counters } = participant;

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-6)] px-[var(--page-pad)] py-[var(--space-8)]">
      <header className="page-rise flex items-start justify-between gap-[var(--space-4)] border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <div>
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            <Link
              href="/participants"
              className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Participantes
            </Link>
          </p>
          <h1 className="mt-[var(--space-1)] font-[family-name:var(--font-brand)] text-[var(--text-xl)] font-semibold text-[var(--ink)]">
            {participant.name}
          </h1>
          <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
            {SEX_LABELS[participant.sex]} ·{" "}
            {PRIVILEGE_LABELS[participant.privilege]} ·{" "}
            {ROLE_PREFERENCE_LABELS[participant.rolePreference]}
          </p>
          {participant.phone ? (
            <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--ink)]">
              {participant.phone}
            </p>
          ) : null}
        </div>
        <Link
          href={`/participants/${participant.id}/edit`}
          className="shrink-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Editar
        </Link>
      </header>

      <section className="page-rise-delay" aria-labelledby="counters-heading">
        <h2
          id="counters-heading"
          className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
        >
          Contadores
        </h2>
        <dl className="mt-[var(--space-3)] grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-3)] sm:grid-cols-3">
          {[
            ["Titular", counters.titular],
            ["Ajudante", counters.ajudante],
            ["Dirigente", counters.dirigente],
            ["Leitor", counters.leitor],
            ["Ministério", counters.ministryPractice],
          ].map(([label, value]) => (
            <div key={label as string} className="border-t border-[var(--line)] pt-[var(--space-2)]">
              <dt className="text-[var(--text-sm)] text-[var(--muted)]">
                {label}
              </dt>
              <dd className="font-[family-name:var(--font-brand)] text-[var(--text-xl)] tabular-nums text-[var(--ink)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="associations-heading">
        <h2
          id="associations-heading"
          className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
        >
          Associações
        </h2>
        <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
          Pares que não disparam alerta de sexo misto quando designados juntos.
        </p>

        {participant.associations.length === 0 ? (
          <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--muted)]">
            Nenhuma associação.
          </p>
        ) : (
          <ul className="mt-[var(--space-3)] flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {participant.associations.map((assoc) => (
              <li
                key={assoc.id}
                className="flex items-start justify-between gap-[var(--space-3)] py-[var(--space-3)]"
              >
                <div>
                  <Link
                    href={`/participants/${assoc.otherParticipantId}`}
                    className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
                  >
                    {assoc.otherParticipantName}
                  </Link>
                  <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--muted)]">
                    {assoc.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void onRemoveAssociation(assoc.id)}
                  className="shrink-0 text-[var(--text-sm)] text-[var(--danger)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={onCreateAssociation}
          className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]"
        >
          <div className="flex flex-col gap-[var(--space-2)]">
            <label
              htmlFor="otherParticipant"
              className="text-[var(--text-sm)] text-[var(--muted)]"
            >
              Associar a
            </label>
            <select
              id="otherParticipant"
              required
              value={otherId}
              onChange={(e) => setOtherId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Selecione…</option>
              {associationOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-[var(--space-2)]">
            <label
              htmlFor="reason"
              className="text-[var(--text-sm)] text-[var(--muted)]"
            >
              Motivo
            </label>
            <input
              id="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={fieldClass}
              placeholder="Ex.: cônjuges"
            />
          </div>
          {assocError ? (
            <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
              {assocError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={assocPending || associationOptions.length === 0}
            className="self-start rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
          >
            {assocPending ? "Associando…" : "Adicionar associação"}
          </button>
        </form>
      </section>

      <ParticipantAbsencesSection
        participantId={participant.id}
        preferNewPeriod={preferNewPeriod}
      />

      <section aria-labelledby="history-heading">
        <h2
          id="history-heading"
          className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
        >
          Histórico de designações
        </h2>
        {assignments.length === 0 ? (
          <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--muted)]">
            Ainda não há designações para este participante.
          </p>
        ) : (
          <ul className="mt-[var(--space-3)] flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {assignments.map((item) => (
              <li key={item.id} className="py-[var(--space-3)]">
                <p className="text-[var(--text-base)] text-[var(--ink)]">
                  {item.partTitle}
                </p>
                <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--muted)]">
                  {item.meetingDate} · {item.role} · {item.partTypeLabel}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
