"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchMe } from "@/lib/auth";
import { downloadS140Pdf } from "@/lib/s140-export";
import {
  ensureMonth,
  formatDateBr,
  formatYearMonthLabel,
  type MonthView,
} from "@/lib/schedule";

const YEAR_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export default function ScheduleMonthPage() {
  const router = useRouter();
  const params = useParams<{ yearMonth: string }>();
  const yearMonth = useMemo(() => {
    const raw = params.yearMonth;
    return typeof raw === "string" ? raw : "";
  }, [params.yearMonth]);

  const valid = YEAR_MONTH_RE.test(yearMonth);
  const [month, setMonth] = useState<MonthView | null>(null);
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) {
        router.replace("/login");
        return;
      }
      if (!YEAR_MONTH_RE.test(yearMonth)) {
        setReady(true);
        return;
      }
      try {
        const data = await ensureMonth(yearMonth);
        if (!cancelled) setMonth(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o mês.",
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, yearMonth]);

  async function onExport() {
    if (!valid || exporting) return;
    setExporting(true);
    setError(null);
    const result = await downloadS140Pdf(yearMonth);
    if (!result.ok) {
      setError(result.message);
      if (result.status === 401) {
        router.replace("/login");
      }
    }
    setExporting(false);
  }

  if (!ready) {
    return (
      <main className="flex min-h-[50dvh] items-center justify-center px-[var(--page-pad)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
      </main>
    );
  }

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
          <p className="font-[family-name:var(--font-brand)] text-[var(--text-display)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
            {valid ? formatYearMonthLabel(yearMonth) : "Mês"}
          </p>
          <p className="mt-[var(--space-2)] max-w-[28rem] text-[var(--text-sm)] leading-relaxed text-[var(--muted)]">
            Semanas da reunião e exportação do S-140 em PDF.
          </p>
        </header>

        {!valid ? (
          <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
            Mês inválido. Use o formato AAAA-MM.
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        {month && month.weeks.length > 0 ? (
          <ul className="flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {month.weeks.map((week) => (
              <li key={week.id}>
                <Link
                  href={`/schedule/${yearMonth}/weeks/${week.id}`}
                  className="flex items-center justify-between gap-[var(--space-3)] py-[var(--space-3)] text-[var(--ink)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  <span className="font-medium">
                    Semana de {formatDateBr(week.weekStartDate)}
                  </span>
                  <span className="text-[var(--text-sm)] text-[var(--muted)]">
                    Reunião {formatDateBr(week.meetingDate)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : valid && !error ? (
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            Nenhuma semana neste mês.
          </p>
        ) : null}

        <button
          type="button"
          disabled={!valid || exporting}
          onClick={() => void onExport()}
          className="self-start rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
        >
          {exporting ? "Gerando PDF…" : "Exportar S-140"}
        </button>
      </div>
    </main>
  );
}
