"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Privilege, Sex } from "@jw/shared";
import {
  PARTICIPANT_COUNTER_FIELDS,
  PARTICIPANT_COUNTER_LABELS,
  PRIVILEGE_LABELS,
  SEX_LABELS,
  listParticipants,
  privilegesForSexLabel,
  type ParticipantCounterField,
  type ParticipantListFilters,
  type ParticipantListItem,
} from "@/lib/participants";
import { btnPrimary, fieldClass, pageMainClass } from "@/lib/ui";

const selectClass = `${fieldClass} min-h-[44px] text-[var(--text-base)]`;

type AssociationFilter = "" | "any" | "none" | "with";

function countActiveFilters(filters: ParticipantListFilters): number {
  let n = 0;
  if (filters.q?.trim()) n += 1;
  if (filters.sex) n += 1;
  if (filters.privilege) n += 1;
  if (filters.counter) n += 1;
  if (filters.association || filters.associatedWith) n += 1;
  return n;
}

function formatCounterSummary(counters: ParticipantListItem["counters"]): string {
  const parts = PARTICIPANT_COUNTER_FIELDS
    .map((key) => {
      const value = counters[key];
      if (!value) return null;
      return `${PARTICIPANT_COUNTER_LABELS[key]}: ${value}`;
    })
    .filter(Boolean);
  return parts.join(" · ");
}

export default function ParticipantsPage() {
  const [items, setItems] = useState<ParticipantListItem[] | null>(null);
  const [allForAssociation, setAllForAssociation] = useState<
    ParticipantListItem[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [nameQuery, setNameQuery] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [sexFilter, setSexFilter] = useState<Sex | "">("");
  const [privilegeFilter, setPrivilegeFilter] = useState<Privilege | "">("");
  const [counterField, setCounterField] = useState<ParticipantCounterField | "">(
    "",
  );
  const [counterMin, setCounterMin] = useState("");
  const [counterMax, setCounterMax] = useState("");
  const [associationFilter, setAssociationFilter] =
    useState<AssociationFilter>("");
  const [associatedWithId, setAssociatedWithId] = useState("");
  const [sortCounter, setSortCounter] = useState<ParticipantCounterField | "">(
    "",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedName(nameQuery);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [nameQuery]);

  const appliedFilters = useMemo((): ParticipantListFilters => {
    const filters: ParticipantListFilters = {};
    if (debouncedName.trim()) filters.q = debouncedName.trim();
    if (sexFilter) filters.sex = sexFilter;
    if (privilegeFilter) filters.privilege = privilegeFilter;
    if (counterField) {
      filters.counter = counterField;
      const min = counterMin.trim();
      const max = counterMax.trim();
      if (min !== "") filters.counterMin = Number(min);
      if (max !== "") filters.counterMax = Number(max);
    }
    if (associationFilter === "any") filters.association = "any";
    if (associationFilter === "none") filters.association = "none";
    if (associationFilter === "with" && associatedWithId) {
      filters.associatedWith = associatedWithId;
    }
    if (sortCounter) {
      filters.sortCounter = sortCounter;
      filters.sortDir = sortDir;
    }
    return filters;
  }, [
    debouncedName,
    sexFilter,
    privilegeFilter,
    counterField,
    counterMin,
    counterMax,
    associationFilter,
    associatedWithId,
    sortCounter,
    sortDir,
  ]);

  const privilegeOptions = useMemo(() => {
    if (sexFilter) return privilegesForSexLabel(sexFilter);
    return Object.values(Privilege);
  }, [sexFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listParticipants(appliedFilters);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar participantes.",
      );
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await listParticipants();
        if (!cancelled) setAllForAssociation(data);
      } catch {
        /* ignore — dropdown opcional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function clearFilters() {
    setNameQuery("");
    setSexFilter("");
    setPrivilegeFilter("");
    setCounterField("");
    setCounterMin("");
    setCounterMax("");
    setAssociationFilter("");
    setAssociatedWithId("");
    setSortCounter("");
    setSortDir("asc");
  }

  const activeFilterCount = countActiveFilters(appliedFilters);

  return (
    <main className={pageMainClass}>
      <header className="page-rise flex items-start justify-between gap-[var(--space-4)] border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <div>
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            <Link
              href="/"
              className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Início
            </Link>
          </p>
          <h1 className="mt-[var(--space-1)] font-heading text-[var(--text-xl)]">
            Participantes
          </h1>
        </div>
        <Link href="/participants/new" className={`${btnPrimary} shrink-0`}>
          Novo
        </Link>
      </header>

      <section
        aria-label="Filtros"
        className="page-rise-delay flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-[var(--space-4)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
          <h2 className="font-heading text-[var(--text-base)]">Filtros</h2>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[var(--text-sm)] text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Limpar filtros ({activeFilterCount})
            </button>
          ) : null}
        </div>

        <label className="flex flex-col gap-[var(--space-1)]">
          <span className="text-label">Nome</span>
          <input
            type="search"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Buscar por nome…"
            className={fieldClass}
          />
        </label>

        <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="text-label">Sexo</span>
            <select
              value={sexFilter}
              onChange={(e) => {
                const next = e.target.value as Sex | "";
                setSexFilter(next);
                if (
                  privilegeFilter &&
                  next &&
                  !privilegesForSexLabel(next).includes(privilegeFilter)
                ) {
                  setPrivilegeFilter("");
                }
              }}
              className={selectClass}
            >
              <option value="">Todos</option>
              <option value={Sex.MALE}>{SEX_LABELS[Sex.MALE]}</option>
              <option value={Sex.FEMALE}>{SEX_LABELS[Sex.FEMALE]}</option>
            </select>
          </label>

          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="text-label">Privilégio</span>
            <select
              value={privilegeFilter}
              onChange={(e) =>
                setPrivilegeFilter(e.target.value as Privilege | "")
              }
              className={selectClass}
            >
              <option value="">Todos</option>
              {privilegeOptions.map((p) => (
                <option key={p} value={p}>
                  {PRIVILEGE_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-[var(--space-3)] sm:grid-cols-3">
          <label className="flex flex-col gap-[var(--space-1)] sm:col-span-1">
            <span className="text-label">Contador</span>
            <select
              value={counterField}
              onChange={(e) =>
                setCounterField(e.target.value as ParticipantCounterField | "")
              }
              className={selectClass}
            >
              <option value="">Qualquer</option>
              {PARTICIPANT_COUNTER_FIELDS.map((field) => (
                <option key={field} value={field}>
                  {PARTICIPANT_COUNTER_LABELS[field]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="text-label">Mínimo</span>
            <input
              type="number"
              min={0}
              value={counterMin}
              onChange={(e) => setCounterMin(e.target.value)}
              disabled={!counterField}
              placeholder="—"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="text-label">Máximo</span>
            <input
              type="number"
              min={0}
              value={counterMax}
              onChange={(e) => setCounterMax(e.target.value)}
              disabled={!counterField}
              placeholder="—"
              className={fieldClass}
            />
          </label>
        </div>

        <p className="text-[var(--text-xs)] text-[var(--muted)]">
          Com tipo de contador selecionado e sem mín/máx, mostra quem tem pelo
          menos 1 nessa categoria.
        </p>

        <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="text-label">Associação</span>
            <select
              value={associationFilter}
              onChange={(e) => {
                const next = e.target.value as AssociationFilter;
                setAssociationFilter(next);
                if (next !== "with") setAssociatedWithId("");
              }}
              className={selectClass}
            >
              <option value="">Todas</option>
              <option value="any">Com associação</option>
              <option value="none">Sem associação</option>
              <option value="with">Associado a…</option>
            </select>
          </label>

          {associationFilter === "with" ? (
            <label className="flex flex-col gap-[var(--space-1)]">
              <span className="text-label">Participante</span>
              <select
                value={associatedWithId}
                onChange={(e) => setAssociatedWithId(e.target.value)}
                className={selectClass}
              >
                <option value="">Selecione…</option>
                {allForAssociation.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="text-label">Ordenar por contador</span>
            <select
              value={sortCounter}
              onChange={(e) =>
                setSortCounter(e.target.value as ParticipantCounterField | "")
              }
              className={selectClass}
            >
              <option value="">Nome (padrão)</option>
              {PARTICIPANT_COUNTER_FIELDS.map((field) => (
                <option key={field} value={field}>
                  {PARTICIPANT_COUNTER_LABELS[field]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-[var(--space-1)]">
            <span className="text-label">Ordem</span>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
              disabled={!sortCounter}
              className={selectClass}
            >
              <option value="asc">Menor primeiro</option>
              <option value="desc">Maior primeiro</option>
            </select>
          </label>
        </div>
      </section>

      {error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
      ) : null}

      {!loading && items && items.length === 0 ? (
        <div className="page-rise-delay rounded-[var(--radius-md)] border border-dashed border-[var(--line)] bg-[var(--surface)] px-[var(--space-4)] py-[var(--space-5)]">
          <p className="text-[var(--text-base)] text-[var(--ink)]">
            {activeFilterCount > 0
              ? "Nenhum participante corresponde aos filtros."
              : "Nenhum participante cadastrado."}
          </p>
          {activeFilterCount === 0 ? (
            <Link
              href="/participants/new"
              className="mt-[var(--space-4)] inline-block text-[var(--text-sm)] font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Cadastrar participante
            </Link>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-[var(--space-4)] text-[var(--text-sm)] font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : null}

      {!loading && items && items.length > 0 ? (
        <>
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            {items.length} participante{items.length === 1 ? "" : "s"}
          </p>
          <ul className="page-rise-delay flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {items.map((item) => {
              const counterSummary = formatCounterSummary(item.counters);
              return (
                <li key={item.id}>
                  <Link
                    href={`/participants/${item.id}`}
                    className="list-row flex flex-col gap-[var(--space-1)] py-[var(--space-4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--focus-ring)]"
                  >
                    <span className="text-[var(--text-base)] font-medium text-[var(--ink)]">
                      {item.name}
                    </span>
                    <span className="text-[var(--text-sm)] text-[var(--muted)]">
                      {SEX_LABELS[item.sex]} ·{" "}
                      {PRIVILEGE_LABELS[item.privilege]}
                      {item.qualified ? " · Qualificado" : ""}
                      {item.associationCount > 0
                        ? ` · ${item.associationCount} associação${item.associationCount === 1 ? "" : "ões"}`
                        : ""}
                    </span>
                    {counterSummary ? (
                      <span className="text-[var(--text-xs)] text-[var(--muted)]">
                        {counterSummary}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </main>
  );
}
