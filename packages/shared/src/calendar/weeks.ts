import { Weekday } from "../enums";
import { computeMeetingDate } from "./meeting-date";
import { formatDateOnly, toUtcDateOnly, utcDateFromParts } from "./date-only";

export type YearMonth = {
  year: number;
  /** 1–12 */
  month: number;
};

/** Bimester index 1..6 (Jan–Fev=1 … Nov–Dez=6). */
export function bimesterIndexForMonth(month: number): number {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }
  return Math.ceil(month / 2);
}

/** Parse `YYYY-MM` into year/month parts. */
export function parseYearMonth(yearMonth: string): YearMonth {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth.trim());
  if (!match) {
    throw new Error(`Invalid yearMonth: ${yearMonth}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid yearMonth: ${yearMonth}`);
  }
  return { year, month };
}

/** Format year + month as `YYYY-MM`. */
export function formatYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Add `delta` months to a YearMonth. */
export function addMonths(ym: YearMonth, delta: number): YearMonth {
  const idx = ym.year * 12 + (ym.month - 1) + delta;
  const year = Math.floor(idx / 12);
  const month = (idx % 12) + 1;
  return { year, month };
}

/**
 * Mondays (ISO week starts) whose civil date falls inside `year`/`month`.
 * Returns local-calendar Dates (midnight local); convert with `toUtcDateOnly`
 * before persisting.
 */
export function listMondayWeekStartsInMonth(
  year: number,
  month: number,
): Date[] {
  const results: Date[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    // getDay(): 0=Sun … 1=Mon
    if (d.getDay() === 1) {
      results.push(d);
    }
  }

  return results;
}

/**
 * Whether a week belongs to a civil month by its Monday start date
 * (not by meetingDate).
 */
export function weekBelongsToMonth(
  weekStartDate: Date,
  year: number,
  month: number,
): boolean {
  return (
    weekStartDate.getFullYear() === year &&
    weekStartDate.getMonth() + 1 === month
  );
}

export type WeekCalendarRow = {
  weekStartDate: Date;
  meetingDate: Date;
  /** UTC midnight versions suitable for Prisma `@db.Date`. */
  weekStartDateUtc: Date;
  meetingDateUtc: Date;
};

/** Build week rows for a month given the congregation meeting weekday. */
export function buildWeeksForMonth(
  year: number,
  month: number,
  meetingWeekday: Weekday,
): WeekCalendarRow[] {
  return listMondayWeekStartsInMonth(year, month).map((weekStartDate) => {
    const meetingDate = computeMeetingDate(weekStartDate, meetingWeekday);
    return {
      weekStartDate,
      meetingDate,
      weekStartDateUtc: toUtcDateOnly(weekStartDate),
      meetingDateUtc: toUtcDateOnly(meetingDate),
    };
  });
}

/** Current civil year-month from a reference instant (local calendar). */
export function currentYearMonth(now: Date = new Date()): YearMonth {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export {
  formatDateOnly,
  toUtcDateOnly,
  utcDateFromParts,
  computeMeetingDate,
};
