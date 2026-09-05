const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { computeMeetingDate, Weekday } = require("../dist/index.js");

describe("computeMeetingDate", () => {
  it("weekStart 2026-09-07 + THURSDAY → 2026-09-10", () => {
    const weekStart = new Date(2026, 8, 7); // Monday
    const meeting = computeMeetingDate(weekStart, Weekday.THURSDAY);

    assert.equal(meeting.getFullYear(), 2026);
    assert.equal(meeting.getMonth(), 8);
    assert.equal(meeting.getDate(), 10);
  });

  it("returns the same day when weekday is Monday", () => {
    const weekStart = new Date(2026, 8, 7);
    const meeting = computeMeetingDate(weekStart, Weekday.MONDAY);

    assert.equal(meeting.getFullYear(), 2026);
    assert.equal(meeting.getMonth(), 8);
    assert.equal(meeting.getDate(), 7);
  });

  it("Sunday is six days after Monday week start", () => {
    const weekStart = new Date(2026, 8, 7);
    const meeting = computeMeetingDate(weekStart, Weekday.SUNDAY);

    assert.equal(meeting.getFullYear(), 2026);
    assert.equal(meeting.getMonth(), 8);
    assert.equal(meeting.getDate(), 13);
  });
});
