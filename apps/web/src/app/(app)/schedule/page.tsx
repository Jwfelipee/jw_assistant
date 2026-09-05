"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchNextMonth } from "@/lib/schedule";

/** Entrada da aba Designações — redireciona ao próximo mês a programar. */
export default function ScheduleIndexPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchNextMonth();
        if (cancelled) return;
        router.replace(next.href);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível abrir as designações.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-[50dvh] items-center justify-center px-[var(--page-pad)] py-[var(--space-8)]">
      {error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
      ) : (
        <p className="text-[var(--text-sm)] text-[var(--muted)]">
          Abrindo designações…
        </p>
      )}
    </main>
  );
}
