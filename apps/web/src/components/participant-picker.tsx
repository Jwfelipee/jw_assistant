"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Privilege } from "@jw/shared";
import { PRIVILEGE_LABELS } from "@/lib/participants";
import {
  listEligibleParticipants,
  type EligibleParticipant,
  type EligibleParticipantsResult,
  type IneligibleVisible,
} from "@/lib/schedule";

export type ParticipantPickerProps = {
  slotId: string;
  value: string | null;
  participantName?: string | null;
  disabled?: boolean;
  busy?: boolean;
  onSelect: (participantId: string) => void;
};

const fieldClass =
  "w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-base)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)] disabled:cursor-not-allowed disabled:opacity-60";

function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function matchesQuery(name: string, query: string): boolean {
  if (!query.trim()) return true;
  return normalizeForSearch(name).includes(normalizeForSearch(query));
}

function privilegeLabel(privilege: string): string {
  return PRIVILEGE_LABELS[privilege as Privilege] ?? privilege;
}

export function ParticipantPicker({
  slotId,
  value,
  participantName,
  disabled = false,
  busy = false,
  onSelect,
}: ParticipantPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EligibleParticipantsResult | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const isDisabled = disabled || busy;

  const filteredEligible = useMemo(() => {
    if (!data) return [];
    return data.eligible.filter((p) => matchesQuery(p.name, query));
  }, [data, query]);

  const ineligibleVisible = data?.ineligibleVisible ?? [];

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setHighlightIndex(-1);
  }, []);

  const loadParticipants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listEligibleParticipants(slotId);
      setData(result);
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar participantes.",
      );
    } finally {
      setLoading(false);
    }
  }, [slotId]);

  const openDropdown = useCallback(() => {
    if (isDisabled) return;
    setIsOpen(true);
    setHighlightIndex(-1);
    if (!data || data.slotId !== slotId) {
      void loadParticipants();
    }
  }, [data, isDisabled, loadParticipants, slotId]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [closeDropdown, isOpen]);

  useEffect(() => {
    setData(null);
    setError(null);
    setQuery("");
    setHighlightIndex(-1);
  }, [slotId]);

  useEffect(() => {
    if (highlightIndex >= filteredEligible.length) {
      setHighlightIndex(filteredEligible.length > 0 ? 0 : -1);
    }
  }, [filteredEligible.length, highlightIndex]);

  const displayValue = isOpen
    ? query
    : value && participantName
      ? participantName
      : "";

  function selectParticipant(participant: EligibleParticipant) {
    onSelect(participant.id);
    closeDropdown();
    inputRef.current?.blur();
  }

  function handleInputFocus() {
    openDropdown();
  }

  function handleInputChange(nextQuery: string) {
    if (!isOpen) openDropdown();
    setQuery(nextQuery);
    setHighlightIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (filteredEligible.length === 0) return;
        setHighlightIndex((prev) =>
          prev < filteredEligible.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        if (filteredEligible.length === 0) return;
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filteredEligible.length - 1,
        );
        break;
      case "Enter":
        event.preventDefault();
        if (
          highlightIndex >= 0 &&
          highlightIndex < filteredEligible.length
        ) {
          selectParticipant(filteredEligible[highlightIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;
      default:
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          highlightIndex >= 0
            ? `${listboxId}-option-${highlightIndex}`
            : undefined
        }
        className={fieldClass}
        value={displayValue}
        placeholder="Buscar participante…"
        disabled={isDisabled}
        onFocus={handleInputFocus}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-[var(--space-1)] max-h-[min(18rem,calc(100dvh-8rem))] w-full overflow-y-auto rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[0_8px_24px_color-mix(in_srgb,var(--ink)_12%,transparent)]"
        >
          {loading ? (
            <p className="px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-sm)] text-[var(--muted)]">
              Carregando…
            </p>
          ) : null}

          {!loading && error ? (
            <p className="px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-sm)] text-[var(--danger)]">
              {error}
            </p>
          ) : null}

          {!loading && !error && filteredEligible.length === 0 ? (
            <p className="px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-sm)] text-[var(--muted)]">
              Nenhum participante elegível
            </p>
          ) : null}

          {!loading && !error && filteredEligible.length > 0 ? (
            <ul className="divide-y divide-[var(--line)]">
              {filteredEligible.map((participant, index) => (
                <EligibleOption
                  key={participant.id}
                  id={`${listboxId}-option-${index}`}
                  participant={participant}
                  highlighted={index === highlightIndex}
                  onSelect={() => selectParticipant(participant)}
                  onHover={() => setHighlightIndex(index)}
                />
              ))}
            </ul>
          ) : null}

          {!loading && !error && ineligibleVisible.length > 0 ? (
            <>
              <div
                className="border-t border-[var(--line)]"
                role="separator"
                aria-hidden="true"
              />
              <ul className="divide-y divide-[var(--line)]">
                {ineligibleVisible.map((participant) => (
                  <IneligibleOption
                    key={participant.id}
                    participant={participant}
                  />
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type EligibleOptionProps = {
  id: string;
  participant: EligibleParticipant;
  highlighted: boolean;
  onSelect: () => void;
  onHover: () => void;
};

function EligibleOption({
  id,
  participant,
  highlighted,
  onSelect,
  onHover,
}: EligibleOptionProps) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={highlighted}
      className={`min-h-[44px] cursor-pointer px-[var(--space-3)] py-[var(--space-2)] transition-colors ${
        highlighted
          ? "bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))]"
          : "hover:bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))]"
      }`}
      onMouseEnter={onHover}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-[var(--space-2)]">
        <span className="text-[var(--text-base)] text-[var(--ink)]">
          {participant.name}
        </span>
        <span className="flex shrink-0 items-center gap-[var(--space-2)]">
          <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-[var(--space-2)] py-[var(--space-1)] text-[var(--text-xs)] text-[var(--muted)]">
            {privilegeLabel(participant.privilege)}
          </span>
          <span className="tabular-nums text-[var(--text-sm)] text-[var(--muted)]">
            {participant.counter}
          </span>
        </span>
      </div>
    </li>
  );
}

type IneligibleOptionProps = {
  participant: IneligibleVisible;
};

function IneligibleOption({ participant }: IneligibleOptionProps) {
  return (
    <li
      role="option"
      aria-selected="false"
      aria-disabled="true"
      className="min-h-[44px] cursor-not-allowed px-[var(--space-3)] py-[var(--space-2)] text-[var(--muted)]"
    >
      <p className="text-[var(--text-base)]">{participant.name}</p>
      <p className="mt-[var(--space-1)] text-[var(--text-sm)]">
        {participant.reason}
      </p>
    </li>
  );
}
