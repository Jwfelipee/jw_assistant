const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  isoWeekBoundsForDate,
  addIsoWeeks,
  dateInIsoWeek,
  parseDateOnly,
  formatDateOnly,
  toUtcDateOnly,
} = require("../dist/index.js");

function localDate(year, month, day) {
  return new Date(year, month - 1, day);
}

function assertLocalDate(date, year, month, day) {
  assert.equal(date.getFullYear(), year);
  assert.equal(date.getMonth(), month - 1);
  assert.equal(date.getDate(), day);
}

describe("iso week helpers", () => {
  it("returns Mon–Sun bounds for a Friday in mid-September 2026", () => {
    const bounds = isoWeekBoundsForDate(localDate(2026, 9, 18));

    assertLocalDate(bounds.start, 2026, 9, 14);
    assertLocalDate(bounds.end, 2026, 9, 20);
  });

  it("places Sunday in the same ISO week as the preceding Friday", () => {
    const friday = isoWeekBoundsForDate(localDate(2026, 9, 18));
    const sunday = isoWeekBoundsForDate(localDate(2026, 9, 20));

    assert.equal(
      formatDateOnly(toUtcDateOnly(friday.start)),
      formatDateOnly(toUtcDateOnly(sunday.start)),
    );
    assert.equal(
      formatDateOnly(toUtcDateOnly(friday.end)),
      formatDateOnly(toUtcDateOnly(sunday.end)),
    );
  });

  it("resolves year rollover for 2026-01-01 (Thursday)", () => {
    const bounds = isoWeekBoundsForDate(localDate(2026, 1, 1));

    assertLocalDate(bounds.start, 2025, 12, 29);
    assertLocalDate(bounds.end, 2026, 1, 4);
    assert.equal(dateInIsoWeek(parseDateOnly("2026-01-01"), bounds), true);
  });

  it("adds one ISO week by shifting bounds forward seven days", () => {
    const current = isoWeekBoundsForDate(localDate(2026, 9, 18));
    const next = addIsoWeeks(current, 1);

    assertLocalDate(next.start, 2026, 9, 21);
    assertLocalDate(next.end, 2026, 9, 27);
  });

  it("keeps meeting date in current week after meeting day (Thu meeting, Fri today)", () => {
    const today = localDate(2026, 9, 18);
    const meetingDate = parseDateOnly("2026-09-17");
    const bounds = isoWeekBoundsForDate(today);

    assert.equal(dateInIsoWeek(meetingDate, bounds), true);
  });
});
