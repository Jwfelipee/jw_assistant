"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PartTopic, Sex, SlotMode } from "@jw/shared";
import {
  createPartType,
  deletePartType,
  listPartTypes,
  updatePartType,
  type PartTypeDto,
} from "@/lib/catalog";

type SexChoice = "MALE" | "FEMALE" | "BOTH";

type FormState = {
  label: string;
  sexChoice: SexChoice;
  slotMode: SlotMode;
};

const emptyForm: FormState = {
  label: "",
  sexChoice: "BOTH",
  slotMode: SlotMode.TWO,
};

function sexesFromChoice(choice: SexChoice): Sex[] {
  if (choice === "MALE") return [Sex.MALE];
  if (choice === "FEMALE") return [Sex.FEMALE];
  return [Sex.MALE, Sex.FEMALE];
}

function choiceFromSexes(sexes: Sex[]): SexChoice {
  const hasM = sexes.includes(Sex.MALE);
  const hasF = sexes.includes(Sex.FEMALE);
  if (hasM && hasF) return "BOTH";
  if (hasF) return "FEMALE";
  return "MALE";
}

function sexLabel(sexes: Sex[]): string {
  const hasM = sexes.includes(Sex.MALE);
  const hasF = sexes.includes(Sex.FEMALE);
  if (hasM && hasF) return "Homens e mulheres";
  if (hasF) return "Mulheres";
  return "Homens";
}

function slotLabel(mode: SlotMode): string {
  return mode === SlotMode.TWO
    ? "2 participantes (titular + ajudante)"
    : "1 participante";
}

export function CatalogClient() {
  const [items, setItems] = useState<PartTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    const rows = await listPartTypes(PartTopic.MINISTRY);
    setItems(rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await reload();
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Falha ao carregar o catálogo.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  function startEdit(item: PartTypeDto) {
    setEditingId(item.id);
    setForm({
      label: item.label,
      sexChoice: choiceFromSexes(item.allowedSexes),
      slotMode: item.slotMode,
    });
    setNotice(null);
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);

    const payload = {
      label: form.label.trim(),
      allowedSexes: sexesFromChoice(form.sexChoice),
      slotMode: form.slotMode,
    };

    try {
      if (editingId) {
        await updatePartType(editingId, payload);
        setNotice("Tipo atualizado.");
      } else {
        await createPartType({
          topic: PartTopic.MINISTRY,
          ...payload,
          countsAsMinistryPractice: true,
        });
        setNotice("Tipo criado.");
      }
      resetForm();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(item: PartTypeDto) {
    if (item.isSystem || !item.deletable) return;
    const ok = window.confirm(`Excluir “${item.label}”?`);
    if (!ok) return;

    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await deletePartType(item.id);
      if (editingId === item.id) resetForm();
      setNotice("Tipo excluído.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível excluir.");
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <header className="catalog-stage border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <p className="font-[family-name:var(--font-brand)] text-[var(--text-display)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
          Faça Seu Melhor
        </p>
        <p className="mt-[var(--space-2)] max-w-[22rem] text-[var(--text-sm)] leading-relaxed text-[var(--muted)]">
          Tipos de parte do ministério — sexo permitido e um ou dois
          participantes.
        </p>
        <Link
          href="/"
          className="mt-[var(--space-3)] inline-block text-[var(--text-sm)] text-[var(--accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Voltar ao início
        </Link>
      </header>

      <section
        aria-labelledby="catalog-list-heading"
        className="catalog-stage-delay"
      >
        <h2
          id="catalog-list-heading"
          className="mb-[var(--space-3)] font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
        >
          Tipos cadastrados
        </h2>

        {items.length === 0 ? (
          <p className="text-[var(--text-sm)] text-[var(--muted)]">
            Nenhum tipo ainda. Use o formulário abaixo para criar o primeiro.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-[var(--space-2)] py-[var(--space-4)] sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[var(--text-base)] font-medium text-[var(--ink)]">
                    {item.label}
                  </p>
                  <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--muted)]">
                    {sexLabel(item.allowedSexes)} · {slotLabel(item.slotMode)}
                  </p>
                  {item.isSystem ? (
                    <p className="mt-[var(--space-1)] text-[var(--text-xs)] text-[var(--muted)]">
                      Tipo de sistema
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-[var(--space-2)]">
                  {!item.isSystem ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => startEdit(item)}
                      className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
                    >
                      Editar
                    </button>
                  ) : null}
                  {!item.isSystem && item.deletable ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => void onDelete(item)}
                      className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--danger)] transition-colors hover:border-[var(--danger)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
                    >
                      Excluir
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="catalog-form-heading"
        className="catalog-stage-delay border-t border-[var(--line)] pt-[var(--space-5)]"
      >
        <h2
          id="catalog-form-heading"
          className="mb-[var(--space-4)] font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
        >
          {editingId ? "Editar tipo" : "Novo tipo"}
        </h2>

        <form
          onSubmit={onSubmit}
          className="flex max-w-[var(--content-max)] flex-col gap-[var(--space-4)]"
          noValidate
        >
          <div className="flex flex-col gap-[var(--space-2)]">
            <label
              htmlFor="part-label"
              className="text-[var(--text-sm)] text-[var(--muted)]"
            >
              Nome da parte
            </label>
            <input
              id="part-label"
              name="label"
              required
              value={form.label}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, label: e.target.value }))
              }
              className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-base)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)]"
            />
          </div>

          <fieldset className="flex flex-col gap-[var(--space-2)]">
            <legend className="text-[var(--text-sm)] text-[var(--muted)]">
              Sexo permitido
            </legend>
            <div className="flex flex-col gap-[var(--space-2)]">
              {(
                [
                  ["BOTH", "Homens e mulheres"],
                  ["MALE", "Somente homens"],
                  ["FEMALE", "Somente mulheres"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-[var(--space-2)] text-[var(--text-base)] text-[var(--ink)]"
                >
                  <input
                    type="radio"
                    name="sexChoice"
                    value={value}
                    checked={form.sexChoice === value}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, sexChoice: value }))
                    }
                    className="accent-[var(--accent)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-[var(--space-2)]">
            <legend className="text-[var(--text-sm)] text-[var(--muted)]">
              Participantes
            </legend>
            <div className="flex flex-col gap-[var(--space-2)]">
              <label className="flex cursor-pointer items-center gap-[var(--space-2)] text-[var(--text-base)] text-[var(--ink)]">
                <input
                  type="radio"
                  name="slotMode"
                  value={SlotMode.ONE}
                  checked={form.slotMode === SlotMode.ONE}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, slotMode: SlotMode.ONE }))
                  }
                  className="accent-[var(--accent)]"
                />
                1 participante
              </label>
              <label className="flex cursor-pointer items-center gap-[var(--space-2)] text-[var(--text-base)] text-[var(--ink)]">
                <input
                  type="radio"
                  name="slotMode"
                  value={SlotMode.TWO}
                  checked={form.slotMode === SlotMode.TWO}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, slotMode: SlotMode.TWO }))
                  }
                  className="accent-[var(--accent)]"
                />
                2 participantes (titular e ajudante)
              </label>
            </div>
          </fieldset>

          {error ? (
            <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="text-[var(--text-sm)] text-[var(--accent)]">{notice}</p>
          ) : null}

          <div className="flex flex-wrap gap-[var(--space-3)]">
            <button
              type="submit"
              disabled={pending || !form.label.trim()}
              className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-base)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
            >
              {pending
                ? "Salvando…"
                : editingId
                  ? "Salvar alterações"
                  : "Criar tipo"}
            </button>
            {editingId ? (
              <button
                type="button"
                disabled={pending}
                onClick={resetForm}
                className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
