"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AssignmentHistoryView } from "@/components/assignment-history-view";
import { HistoryTabs, type HistoryView } from "@/components/history-tabs";
import { MonthArchiveList } from "@/components/month-archive-list";

function parseView(param: string | null): HistoryView {
  return param === "months" ? "months" : "assignments";
}

function HistoryPageContent() {
  const searchParams = useSearchParams();
  const activeView = useMemo(
    () => parseView(searchParams.get("view")),
    [searchParams],
  );

  const subtitle =
    activeView === "months"
      ? "Consulte meses anteriores e abra a programação para editar ou exportar PDF."
      : "Busque por nome, período, tópico ou papel.";

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
        <h1 className="mt-[var(--space-1)] font-heading text-[var(--text-xl)]">
          Histórico de designações
        </h1>
        <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
          {subtitle}
        </p>
      </header>

      <div className="page-rise-delay flex flex-col gap-[var(--space-5)]">
        <HistoryTabs activeView={activeView} onChange={() => undefined} />

        <div
          role="tabpanel"
          id={`history-panel-${activeView}`}
          aria-labelledby={`history-tab-${activeView}`}
        >
          {activeView === "assignments" ? (
            <AssignmentHistoryView />
          ) : (
            <MonthArchiveList />
          )}
        </div>
      </div>
    </main>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-0 w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-6)] px-[var(--page-pad)] py-[var(--space-8)]">
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            Carregando…
          </p>
        </main>
      }
    >
      <HistoryPageContent />
    </Suspense>
  );
}
