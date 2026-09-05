"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PRIVILEGE_LABELS,
  SEX_LABELS,
  listParticipants,
  type ParticipantListItem,
} from "@/lib/participants";

export default function ParticipantsPage() {
  const [items, setItems] = useState<ParticipantListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await listParticipants();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar participantes.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-6)] px-[var(--page-pad)] py-[var(--space-8)]">
      <header className="page-rise flex items-start justify-between gap-[var(--space-4)] border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <div>
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            <Link
              href="/"
              className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Início
            </Link>
          </p>
          <h1 className="mt-[var(--space-1)] font-[family-name:var(--font-brand)] text-[var(--text-xl)] font-semibold text-[var(--ink)]">
            Participantes
          </h1>
        </div>
        <Link
          href="/participants/new"
          className="shrink-0 rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Novo
        </Link>
      </header>

      {error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {items === null && !error ? (
        <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
      ) : null}

      {items && items.length === 0 ? (
        <div className="page-rise-delay rounded-[var(--radius-md)] border border-dashed border-[var(--line)] bg-[var(--surface)] px-[var(--space-4)] py-[var(--space-5)]">
          <p className="text-[var(--text-base)] text-[var(--ink)]">
            Nenhum participante cadastrado.
          </p>
          <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
            Cadastre quem pode receber designações na reunião.
          </p>
          <Link
            href="/participants/new"
            className="mt-[var(--space-4)] inline-block text-[var(--text-sm)] font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Cadastrar participante
          </Link>
        </div>
      ) : null}

      {items && items.length > 0 ? (
        <ul className="page-rise-delay flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/participants/${item.id}`}
                className="flex flex-col gap-[var(--space-1)] py-[var(--space-4)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--focus-ring)]"
              >
                <span className="text-[var(--text-base)] font-medium text-[var(--ink)]">
                  {item.name}
                </span>
                <span className="text-[var(--text-sm)] text-[var(--muted)]">
                  {SEX_LABELS[item.sex]} · {PRIVILEGE_LABELS[item.privilege]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
