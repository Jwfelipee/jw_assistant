"use client";

import { useEffect, type MouseEvent } from "react";
import { AssignmentRole } from "@jw/shared";
import { ROLE_LABELS, formatDateBr } from "@/lib/schedule";
import type { AssignmentHistoryItem } from "@/lib/participants";

export type ParticipantAssignmentStripProps = {
  participantId: string;
  open: boolean;
  onToggle: () => void;
  assignments: AssignmentHistoryItem[] | undefined;
  loading: boolean;
  error: string | null;
  onEnsureLoaded: (participantId: string) => void;
};

function roleLabel(role: string): string {
  return ROLE_LABELS[role as AssignmentRole] ?? role;
}

function stopRowPointer(event: MouseEvent) {
  event.stopPropagation();
}

export function ParticipantAssignmentStrip({
  participantId,
  open,
  onToggle,
  assignments,
  loading,
  error,
  onEnsureLoaded,
}: ParticipantAssignmentStripProps) {
  useEffect(() => {
    if (open) {
      onEnsureLoaded(participantId);
    }
  }, [open, onEnsureLoaded, participantId]);

  return (
    <div className="mt-[var(--space-2)] flex flex-col items-stretch gap-[var(--space-1)]">
      <div className="flex justify-end">
        <button
          type="button"
          className="shrink-0 text-[var(--text-xs)] text-[var(--accent)] underline-offset-2 hover:underline"
          aria-expanded={open}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          Designações
        </button>
      </div>

      {open ? (
        <div
          className="max-h-[4.5rem] overflow-y-auto overscroll-contain rounded-[var(--radius-sm)] border border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_3%,var(--surface))] px-[var(--space-2)] py-[var(--space-1)]"
          onMouseDown={stopRowPointer}
          onClick={stopRowPointer}
          onWheel={stopRowPointer}
        >
          {loading && assignments === undefined ? (
            <p className="py-[var(--space-1)] text-[var(--text-xs)] text-[var(--muted)]">
              Carregando…
            </p>
          ) : null}

          {!loading && error ? (
            <p className="py-[var(--space-1)] text-[var(--text-xs)] text-[var(--danger)]">
              {error}
            </p>
          ) : null}

          {!loading && !error && assignments !== undefined && assignments.length === 0 ? (
            <p className="py-[var(--space-1)] text-[var(--text-xs)] text-[var(--muted)]">
              Nenhuma designação
            </p>
          ) : null}

          {!loading && !error && assignments && assignments.length > 0 ? (
            <ul className="divide-y divide-[var(--line)]">
              {assignments.map((item) => (
                <li
                  key={item.id}
                  className="truncate py-[var(--space-1)] text-[var(--text-xs)] text-[var(--muted)]"
                  title={`${formatDateBr(item.meetingDate)} · ${roleLabel(item.role)} · ${item.partTypeLabel}`}
                >
                  {formatDateBr(item.meetingDate)} · {roleLabel(item.role)} ·{" "}
                  {item.partTypeLabel}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
