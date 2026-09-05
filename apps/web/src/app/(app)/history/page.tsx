"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AssignmentRole, PartTopic } from "@jw/shared";
import {
  ROLE_LABELS,
  TOPIC_LABELS,
  fetchAssignmentHistory,
  formatDateBr,
  type HistoryItem,
} from "@/lib/schedule";

const fieldClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)]";

const btnPrimary =
  "rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60";

const btnGhost =
  "rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60";

type Filters = {
  q: string;
  from: string;
  to: string;
  topic: string;
  role: string;
};

const emptyFilters: Filters = {
  q: "",
  from: "",
  to: "",
  topic: "",
  role: "",
};

export default function HistoryPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(async (f: Filters, p: number) => {
    setError(null);
    setLoading(true);
    try {
      const result = await fetchAssignmentHistory({
        q: f.q || undefined,
        from: f.from || undefined,
        to: f.to || undefined,
        topic: f.topic ? (f.topic as PartTopic) : undefined,
        role: f.role ? (f.role as AssignmentRole) : undefined,
        page: p,
        limit,
      });
      setItems(result.items);
      setTotal(result.total);
      setPage(result.page);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o histórico.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(emptyFilters, 1);
  }, [load]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setApplied(filters);
    void load(filters, 1);
  }

  function onClear() {
    setFilters(emptyFilters);
    setApplied(emptyFilters);
    void load(emptyFilters, 1);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-6)] px-[var(--page-pad)] py-[var(--space-8)]">
      <header className="page-rise border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">
          <Link
            href="/"
            className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Início
          </Link>
        </p>
        <h1 className="mt-[var(--space-1)] font-[family-name:var(--font-brand)] text-[var(--text-xl)] font-semibold text-[var(--ink)]">
          Histórico de designações
        </h1>
        <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
          Busque por nome, período, tópico ou papel.
        </p>
      </header>

      <form
        onSubmit={onSearch}
        className="page-rise-delay flex flex-col gap-[var(--space-3)] border-t border-[var(--line)] pt-[var(--space-5)]"
      >
        <label className="text-[var(--text-sm)] text-[var(--muted)]">
          Nome do participante
          <input
            className={`${fieldClass} mt-[var(--space-1)]`}
            value={filters.q}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, q: e.target.value }))
            }
            placeholder="Buscar por nome"
            autoComplete="off"
          />
        </label>
        <div className="grid grid-cols-2 gap-[var(--space-3)]">
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            De
            <input
              type="date"
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </label>
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            Até
            <input
              type="date"
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </label>
        </div>
        <label className="text-[var(--text-sm)] text-[var(--muted)]">
          Tópico
          <select
            className={`${fieldClass} mt-[var(--space-1)]`}
            value={filters.topic}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, topic: e.target.value }))
            }
          >
            <option value="">Todos</option>
            {Object.values(PartTopic).map((topic) => (
              <option key={topic} value={topic}>
                {TOPIC_LABELS[topic]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[var(--text-sm)] text-[var(--muted)]">
          Papel
          <select
            className={`${fieldClass} mt-[var(--space-1)]`}
            value={filters.role}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, role: e.target.value }))
            }
          >
            <option value="">Todos</option>
            {Object.values(AssignmentRole).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-[var(--space-3)]">
          <button type="submit" className={btnPrimary} disabled={loading}>
            Filtrar
          </button>
          <button type="button" className={btnGhost} onClick={onClear}>
            Limpar
          </button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section aria-live="polite">
        {loading ? (
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            Carregando…
          </p>
        ) : items.length === 0 ? (
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            Nenhuma designação encontrada
            {applied.q ? ` para “${applied.q}”` : ""}.
          </p>
        ) : (
          <>
            <p className="text-[var(--text-sm)] text-[var(--muted)]">
              {total} resultado{total === 1 ? "" : "s"}
            </p>
            <ul className="mt-[var(--space-3)] flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-[var(--space-1)] py-[var(--space-3)]"
                >
                  <p className="font-medium text-[var(--ink)]">
                    {item.participantName ?? "—"}
                  </p>
                  <p className="text-[var(--text-sm)] text-[var(--muted)]">
                    {formatDateBr(item.meetingDate)} · {ROLE_LABELS[item.role]} ·{" "}
                    {item.partTypeLabel}
                  </p>
                  <p className="text-[var(--text-sm)] text-[var(--muted)]">
                    {TOPIC_LABELS[item.partTopic]}
                    {item.partTitle && item.partTitle !== item.partTypeLabel
                      ? ` — ${item.partTitle}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
            {totalPages > 1 ? (
              <div className="mt-[var(--space-4)] flex items-center justify-between gap-[var(--space-3)]">
                <button
                  type="button"
                  className={btnGhost}
                  disabled={page <= 1 || loading}
                  onClick={() => void load(applied, page - 1)}
                >
                  Anterior
                </button>
                <span className="text-[var(--text-sm)] text-[var(--muted)]">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  className={btnGhost}
                  disabled={page >= totalPages || loading}
                  onClick={() => void load(applied, page + 1)}
                >
                  Próxima
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
