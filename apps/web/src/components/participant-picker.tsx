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
import { AssignmentRole, Privilege, Sex } from "@jw/shared";
import {
  PRIVILEGE_LABELS,
  listParticipantAssignments,
  type AssignmentHistoryItem,
} from "@/lib/participants";
import { ParticipantAssignmentStrip } from "@/components/participant-assignment-strip";
import {
  ASSIGNMENT_COUNT_CATEGORY_LABELS,
  buildVisibleCountColumns,
  listEligibleParticipants,
  ROLE_LABELS,
  type AssignmentCountCategory,
  type EligibleParticipant,
  type EligibleParticipantsResult,
  type IneligibleVisible,
} from "@/lib/schedule";
import { fieldClass } from "@/lib/ui";

export type ParticipantPickerProps = {
  slotId: string;
  value: string | null;
  participantName?: string | null;
  disabled?: boolean;
  busy?: boolean;
  onSelect: (participantId: string, participantName: string) => void;
  onOpenChange?: (open: boolean) => void;
};

const pickerFieldClass = `${fieldClass} min-h-[44px] text-[var(--text-base)] disabled:cursor-not-allowed disabled:opacity-60`;

const filterSelectClass = `${fieldClass} min-h-[44px] w-full text-[var(--text-sm)]`;

type PickerFilters = {
  sex: "" | Sex.MALE | Sex.FEMALE;
  privilege: "" | Privilege;
  lastRole: "" | AssignmentRole;
};

const EMPTY_PICKER_FILTERS: PickerFilters = {
  sex: "",
  privilege: "",
  lastRole: "",
};

function getSlotFilters(
  map: Map<string, PickerFilters>,
  slotId: string,
): PickerFilters {
  return map.get(slotId) ?? EMPTY_PICKER_FILTERS;
}

function hasActivePickerFilters(filters: PickerFilters): boolean {
  return (
    filters.sex !== "" ||
    filters.privilege !== "" ||
    filters.lastRole !== ""
  );
}

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
  onOpenChange,
}: ParticipantPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtersBySlotRef = useRef<Map<string, PickerFilters>>(new Map());
  const listboxId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EligibleParticipantsResult | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [filters, setFilters] = useState<PickerFilters>(() =>
    getSlotFilters(filtersBySlotRef.current, slotId),
  );
  const assignmentCacheRef = useRef(new Map<string, AssignmentHistoryItem[]>());
  const assignmentErrorRef = useRef(new Map<string, string>());
  const assignmentLoadingRef = useRef(new Set<string>());
  const [assignmentRevision, setAssignmentRevision] = useState(0);

  const isDisabled = disabled || busy;
  const filtersActive = hasActivePickerFilters(filters);

  const ensureParticipantAssignments = useCallback(
    async (participantId: string) => {
      if (
        assignmentCacheRef.current.has(participantId) ||
        assignmentLoadingRef.current.has(participantId)
      ) {
        return;
      }

      assignmentLoadingRef.current.add(participantId);
      assignmentErrorRef.current.delete(participantId);
      setAssignmentRevision((n) => n + 1);

      try {
        const items = await listParticipantAssignments(participantId);
        assignmentCacheRef.current.set(participantId, items);
      } catch (err) {
        assignmentErrorRef.current.set(
          participantId,
          err instanceof Error
            ? err.message
            : "Não foi possível carregar designações.",
        );
      } finally {
        assignmentLoadingRef.current.delete(participantId);
        setAssignmentRevision((n) => n + 1);
      }
    },
    [],
  );

  const getAssignmentStripState = useCallback(
    (participantId: string) => {
      void assignmentRevision;
      return {
        assignments: assignmentCacheRef.current.get(participantId),
        loading: assignmentLoadingRef.current.has(participantId),
        error: assignmentErrorRef.current.get(participantId) ?? null,
      };
    },
    [assignmentRevision],
  );

  const filteredEligible = useMemo(() => {
    if (!data) return [];
    return data.eligible
      .filter((p) => !filters.sex || p.sex === filters.sex)
      .filter((p) => !filters.privilege || p.privilege === filters.privilege)
      .filter((p) => {
        if (!filters.lastRole) return true;
        return p.lastAssignment?.role === filters.lastRole;
      })
      .filter((p) => matchesQuery(p.name, query));
  }, [data, filters, query]);

  const ineligibleVisible = data?.ineligibleVisible ?? [];

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setHighlightIndex(-1);
    onOpenChange?.(false);
  }, [onOpenChange]);

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
    onOpenChange?.(true);
    if (!data || data.slotId !== slotId) {
      void loadParticipants();
    }
  }, [data, isDisabled, loadParticipants, onOpenChange, slotId]);

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
    setFilters(getSlotFilters(filtersBySlotRef.current, slotId));
  }, [slotId]);

  const persistFilters = useCallback(
    (next: PickerFilters) => {
      filtersBySlotRef.current.set(slotId, next);
      setFilters(next);
      setHighlightIndex(-1);
    },
    [slotId],
  );

  const clearPickerFilters = useCallback(() => {
    persistFilters(EMPTY_PICKER_FILTERS);
  }, [persistFilters]);

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
    onSelect(participant.id, participant.name);
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
        className={pickerFieldClass}
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
          <div
            className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--surface)] p-[var(--space-2)]"
            onMouseDown={(event) => event.preventDefault()}
          >
            <div className="grid grid-cols-1 gap-[var(--space-2)] sm:grid-cols-3">
              <label className="flex min-w-0 flex-col gap-[var(--space-1)] text-[var(--text-xs)] text-[var(--muted)]">
                Sexo
                <select
                  className={filterSelectClass}
                  value={filters.sex}
                  aria-label="Filtrar por sexo"
                  onChange={(event) =>
                    persistFilters({
                      ...filters,
                      sex: event.target.value as PickerFilters["sex"],
                    })
                  }
                >
                  <option value="">Todos</option>
                  <option value={Sex.MALE}>Homens</option>
                  <option value={Sex.FEMALE}>Mulheres</option>
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-[var(--space-1)] text-[var(--text-xs)] text-[var(--muted)]">
                Privilégio
                <select
                  className={filterSelectClass}
                  value={filters.privilege}
                  aria-label="Filtrar por privilégio"
                  onChange={(event) =>
                    persistFilters({
                      ...filters,
                      privilege: event.target.value as PickerFilters["privilege"],
                    })
                  }
                >
                  <option value="">Todos</option>
                  {Object.values(Privilege).map((privilege) => (
                    <option key={privilege} value={privilege}>
                      {PRIVILEGE_LABELS[privilege]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-[var(--space-1)] text-[var(--text-xs)] text-[var(--muted)]">
                Última designação
                <select
                  className={filterSelectClass}
                  value={filters.lastRole}
                  aria-label="Filtrar por última designação"
                  onChange={(event) =>
                    persistFilters({
                      ...filters,
                      lastRole: event.target.value as PickerFilters["lastRole"],
                    })
                  }
                >
                  <option value="">Qualquer</option>
                  {Object.values(AssignmentRole).map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {filtersActive ? (
              <button
                type="button"
                className="mt-[var(--space-2)] min-h-[44px] w-full rounded-[var(--radius-sm)] border border-[var(--line)] px-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))]"
                onClick={clearPickerFilters}
              >
                Limpar filtros
              </button>
            ) : null}
          </div>

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

          {!loading && !error && data && filteredEligible.length === 0 ? (
            <div className="px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-sm)] text-[var(--muted)]">
              {data.eligible.length === 0 ? (
                <p>Nenhum participante elegível</p>
              ) : (
                <>
                  <p>Nenhum participante com esses filtros</p>
                  {filtersActive ? (
                    <button
                      type="button"
                      className="mt-[var(--space-2)] text-[var(--accent)] underline-offset-2 hover:underline"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={clearPickerFilters}
                    >
                      Limpar filtros
                    </button>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          {!loading && !error && filteredEligible.length > 0 ? (
            <ul className="divide-y divide-[var(--line)]">
              {filteredEligible.map((participant, index) => (
                <EligibleOption
                  key={participant.id}
                  id={`${listboxId}-option-${index}`}
                  participant={participant}
                  sortCategory={data?.sortCategory ?? null}
                  highlighted={index === highlightIndex}
                  onSelect={() => selectParticipant(participant)}
                  onHover={() => setHighlightIndex(index)}
                  assignmentStripState={getAssignmentStripState(participant.id)}
                  onEnsureAssignments={ensureParticipantAssignments}
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

type ParticipantCountTableProps = {
  sortCategory: AssignmentCountCategory | null;
  countsThisMonth: Partial<Record<AssignmentCountCategory, number>>;
  countsTotal: Partial<Record<AssignmentCountCategory, number>>;
};

function ParticipantCountTable({
  sortCategory,
  countsThisMonth,
  countsTotal,
}: ParticipantCountTableProps) {
  const columns = buildVisibleCountColumns(
    sortCategory,
    countsThisMonth,
    countsTotal,
  );

  if (columns.length === 0) {
    return null;
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <th className="pr-[var(--space-2)] text-left font-medium text-[var(--muted)]">
            Quando
          </th>
          {columns.map((category) => (
            <th
              key={category}
              className="px-[var(--space-1)] text-center font-medium text-[var(--muted)]"
            >
              {ASSIGNMENT_COUNT_CATEGORY_LABELS[category]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="pr-[var(--space-2)] text-left text-[var(--muted)]">
            Este mês
          </td>
          {columns.map((category) => (
            <td
              key={category}
              className="px-[var(--space-1)] text-center tabular-nums text-[var(--ink)]"
            >
              {countsThisMonth[category] ?? 0}
            </td>
          ))}
        </tr>
        <tr>
          <td className="pr-[var(--space-2)] text-left text-[var(--muted)]">
            Total
          </td>
          {columns.map((category) => (
            <td
              key={category}
              className="px-[var(--space-1)] text-center tabular-nums text-[var(--ink)]"
            >
              {countsTotal[category] ?? 0}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

type AssignmentStripState = {
  assignments: AssignmentHistoryItem[] | undefined;
  loading: boolean;
  error: string | null;
};

type EligibleOptionProps = {
  id: string;
  participant: EligibleParticipant;
  sortCategory: AssignmentCountCategory | null;
  highlighted: boolean;
  onSelect: () => void;
  onHover: () => void;
  assignmentStripState: AssignmentStripState;
  onEnsureAssignments: (participantId: string) => void;
};

function EligibleOption({
  id,
  participant,
  sortCategory,
  highlighted,
  onSelect,
  onHover,
  assignmentStripState,
  onEnsureAssignments,
}: EligibleOptionProps) {
  const [stripOpen, setStripOpen] = useState(false);

  return (
    <li
      id={id}
      role="option"
      aria-selected={highlighted}
      className={`min-h-[44px] px-[var(--space-3)] py-[var(--space-2)] transition-colors ${
        highlighted
          ? "bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))]"
          : "hover:bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))]"
      }`}
      onMouseEnter={onHover}
    >
      <div
        className="cursor-pointer"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onSelect}
      >
        <div className="flex items-center justify-between gap-[var(--space-2)]">
          <span className="text-[var(--text-base)] text-[var(--ink)]">
            {participant.name}
          </span>
          <span className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--line)] px-[var(--space-2)] py-[var(--space-1)] text-[var(--text-xs)] text-[var(--muted)]">
            {privilegeLabel(participant.privilege)}
          </span>
        </div>
        <div className="mt-[var(--space-2)] overflow-x-auto">
          <ParticipantCountTable
            sortCategory={sortCategory}
            countsThisMonth={participant.countsThisMonth}
            countsTotal={participant.countsTotal}
          />
        </div>
      </div>
      <ParticipantAssignmentStrip
        participantId={participant.id}
        open={stripOpen}
        onToggle={() => setStripOpen((prev) => !prev)}
        assignments={assignmentStripState.assignments}
        loading={assignmentStripState.loading}
        error={assignmentStripState.error}
        onEnsureLoaded={onEnsureAssignments}
      />
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
