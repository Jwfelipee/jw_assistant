"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AssignmentRole, PartTopic, Sex } from "@jw/shared";
import { listPartTypes, type PartTypeDto } from "@/lib/catalog";
import {
  ROLE_LABELS,
  TOPIC_LABELS,
  fetchAssignmentHistory,
  formatDateBr,
  type HistoryItem,
  type StudyHistoryRole,
} from "@/lib/schedule";
import { btnOutline, btnPrimary, btnRowClass, btnSecondary, fieldClass } from "@/lib/ui";

const STUDY_PART_CODE = "ESTUDO_BIBLICO";

type Filters = {
  q: string;
  from: string;
  to: string;
  partTypeId: string;
  sex: string;
  role: string;
  studyRole: string;
  lastPerParticipant: boolean;
};

const emptyFilters: Filters = {
  q: "",
  from: "",
  to: "",
  partTypeId: "",
  sex: "",
  role: "",
  studyRole: "",
  lastPerParticipant: false,
};

function buildHistoryQuery(
  f: Filters,
  partTypes: PartTypeDto[],
  page: number,
  limit: number,
) {
  const selected = f.partTypeId
    ? partTypes.find((pt) => pt.id === f.partTypeId)
    : undefined;
  const isStudy = selected?.code === STUDY_PART_CODE;

  return {
    q: f.q || undefined,
    from: f.from || undefined,
    to: f.to || undefined,
    partTypeId: f.partTypeId || undefined,
    sex: f.sex ? (f.sex as Sex) : undefined,
    lastPerParticipant: f.lastPerParticipant ? true : undefined,
    ...(isStudy && f.studyRole
      ? { studyRole: f.studyRole as StudyHistoryRole }
      : f.role
        ? { role: f.role as AssignmentRole }
        : {}),
    page,
    limit,
  };
}

export function AssignmentHistoryView() {
  const [partTypes, setPartTypes] = useState<PartTypeDto[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const partTypesByTopic = useMemo(() => {
    const sorted = [...partTypes].sort(
      (a, b) => a.defaultSortOrder - b.defaultSortOrder,
    );
    const groups = new Map<PartTopic, PartTypeDto[]>();
    for (const pt of sorted) {
      const list = groups.get(pt.topic) ?? [];
      list.push(pt);
      groups.set(pt.topic, list);
    }
    return groups;
  }, [partTypes]);

  const filterSelectedPartType = filters.partTypeId
    ? partTypes.find((pt) => pt.id === filters.partTypeId)
    : undefined;
  const showStudyRoleSelect =
    filterSelectedPartType?.code === STUDY_PART_CODE;

  const load = useCallback(
    async (f: Filters, p: number, catalog: PartTypeDto[]) => {
      setError(null);
      setLoading(true);
      try {
        const result = await fetchAssignmentHistory(
          buildHistoryQuery(f, catalog, p, limit),
        );
        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o histórico.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await listPartTypes();
        if (cancelled) return;
        const sorted = [...rows].sort(
          (a, b) => a.defaultSortOrder - b.defaultSortOrder,
        );
        setPartTypes(sorted);
        void load(emptyFilters, 1, sorted);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o catálogo.",
        );
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setApplied(filters);
    void load(filters, 1, partTypes);
  }

  function onClear() {
    setFilters(emptyFilters);
    setApplied(emptyFilters);
    void load(emptyFilters, 1, partTypes);
  }

  function onPartTypeChange(partTypeId: string) {
    setFilters((prev) => {
      const pt = partTypes.find((p) => p.id === partTypeId);
      const isStudy = pt?.code === STUDY_PART_CODE;
      return {
        ...prev,
        partTypeId,
        role: isStudy ? "" : prev.role,
        studyRole: isStudy ? prev.studyRole : "",
      };
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <form
        onSubmit={onSearch}
        className="flex flex-col gap-[var(--space-3)] border-t border-[var(--line)] pt-[var(--space-5)]"
      >
        <label className="text-[var(--text-sm)] text-[var(--muted)]">
          Nome do participante
          <input
            className={`${fieldClass} mt-[var(--space-1)]`}
            value={filters.q}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, q: e.target.value }))
            }
            placeholder="Buscar por nome"
            autoComplete="off"
          />
        </label>
        <div className="grid grid-cols-2 gap-[var(--space-3)]">
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            De
            <input
              type="date"
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </label>
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            Até
            <input
              type="date"
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </label>
        </div>
        <label className="text-[var(--text-sm)] text-[var(--muted)]">
          Designação
          <select
            className={`${fieldClass} mt-[var(--space-1)]`}
            value={filters.partTypeId}
            onChange={(e) => onPartTypeChange(e.target.value)}
          >
            <option value="">Todas as designações</option>
            {Object.values(PartTopic).map((topic) => {
              const types = partTypesByTopic.get(topic);
              if (!types?.length) return null;
              return (
                <optgroup key={topic} label={TOPIC_LABELS[topic]}>
                  {types.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.label}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </label>
        <label className="text-[var(--text-sm)] text-[var(--muted)]">
          Sexo
          <select
            className={`${fieldClass} mt-[var(--space-1)]`}
            value={filters.sex}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sex: e.target.value }))
            }
          >
            <option value="">Todos</option>
            <option value={Sex.MALE}>Homens</option>
            <option value={Sex.FEMALE}>Mulheres</option>
          </select>
        </label>
        {showStudyRoleSelect ? (
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            Papel no estudo
            <select
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={filters.studyRole}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, studyRole: e.target.value }))
              }
            >
              <option value="">Todos os papéis</option>
              <option value="DIRIGENTE">Dirigente</option>
              <option value="LEITOR">Leitor</option>
              <option value="BOTH">Dirigente e leitor</option>
            </select>
          </label>
        ) : (
          <label className="text-[var(--text-sm)] text-[var(--muted)]">
            Papel
            <select
              className={`${fieldClass} mt-[var(--space-1)]`}
              value={filters.role}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="">Todos</option>
              {Object.values(AssignmentRole).map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-start gap-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
          <input
            type="checkbox"
            className="mt-[var(--space-1)]"
            checked={filters.lastPerParticipant}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                lastPerParticipant: e.target.checked,
              }))
            }
          />
          <span>
            Apenas a última designação de cada participante
            <span className="mt-[var(--space-1)] block text-[var(--text-xs)]">
              Com período definido, considera a última designação dentro do
              intervalo.
            </span>
          </span>
        </label>
        <div className={btnRowClass}>
          <button type="submit" className={btnPrimary} disabled={loading}>
            Filtrar
          </button>
          <button type="button" className={btnOutline} onClick={onClear}>
            Limpar
          </button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section aria-live="polite">
        {loading ? (
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            Carregando…
          </p>
        ) : items.length === 0 ? (
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            Nenhuma designação encontrada
            {applied.q ? ` para “${applied.q}”` : ""}.
          </p>
        ) : (
          <>
            <p className="text-[var(--text-sm)] text-[var(--muted)]">
              {total} resultado{total === 1 ? "" : "s"}
            </p>
            <ul className="mt-[var(--space-3)] flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-[var(--space-1)] py-[var(--space-3)]"
                >
                  <p className="font-medium text-[var(--ink)]">
                    {item.participantName ?? "—"}
                  </p>
                  <p className="text-[var(--text-sm)] text-[var(--muted)]">
                    {formatDateBr(item.meetingDate)} · {ROLE_LABELS[item.role]}{" "}
                    · {item.partTypeLabel}
                  </p>
                  <p className="text-[var(--text-sm)] text-[var(--muted)]">
                    {TOPIC_LABELS[item.partTopic]}
                    {item.partTitle && item.partTitle !== item.partTypeLabel
                      ? ` — ${item.partTitle}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
            {totalPages > 1 ? (
              <div className="mt-[var(--space-4)] flex items-center justify-between gap-[var(--space-3)]">
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={page <= 1 || loading}
                  onClick={() => void load(applied, page - 1, partTypes)}
                >
                  Anterior
                </button>
                <span className="text-[var(--text-sm)] text-[var(--muted)]">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={page >= totalPages || loading}
                  onClick={() => void load(applied, page + 1, partTypes)}
                >
                  Próxima
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
