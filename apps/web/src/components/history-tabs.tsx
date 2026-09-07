"use client";

import { useRouter } from "next/navigation";

export type HistoryView = "assignments" | "months";

type HistoryTabsProps = {
  activeView: HistoryView;
  onChange: (view: HistoryView) => void;
};

const TABS: { id: HistoryView; label: string }[] = [
  { id: "assignments", label: "Por designação" },
  { id: "months", label: "Por mês" },
];

export function HistoryTabs({ activeView, onChange }: HistoryTabsProps) {
  const router = useRouter();

  function selectView(view: HistoryView) {
    if (view === activeView) return;
    onChange(view);
    router.replace(`/history?view=${view}`, { scroll: false });
  }

  return (
    <div
      role="tablist"
      aria-label="Visualização do histórico"
      className="flex gap-[var(--space-1)] border-b border-[var(--line)]"
    >
      {TABS.map((tab) => {
        const selected = activeView === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`history-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`history-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => selectView(tab.id)}
            className={`min-h-[44px] flex-1 rounded-t-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
              selected
                ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
