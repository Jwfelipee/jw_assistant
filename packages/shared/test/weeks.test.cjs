const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  Weekday,
  computeMeetingDate,
  listMondayWeekStartsInMonth,
  weekBelongsToMonth,
  buildWeeksForMonth,
  parseYearMonth,
  formatYearMonth,
  bimesterIndexForMonth,
  addMonths,
} = require("../dist/index.js");

describe("week calendar generators", () => {
  it("lists Mondays that fall inside September 2026 including 2026-09-28", () => {
    const mondays = listMondayWeekStartsInMonth(2026, 9);
    const days = mondays.map((d) => d.getDate());
    assert.deepEqual(days, [7, 14, 21, 28]);
  });

  it("weekStart 2026-09-28 + THURSDAY → month Sep, meetingDate 2026-10-01", () => {
    const weekStart = new Date(2026, 8, 28);
    assert.equal(weekBelongsToMonth(weekStart, 2026, 9), true);
    assert.equal(weekBelongsToMonth(weekStart, 2026, 10), false);

    const meeting = computeMeetingDate(weekStart, Weekday.THURSDAY);
    assert.equal(meeting.getFullYear(), 2026);
    assert.equal(meeting.getMonth(), 9); // October
    assert.equal(meeting.getDate(), 1);
  });

  it("buildWeeksForMonth includes Sep 28 → Oct 1 meeting under September", () => {
    const weeks = buildWeeksForMonth(2026, 9, Weekday.THURSDAY);
    const last = weeks[weeks.length - 1];
    assert.equal(last.weekStartDate.getDate(), 28);
    assert.equal(last.meetingDate.getMonth(), 9);
    assert.equal(last.meetingDate.getDate(), 1);
    assert.equal(last.weekStartDateUtc.toISOString().slice(0, 10), "2026-09-28");
    assert.equal(last.meetingDateUtc.toISOString().slice(0, 10), "2026-10-01");
  });

  it("parses and formats yearMonth", () => {
    assert.deepEqual(parseYearMonth("2026-09"), { year: 2026, month: 9 });
    assert.equal(formatYearMonth(2026, 9), "2026-09");
    assert.throws(() => parseYearMonth("2026-13"));
  });

  it("computes bimester index and addMonths", () => {
    assert.equal(bimesterIndexForMonth(9), 5);
    assert.equal(bimesterIndexForMonth(1), 1);
    assert.equal(bimesterIndexForMonth(12), 6);
    assert.deepEqual(addMonths({ year: 2026, month: 12 }, 1), {
      year: 2027,
      month: 1,
    });
  });
});
