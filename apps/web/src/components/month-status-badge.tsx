import type { MonthSummary } from "@/lib/schedule";

type MonthStatusBadgeProps = {
  month: Pick<MonthSummary, "complete" | "openSlots" | "weekCount">;
};

export function MonthStatusBadge({ month }: MonthStatusBadgeProps) {
  const { complete, openSlots, weekCount } = month;

  let label: string;
  let className: string;

  if (complete) {
    label = "Completo";
    className =
      "border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))] text-[var(--accent)]";
  } else if (weekCount === 0 || openSlots === 0) {
    label = "Em aberto";
    className =
      "border-[var(--line)] bg-[color-mix(in_srgb,var(--muted)_8%,var(--surface))] text-[var(--muted)]";
  } else {
    label = `Pendente · ${openSlots} em aberto`;
    className =
      "border-[color-mix(in_srgb,#b8860b_35%,var(--line))] bg-[color-mix(in_srgb,#b8860b_10%,var(--surface))] text-[#8a6914]";
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-[var(--radius-sm)] border px-[var(--space-2)] py-[var(--space-1)] text-[var(--text-xs)] font-medium ${className}`}
    >
      {label}
    </span>
  );
}
