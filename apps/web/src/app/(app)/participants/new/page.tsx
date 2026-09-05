"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ParticipantForm } from "@/components/participant-form";
import { createParticipant } from "@/lib/participants";

export default function NewParticipantPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-6)] px-[var(--page-pad)] py-[var(--space-8)]">
      <header className="page-rise border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">
          <Link
            href="/participants"
            className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Participantes
          </Link>
        </p>
        <h1 className="mt-[var(--space-1)] font-[family-name:var(--font-brand)] text-[var(--text-xl)] font-semibold text-[var(--ink)]">
          Novo participante
        </h1>
        <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
          Sem acesso à plataforma — só cadastro para designações.
        </p>
      </header>

      <div className="page-rise-delay">
        <ParticipantForm
          submitLabel="Salvar participante"
          pendingLabel="Salvando…"
          onSubmit={async (input) => {
            const created = await createParticipant(input);
            router.replace(`/participants/${created.id}`);
            router.refresh();
          }}
        />
      </div>
    </main>
  );
}
