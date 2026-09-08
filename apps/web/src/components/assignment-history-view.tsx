"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AssignmentRole, PartTopic } from "@jw/shared";
import {
  ROLE_LABELS,
  TOPIC_LABELS,
  fetchAssignmentHistory,
  formatDateBr,
  type HistoryItem,
} from "@/lib/schedule";
import { btnOutline, btnPrimary, btnRowClass, btnSecondary, fieldClass } from "@/lib/ui";

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

export function AssignmentHistoryView() {
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
    <>
      <form
        onSubmit={onSearch}
        className="flex flex-col gap-[var(--space-3)] border-t border-[var(--line)] pt-[var(--space-5)]"
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
        <div className={btnRowClass}>
          <button type="submit" className={btnPrimary} disabled={loading}>
            Filtrar
          </button>
          <button type="button" className={btnOutline} onClick={onClear}>
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
                  className={btnSecondary}
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
                  className={btnSecondary}
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
    </>
  );
}
