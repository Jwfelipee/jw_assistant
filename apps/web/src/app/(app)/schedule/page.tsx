"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MonthStatusBadge } from "@/components/month-status-badge";
import {
  ensureHorizon,
  formatYearMonthLabel,
  listScheduleMonths,
  type MonthSummary,
} from "@/lib/schedule";
import { btnOutline, pageMainClass } from "@/lib/ui";

function groupMonths(months: MonthSummary[]) {
  const planning = months
    .filter((m) => m.isInHorizon)
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
  const past = months
    .filter((m) => m.isPast)
    .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  return { planning, past };
}

function MonthList({
  months,
  emptyMessage,
}: {
  months: MonthSummary[];
  emptyMessage: string;
}) {
  if (months.length === 0) {
    return (
      <p className="px-[var(--space-1)] text-[var(--text-sm)] text-[var(--muted)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-[var(--space-2)]">
      {months.map((month) => (
        <li key={month.yearMonth}>
          <Link
            href={month.href}
            className={`flex min-h-[44px] items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-3)] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
              month.isCurrent
                ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))]"
                : "border-[var(--line)] bg-[var(--surface)]"
            }`}
          >
            <span className="font-medium text-[var(--ink)]">
              {formatYearMonthLabel(month.yearMonth)}
            </span>
            <MonthStatusBadge month={month} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Hub da aba Designações — meses de planejamento e anteriores com status. */
export default function ScheduleIndexPage() {
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureHorizon();
      const result = await listScheduleMonths();
      setMonths(result.months);
    } catch (err) {
      setMonths([]);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os meses.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const { planning, past } = useMemo(() => groupMonths(months), [months]);

  return (
    <main className={`${pageMainClass} page-rise`}>
      <header className="border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <h1 className="font-heading text-[var(--text-display)] leading-tight tracking-tight">
          Designações
        </h1>
        <p className="mt-[var(--space-2)] max-w-[28rem] text-[var(--text-sm)] leading-relaxed text-[var(--muted)]">
          Planejamento do mês atual e dos próximos seis meses. Meses anteriores
          permanecem disponíveis para consulta e edição.
        </p>
      </header>

      {loading ? (
        <p className="text-[var(--text-sm)] text-[var(--muted)]">
          Preparando meses…
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="section-card flex flex-col gap-[var(--space-3)]"
        >
          <p className="text-[var(--text-sm)] text-[var(--danger)]">{error}</p>
          <div className="btn-row">
            <button type="button" onClick={() => void load()} className={btnOutline}>
              Tentar novamente
            </button>
          </div>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="page-rise-delay flex flex-col gap-[var(--space-6)]">
          <section aria-labelledby="planning-heading">
            <h2
              id="planning-heading"
              className="mb-[var(--space-3)] font-heading text-[var(--text-lg)]"
            >
              Planejamento
            </h2>
            <MonthList
              months={planning}
              emptyMessage="Nenhum mês no horizonte de planejamento."
            />
          </section>

          {past.length > 0 ? (
            <section aria-labelledby="past-heading">
              <h2
                id="past-heading"
                className="mb-[var(--space-3)] font-heading text-[var(--text-lg)]"
              >
                Meses anteriores
              </h2>
              <MonthList
                months={past}
                emptyMessage="Nenhum mês anterior registrado."
              />
            </section>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
