"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

function IconHome({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 10.5 12 3.75l8.5 6.75V20a1.25 1.25 0 0 1-1.25 1.25H4.75A1.25 1.25 0 0 1 3.5 20V10.5Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 21.25V13.5h5v7.75"
      />
    </svg>
  );
}

function IconPeople({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 19v-1.2A3.3 3.3 0 0 0 12.7 14.5H7.3A3.3 3.3 0 0 0 4 17.8V19"
      />
      <circle cx="10" cy="8.5" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 19v-1.1a2.7 2.7 0 0 0-2-2.6"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 5.6a2.7 2.7 0 0 1 0 5.2"
      />
    </svg>
  );
}

function IconSchedule({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path strokeLinecap="round" d="M8 3.5V7M16 3.5V7M3.5 10h17" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 14h3M13 14h3M8 17.5h8" />
    </svg>
  );
}

function IconHistory({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.5V9h3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.5V12l2.5 1.5" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H10a1.7 1.7 0 0 0 1-1.5V5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V10c.1.7.6 1.2 1.5 1.2H19a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.3Z"
      />
    </svg>
  );
}

const ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Início",
    match: (p) => p === "/",
  },
  {
    href: "/participants",
    label: "Participantes",
    match: (p) => p.startsWith("/participants"),
  },
  {
    href: "/schedule",
    label: "Designações",
    match: (p) => p.startsWith("/schedule"),
  },
  {
    href: "/history",
    label: "Histórico",
    match: (p) => p.startsWith("/history"),
  },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md"
      style={{
        paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto flex w-full max-w-[var(--shell-max)] items-stretch justify-between gap-1 px-1 pt-1 sm:px-2">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const icon =
            item.href === "/" ? (
              <IconHome active={active} />
            ) : item.href === "/participants" ? (
              <IconPeople active={active} />
            ) : item.href === "/schedule" ? (
              <IconSchedule active={active} />
            ) : (
              <IconHistory active={active} />
            );

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
              className={`flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] px-1 py-1 text-[var(--text-xs)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:flex-row sm:gap-2 sm:px-2 ${
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {icon}
              <span className="hidden truncate text-[var(--text-sm)] sm:inline">
                {item.label}
              </span>
            </Link>
          );
        })}

        <Link
          href="/settings"
          aria-label="Configurações"
          title="Configurações"
          aria-current={pathname.startsWith("/settings") ? "page" : undefined}
          className={`flex min-h-[3.25rem] w-11 shrink-0 flex-col items-center justify-center rounded-[var(--radius-sm)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:w-12 ${
            pathname.startsWith("/settings")
              ? "text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <IconSettings />
        </Link>
      </div>
    </nav>
  );
}
