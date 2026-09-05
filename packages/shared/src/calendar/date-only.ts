/**
 * Calendar date helpers that avoid local-timezone drift when persisting
 * `@db.Date` values (store/compare as UTC midnight).
 */

/** Format a Date as YYYY-MM-DD (UTC components). */
export function formatDateOnly(value: Date | string): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

/**
 * Build a UTC-midnight Date from local calendar Y/M/D components
 * (month is 1–12).
 */
export function utcDateFromParts(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

/** Convert a local-calendar Date (Y/M/D) to UTC midnight for DB storage. */
export function toUtcDateOnly(localCalendarDate: Date): Date {
  return utcDateFromParts(
    localCalendarDate.getFullYear(),
    localCalendarDate.getMonth() + 1,
    localCalendarDate.getDate(),
  );
}

/** Parse YYYY-MM-DD into a UTC-midnight Date. */
export function parseDateOnly(value: string): Date {
  const iso = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new Error(`Invalid date-only value: ${value}`);
  }
  const date = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date-only value: ${value}`);
  }
  return date;
}
