import { formatDateOnly, toUtcDateOnly } from "./date-only";

export type IsoWeekBounds = {
  /** Monday 00:00:00 local */
  start: Date;
  /** Sunday 00:00:00 local — last civil day of the ISO week for date-only comparison */
  end: Date;
};

function toLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** ISO week (Mon–Sun) containing `date` in local calendar. */
export function isoWeekBoundsForDate(date: Date): IsoWeekBounds {
  const local = toLocalMidnight(date);
  const dayOfWeek = local.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const start = addDays(local, -daysFromMonday);
  const end = addDays(start, 6);
  return { start, end };
}

/** Add `weeks` ISO weeks to bounds (typically weeks=1 for next week). */
export function addIsoWeeks(bounds: IsoWeekBounds, weeks: number): IsoWeekBounds {
  return {
    start: addDays(bounds.start, weeks * 7),
    end: addDays(bounds.end, weeks * 7),
  };
}

/** True if `target` (date-only) is within [start, end] inclusive. */
export function dateInIsoWeek(target: Date, bounds: IsoWeekBounds): boolean {
  const targetStr = formatDateOnly(target);
  const startStr = formatDateOnly(toUtcDateOnly(bounds.start));
  const endStr = formatDateOnly(toUtcDateOnly(bounds.end));
  return targetStr >= startStr && targetStr <= endStr;
}
