"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PRIVILEGE_LABELS,
  SEX_LABELS,
  listParticipants,
  type ParticipantListItem,
} from "@/lib/participants";
import { btnPrimary, pageMainClass } from "@/lib/ui";

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
    <main className={pageMainClass}>
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
          <h1 className="mt-[var(--space-1)] font-heading text-[var(--text-xl)]">
            Participantes
          </h1>
        </div>
        <Link href="/participants/new" className={`${btnPrimary} shrink-0`}>
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
                className="list-row flex flex-col gap-[var(--space-1)] py-[var(--space-4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--focus-ring)]"
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
