"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/auth";
import { fetchSettings, type CongregationSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<CongregationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) {
        router.replace("/login");
        return;
      }

      const data = await fetchSettings();
      if (cancelled) return;
      if (!data) {
        setLoadError("Não foi possível carregar as configurações.");
        setLoading(false);
        return;
      }

      setSettings(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-[50dvh] items-center justify-center px-[var(--page-pad)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-0 flex-col px-[var(--page-pad)] py-[var(--space-8)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 70% at 90% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 50%), linear-gradient(180deg, var(--surface) 0%, var(--paper) 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-[var(--space-6)]">
        <header className="settings-stage border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
          <p className="font-[family-name:var(--font-brand)] text-[var(--text-display)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
            Congregação
          </p>
          <p className="mt-[var(--space-2)] max-w-[20rem] text-[var(--text-sm)] leading-relaxed text-[var(--muted)]">
            Nome e dia da reunião usados na programação e no S-140.
          </p>
        </header>

        {loadError ? (
          <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
            {loadError}
          </p>
        ) : settings ? (
          <SettingsForm initial={settings} />
        ) : null}

        <Link
          href="/"
          className="text-[var(--text-sm)] text-[var(--muted)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
