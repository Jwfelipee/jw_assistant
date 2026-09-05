import type { Metadata } from "next";
import { CatalogClient } from "./catalog-client";

export const metadata: Metadata = {
  title: "Catálogo FSM",
  description:
    "Gerenciar tipos de parte de Faça Seu Melhor no Ministério",
};

export default function CatalogoPage() {
  return (
    <main className="relative min-h-0 px-[var(--page-pad)] py-[var(--space-8)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 60% at 90% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 50%), linear-gradient(180deg, var(--surface) 0%, var(--paper) 100%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[var(--shell-max)]">
        <CatalogClient />
      </div>
    </main>
  );
}
