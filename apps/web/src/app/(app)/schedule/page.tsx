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
            className={`flex min-h-[44px] items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[var(--space-3)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
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
    <main className="relative flex flex-col px-[var(--page-pad)] py-[var(--space-8)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 70% at 10% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 55%), linear-gradient(180deg, var(--surface) 0%, var(--paper) 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-6)]">
        <header className="border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
          <h1 className="font-[family-name:var(--font-brand)] text-[var(--text-display)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
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
            className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--danger)_35%,var(--line))] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))] px-[var(--space-4)] py-[var(--space-3)]"
          >
            <p className="text-[var(--text-sm)] text-[var(--danger)]">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="self-start rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {!loading && !error ? (
          <>
            <section aria-labelledby="planning-heading">
              <h2
                id="planning-heading"
                className="mb-[var(--space-3)] font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
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
                  className="mb-[var(--space-3)] font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
                >
                  Meses anteriores
                </h2>
                <MonthList
                  months={past}
                  emptyMessage="Nenhum mês anterior registrado."
                />
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
