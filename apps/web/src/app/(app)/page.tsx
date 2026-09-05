"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  listAbsenceAlerts,
  reactivateAbsence,
  type AbsenceAlertView,
} from "@/lib/absences";
import { fetchMe, logoutRequest, type PublicUser } from "@/lib/auth";
import {
  fetchNextMonth,
  formatYearMonthLabel,
  type NextMonthInfo,
} from "@/lib/schedule";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AbsenceAlertView[]>([]);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [alertActionId, setAlertActionId] = useState<string | null>(null);
  const [nextMonth, setNextMonth] = useState<NextMonthInfo | null>(null);
  const [nextMonthError, setNextMonthError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    const rows = await listAbsenceAlerts();
    setAlerts(rows);
  }, []);

  const loadNextMonth = useCallback(async () => {
    const info = await fetchNextMonth();
    setNextMonth(info);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      setUser(me);
      setLoading(false);
      if (!me) {
        router.replace("/login");
        return;
      }
      try {
        await loadAlerts();
      } catch (err) {
        if (!cancelled) {
          setAlertsError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar alertas de ausência.",
          );
        }
      }
      try {
        await loadNextMonth();
      } catch (err) {
        if (!cancelled) {
          setNextMonthError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o próximo mês.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, loadAlerts, loadNextMonth]);

  async function onLogout() {
    await logoutRequest();
    router.replace("/login");
    router.refresh();
  }

  async function onReactivate(alert: AbsenceAlertView) {
    setAlertActionId(alert.id);
    setAlertsError(null);
    try {
      await reactivateAbsence(alert.id);
      await loadAlerts();
    } catch (err) {
      setAlertsError(
        err instanceof Error ? err.message : "Não foi possível reativar.",
      );
    } finally {
      setAlertActionId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[50dvh] items-center justify-center px-[var(--page-pad)]">
        <p className="text-[var(--text-sm)] text-[var(--muted)]">Carregando…</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-[var(--shell-max)] flex-col gap-[var(--space-6)] px-[var(--page-pad)] py-[var(--space-8)]">
      <header className="flex items-start justify-between gap-[var(--space-4)] border-l-[3px] border-[var(--accent)] pl-[var(--space-4)]">
        <div>
          <h1 className="font-[family-name:var(--font-brand)] text-[var(--text-xl)] font-semibold text-[var(--ink)]">
            Assistente S-140
          </h1>
          <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
            Sessão ativa: {user.email}
          </p>
        </div>
        <Link
          href="/settings"
          aria-label="Configurações"
          title="Configurações"
          className="shrink-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Configurações
        </Link>
      </header>

      <p className="text-[var(--text-base)] leading-relaxed text-[var(--ink)]">
        Programe a reunião do meio de semana, acompanhe ausências e consulte o
        histórico de designações.
      </p>

      <section
        aria-labelledby="next-month-heading"
        className="border-t border-[var(--line)] pt-[var(--space-5)]"
      >
        <h2
          id="next-month-heading"
          className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
        >
          Próximo mês a programar
        </h2>
        {nextMonthError && !nextMonth ? (
          <p
            role="alert"
            className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--danger)]"
          >
            {nextMonthError}
          </p>
        ) : nextMonth ? (
          <>
            <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
              {formatYearMonthLabel(nextMonth.yearMonth)}
              {nextMonth.openSlots != null
                ? ` · ${nextMonth.openSlots} designação${nextMonth.openSlots === 1 ? "" : "ões"} em aberto`
                : nextMonth.exists
                  ? ""
                  : " · ainda não gerado"}
            </p>
            <Link
              href={nextMonth.href}
              className="mt-[var(--space-4)] inline-flex rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Programar próximo mês
            </Link>
          </>
        ) : (
          <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--muted)]">
            Carregando…
          </p>
        )}
      </section>

      <section
        aria-labelledby="absence-alerts-heading"
        className="border-t border-[var(--line)] pt-[var(--space-5)]"
      >
        <h2
          id="absence-alerts-heading"
          className="font-[family-name:var(--font-brand)] text-[var(--text-lg)] font-semibold text-[var(--ink)]"
        >
          Ausências encerradas
        </h2>
        <p className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--muted)]">
          Períodos com data de fim já passada que ainda precisam de ação.
        </p>

        {alertsError ? (
          <p
            role="alert"
            className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--danger)]"
          >
            {alertsError}
          </p>
        ) : null}

        {alerts.length === 0 ? (
          <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--muted)]">
            Nenhum alerta no momento.
          </p>
        ) : (
          <ul className="mt-[var(--space-3)] flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex flex-col gap-[var(--space-3)] py-[var(--space-3)]"
              >
                <div>
                  <Link
                    href={`/participants/${alert.participantId}`}
                    className="font-medium text-[var(--ink)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    {alert.participantName}
                  </Link>
                  <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--muted)]">
                    Ausência até {alert.endsOn} — já pode voltar às listas
                    futuras.
                  </p>
                </div>
                <div className="flex flex-wrap gap-[var(--space-3)]">
                  <button
                    type="button"
                    disabled={alertActionId === alert.id}
                    onClick={() => void onReactivate(alert)}
                    className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
                  >
                    {alertActionId === alert.id ? "Reativando…" : "Reativar"}
                  </button>
                  <Link
                    href={`/participants/${alert.participantId}?newAbsence=1`}
                    className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    Novo período
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav className="flex flex-col gap-[var(--space-3)]" aria-label="Atalhos">
        <Link
          href="/catalogo"
          className="self-start rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Catálogo Faça Seu Melhor
        </Link>
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="self-start rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        Sair
      </button>
    </main>
  );
}
