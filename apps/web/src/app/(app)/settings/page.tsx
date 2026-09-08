"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/auth";
import { fetchSettings, type CongregationSettings } from "@/lib/settings";
import { pageMainNarrowClass } from "@/lib/ui";
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
      <main className={`${pageMainNarrowClass} items-center`}>
        <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
      </main>
    );
  }

  return (
    <main className={pageMainNarrowClass}>
      <header className="settings-stage border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <p className="font-heading text-[var(--text-display)] leading-tight tracking-tight">
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
        className="text-center text-[var(--text-sm)] text-[var(--muted)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
