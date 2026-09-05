import { Weekday } from "../enums";

/** Offset from Monday (ISO week start) for each weekday. */
const WEEKDAY_OFFSET: Record<Weekday, number> = {
  [Weekday.MONDAY]: 0,
  [Weekday.TUESDAY]: 1,
  [Weekday.WEDNESDAY]: 2,
  [Weekday.THURSDAY]: 3,
  [Weekday.FRIDAY]: 4,
  [Weekday.SATURDAY]: 5,
  [Weekday.SUNDAY]: 6,
};

/**
 * Compute the meeting calendar date within a week.
 *
 * `weekStartDate` is the Monday that starts the ISO week.
 * `meetingDate` is that Monday plus the offset for the configured weekday.
 *
 * Example: weekStart 2026-09-07 (Monday) + THURSDAY → 2026-09-10.
 */
export function computeMeetingDate(
  weekStartDate: Date,
  weekday: Weekday,
): Date {
  const offset = WEEKDAY_OFFSET[weekday];
  return new Date(
    weekStartDate.getFullYear(),
    weekStartDate.getMonth(),
    weekStartDate.getDate() + offset,
  );
}
