"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ParticipantForm } from "@/components/participant-form";
import {
  getParticipant,
  updateParticipant,
  type ParticipantDetail,
} from "@/lib/participants";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditParticipantPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [participant, setParticipant] = useState<ParticipantDetail | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await getParticipant(id);
        if (!cancelled) setParticipant(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o participante.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-0 w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-4)] px-[var(--page-pad)] py-[var(--space-8)]">
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
        <Link href="/participants" className="text-[var(--text-sm)] text-[var(--accent)]">
          Voltar à lista
        </Link>
      </main>
    );
  }

  if (!participant) {
    return (
      <main className="flex min-h-[50dvh] items-center justify-center px-[var(--page-pad)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-6)] px-[var(--page-pad)] py-[var(--space-8)]">
      <header className="page-rise border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">
          <Link
            href={`/participants/${participant.id}`}
            className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {participant.name}
          </Link>
        </p>
        <h1 className="mt-[var(--space-1)] font-[family-name:var(--font-brand)] text-[var(--text-xl)] font-semibold text-[var(--ink)]">
          Editar participante
        </h1>
      </header>

      <div className="page-rise-delay">
        <ParticipantForm
          initial={{
            name: participant.name,
            phone: participant.phone ?? "",
            sex: participant.sex,
            privilege: participant.privilege,
            rolePreference: participant.rolePreference,
          }}
          submitLabel="Salvar alterações"
          pendingLabel="Salvando…"
          onSubmit={async (input) => {
            await updateParticipant(participant.id, input);
            router.replace(`/participants/${participant.id}`);
            router.refresh();
          }}
        />
      </div>
    </main>
  );
}
