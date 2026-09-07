"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatYearMonthLabel,
  listScheduleMonths,
  type MonthSummary,
} from "@/lib/schedule";
import { MonthStatusBadge } from "@/components/month-status-badge";

function groupByYear(months: MonthSummary[]): Map<number, MonthSummary[]> {
  const groups = new Map<number, MonthSummary[]>();
  for (const month of months) {
    const year = Number(month.yearMonth.slice(0, 4));
    const list = groups.get(year) ?? [];
    list.push(month);
    groups.set(year, list);
  }
  return groups;
}

export function MonthArchiveList() {
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await listScheduleMonths();
      const archive = result.months.filter((m) => m.isPast || m.isCurrent);
      setMonths(archive);
    } catch (err) {
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

  const yearGroups = useMemo((): [number, MonthSummary[]][] => {
    const grouped = groupByYear(months);
    return [...grouped.entries()]
      .sort(([a], [b]) => b - a)
      .map(([year, yearMonths]) => [
        year,
        [...yearMonths].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)),
      ]);
  }, [months]);

  if (loading) {
    return (
      <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-[var(--space-3)]">
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="self-start rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (months.length === 0) {
    return (
      <p className="text-[var(--text-sm)] text-[var(--muted)]">
        Nenhum mês registrado ainda
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {yearGroups.map(([year, yearMonths]) => (
        <section key={year} aria-labelledby={`archive-year-${year}`}>
          <h2
            id={`archive-year-${year}`}
            className="mb-[var(--space-2)] font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
          >
            {year}
          </h2>
          <ul className="flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {yearMonths.map((month) => (
              <li key={month.yearMonth}>
                <Link
                  href={month.href}
                  className={`flex min-h-[44px] items-center justify-between gap-[var(--space-3)] py-[var(--space-3)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_4%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                    month.isCurrent
                      ? "border-l-[3px] border-[var(--accent)] pl-[var(--space-3)]"
                      : ""
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
        </section>
      ))}
    </div>
  );
}
