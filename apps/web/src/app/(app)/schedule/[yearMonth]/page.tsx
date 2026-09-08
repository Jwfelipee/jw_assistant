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
import { btnPrimaryLg, pageMainCenterClass } from "@/lib/ui";

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
    <main className={pageMainCenterClass}>
      <header className="border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
          <Link
            href="/schedule"
            className="mb-[var(--space-2)] inline-flex min-h-[44px] items-center text-[var(--text-sm)] text-[var(--accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            ← Todos os meses
          </Link>
          <p className="font-heading text-[var(--text-display)] leading-tight tracking-tight">
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
                  className="list-row flex items-center justify-between gap-[var(--space-3)] py-[var(--space-3)] text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
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

        <div className="btn-row">
          <button
            type="button"
            disabled={!valid || exporting}
            onClick={() => void onExport()}
            className={btnPrimaryLg}
          >
            {exporting ? "Gerando PDF…" : "Exportar S-140"}
          </button>
        </div>
    </main>
  );
}
