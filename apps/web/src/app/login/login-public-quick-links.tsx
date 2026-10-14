import Link from "next/link";
import { PUBLIC_SCHEDULE_LINKS } from "@/lib/public-schedule-links";
import { btnSecondary } from "@/lib/ui";

export function LoginPublicQuickLinks() {
  return (
    <nav
      aria-labelledby="login-public-links-heading"
      className="login-stage-delay flex w-full max-w-[var(--content-max)] flex-col gap-[var(--space-4)] border-t border-[var(--line)] pt-[var(--space-6)]"
    >
      <header>
        <h2
          id="login-public-links-heading"
          className="font-heading text-[var(--text-base)]"
        >
          Ver programação
        </h2>
        <p className="mt-[var(--space-1)] text-[var(--text-sm)] leading-relaxed text-[var(--muted)]">
          Acesso rápido às páginas públicas, sem entrar na conta.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-[var(--space-2)] sm:grid-cols-2">
        {PUBLIC_SCHEDULE_LINKS.map((link) => (
          <li key={link.path}>
            <Link
              href={link.path}
              className={`${btnSecondary} flex w-full flex-col items-start gap-[var(--space-1)] px-[var(--space-3)] py-[var(--space-3)] text-left`}
            >
              <span className="font-heading text-[var(--text-sm)]">
                {link.label}
              </span>
              <span className="text-[var(--text-xs)] font-normal leading-snug text-[var(--muted)]">
                {link.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
