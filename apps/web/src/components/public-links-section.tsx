"use client";

import { useEffect, useState } from "react";
import type { CongregationSettings } from "@/lib/settings";
import { btnOutline, sectionCardClass } from "@/lib/ui";

type PublicLinkKey =
  | "publicLinkCurrentWeekEnabled"
  | "publicLinkNextWeekEnabled"
  | "publicLinkCurrentMonthEnabled"
  | "publicLinkNextMonthEnabled";

const PUBLIC_LINKS: {
  key: PublicLinkKey;
  label: string;
  path: string;
  description: string;
}[] = [
  {
    key: "publicLinkCurrentWeekEnabled",
    label: "Esta semana",
    path: "/esta-semana",
    description: "Designações da semana atual",
  },
  {
    key: "publicLinkNextWeekEnabled",
    label: "Próxima semana",
    path: "/proxima-semana",
    description: "Designações da semana seguinte",
  },
  {
    key: "publicLinkCurrentMonthEnabled",
    label: "Este mês",
    path: "/este-mes",
    description: "Programação do mês atual",
  },
  {
    key: "publicLinkNextMonthEnabled",
    label: "Próximo mês",
    path: "/proximo-mes",
    description: "Programação do mês seguinte",
  },
];

type Props = {
  settings: CongregationSettings;
  onUpdate: (patch: Partial<CongregationSettings>) => Promise<void>;
};

async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function PublicLinksSection({ settings, onUpdate }: Props) {
  const [origin, setOrigin] = useState("");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<PublicLinkKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!copiedPath) return;
    const timer = window.setTimeout(() => setCopiedPath(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedPath]);

  async function handleCopy(path: string) {
    const url = `${origin}${path}`;
    try {
      await copyToClipboard(url);
      setCopiedPath(path);
    } catch {
      setError("Não foi possível copiar o link.");
    }
  }

  async function handleToggle(key: PublicLinkKey, enabled: boolean) {
    setError(null);
    setPendingKey(key);
    try {
      await onUpdate({ [key]: enabled });
    } catch {
      setError("Não foi possível salvar.");
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <section
      aria-labelledby="public-links-heading"
      className="settings-stage flex w-full flex-col gap-[var(--space-5)] border-t border-[var(--line)] pt-[var(--space-6)]"
    >
      <header>
        <h2
          id="public-links-heading"
          className="font-heading text-[var(--text-lg)]"
        >
          Links públicos
        </h2>
        <p className="mt-[var(--space-2)] text-[var(--text-sm)] leading-relaxed text-[var(--muted)]">
          Compartilhe com a congregação. Cada link pode ser desativado
          individualmente.
        </p>
      </header>

      {error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <ul className="flex flex-col gap-[var(--space-4)]">
        {PUBLIC_LINKS.map((link) => {
          const enabled = settings[link.key];
          const url = `${origin}${link.path}`;
          const isPending = pendingKey === link.key;
          const isCopied = copiedPath === link.path;

          return (
            <li key={link.key} className={sectionCardClass}>
              <div className="flex flex-wrap items-start justify-between gap-[var(--space-2)]">
                <div>
                  <p className="font-heading text-[var(--text-base)]">
                    {link.label}
                  </p>
                  <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--muted)]">
                    {link.description}
                  </p>
                </div>
                {!enabled ? (
                  <span
                    className="rounded-[var(--radius-sm)] bg-[#f5ead6] px-[var(--space-2)] py-[var(--space-1)] text-[var(--text-xs)] font-medium text-[#7a5c1e]"
                  >
                    Desativado
                  </span>
                ) : null}
              </div>

              <div className="mt-[var(--space-3)] flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-stretch">
                <input
                  type="text"
                  readOnly
                  value={url}
                  aria-label={`URL de ${link.label}`}
                  className="field-input min-w-0 flex-1 py-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]"
                />
                <button
                  type="button"
                  onClick={() => void handleCopy(link.path)}
                  className={`${btnOutline} shrink-0 px-[var(--space-4)] py-[var(--space-2)]`}
                >
                  {isCopied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="mt-[var(--space-3)] flex items-center justify-between gap-[var(--space-3)]">
                <span className="text-[var(--text-sm)] text-[var(--ink)]">
                  Ativo
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={enabled}
                    disabled={isPending}
                    onChange={(e) =>
                      void handleToggle(link.key, e.target.checked)
                    }
                    className="peer sr-only"
                    aria-label={`${enabled ? "Desativar" : "Ativar"} link ${link.label}`}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none relative h-6 w-11 rounded-full bg-[var(--line)] transition-colors peer-checked:bg-[var(--accent)] peer-disabled:opacity-55 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)] after:pointer-events-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5"
                  />
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
