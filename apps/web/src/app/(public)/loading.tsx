import { pageMainClass } from "@/lib/ui";

export default function PublicLoading() {
  return (
    <main className={`${pageMainClass} page-main--center`}>
      <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
    </main>
  );
}
