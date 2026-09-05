import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso à programação da reunião do meio de semana",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col justify-center px-[var(--page-pad)] py-[var(--space-8)]">
      {/* Soft program-sheet wash — cool stone, not cream */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 10% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%), linear-gradient(180deg, var(--surface) 0%, var(--paper) 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-[var(--space-6)]">
        <header className="login-stage border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
          <p className="font-[family-name:var(--font-brand)] text-[var(--text-display)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
            Assistente S-140
          </p>
          <p className="mt-[var(--space-2)] max-w-[18rem] text-[var(--text-sm)] leading-relaxed text-[var(--muted)]">
            Programação da reunião do meio de semana da congregação.
          </p>
        </header>

        <LoginForm />
      </div>
    </main>
  );
}
