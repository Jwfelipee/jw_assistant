"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { PartTopic } from "@jw/shared";
import { TOPIC_LABELS } from "@/lib/schedule";
import type { PartTypeDto } from "@/lib/catalog";

export type AddWeekPartModalProps = {
  open: boolean;
  onClose: () => void;
  topic: PartTopic.MINISTRY | PartTopic.CHRISTIAN_LIFE;
  partTypes: PartTypeDto[];
  onConfirm: (partTypeId: string, title?: string) => Promise<void>;
  pending?: boolean;
};

const fieldClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)]";

const btnPrimary =
  "rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60";

const btnGhost =
  "rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60";

export function AddWeekPartModal({
  open,
  onClose,
  topic,
  partTypes,
  onConfirm,
  pending = false,
}: AddWeekPartModalProps) {
  const titleId = useId();
  const [partTypeId, setPartTypeId] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setPartTypeId(partTypes[0]?.id ?? "");
  }, [open, topic, partTypes]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, pending]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!partTypeId || pending) return;
    await onConfirm(partTypeId, title.trim() || undefined);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-[var(--page-pad)] sm:items-center"
      onClick={() => {
        if (!pending) onClose();
      }}
    >
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_40%,transparent)]"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md border border-[var(--line)] bg-[var(--surface)] p-[var(--space-5)] shadow-[0_8px_32px_color-mix(in_srgb,var(--ink)_16%,transparent)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id={titleId}
          className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
        >
          Adicionar parte — {TOPIC_LABELS[topic]}
        </h2>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]"
        >
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            Tipo
            <select
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={partTypeId}
              onChange={(event) => setPartTypeId(event.target.value)}
              required
              disabled={pending || partTypes.length === 0}
            >
              {partTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            Tema (opcional)
            <input
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={300}
              placeholder="Texto livre do tema"
              disabled={pending}
            />
          </label>
          <div className="mt-[var(--space-2)] flex flex-wrap gap-[var(--space-3)]">
            <button
              type="submit"
              className={btnPrimary}
              disabled={pending || !partTypeId}
            >
              {pending ? "Adicionando…" : "Adicionar"}
            </button>
            <button
              type="button"
              className={btnGhost}
              disabled={pending}
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
