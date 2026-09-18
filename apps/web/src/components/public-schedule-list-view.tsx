"use client";

import { PartTopic } from "@jw/shared";
import {
  formatPublicParticipantName,
  type PublicScheduleView,
} from "@/lib/public-schedule";
import { formatDateBr, formatYearMonthLabel } from "@/lib/schedule";
import { btnPrimary, btnRowClass } from "@/lib/ui";

const TOPIC_ORDER: PartTopic[] = [
  PartTopic.OUT_OF_TOPIC,
  PartTopic.TREASURES,
  PartTopic.MINISTRY,
  PartTopic.CHRISTIAN_LIFE,
];

type PublicScheduleListViewProps = {
  view: PublicScheduleView;
  onPrintMode: () => void;
};

function formatScopeSubtitle(view: PublicScheduleView): string {
  if (view.yearMonth) {
    return `${view.title} · ${formatYearMonthLabel(view.yearMonth)}`;
  }

  const firstWeek = view.weeks[0];
  if (firstWeek) {
    return `${view.title} · ${formatDateBr(firstWeek.meetingDate)}`;
  }

  return view.title;
}

export function PublicScheduleListView({
  view,
  onPrintMode,
}: PublicScheduleListViewProps) {
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className={btnRowClass}>
        <button type="button" className={btnPrimary} onClick={onPrintMode}>
          Modo impressão
        </button>
      </div>

      <header className="flex flex-col gap-[var(--space-2)] border-b border-[var(--line)] pb-[var(--space-4)]">
        <h1 className="font-heading text-[var(--text-xl)] leading-tight">
          {view.congregationName}
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--muted)]">
          {formatScopeSubtitle(view)}
        </p>
      </header>

      {view.weeks.map((week) => (
        <section
          key={`${week.weekStartDate}-${week.meetingDate}`}
          className="flex flex-col gap-[var(--space-4)]"
        >
          {view.weeks.length > 1 ? (
            <h2 className="font-heading text-[var(--text-lg)] text-[var(--label)]">
              {formatDateBr(week.meetingDate)}
            </h2>
          ) : null}

          {TOPIC_ORDER.map((topic) => {
            const parts = week.parts.filter((part) => part.topic === topic);
            if (parts.length === 0) return null;

            return (
              <div key={topic} className="flex flex-col gap-[var(--space-3)]">
                <h3 className="text-label font-semibold uppercase tracking-wide">
                  {parts[0]?.topicLabel}
                </h3>
                <ul className="flex flex-col gap-[var(--space-3)]">
                  {parts.map((part) => (
                    <li
                      key={`${part.partTypeLabel}-${part.title}`}
                      className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-subtle)] px-[var(--space-4)] py-[var(--space-3)]"
                    >
                      <p className="font-medium text-[var(--ink)]">{part.title}</p>
                      <ul className="mt-[var(--space-2)] flex flex-col gap-[var(--space-2)]">
                        {part.slots.map((slot) => (
                          <li
                            key={`${slot.role}-${slot.roleLabel}`}
                            className="flex min-h-[44px] items-center justify-between gap-[var(--space-3)] text-[var(--text-sm)]"
                          >
                            <span className="text-[var(--muted)]">
                              {slot.roleLabel}
                            </span>
                            <span className="text-right font-medium text-[var(--ink)]">
                              {formatPublicParticipantName(slot.participantName)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
