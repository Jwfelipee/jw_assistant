import { AbsenceStatus } from '@jw/shared';
import {
  isEligibleGivenAbsences,
  type AbsenceForEligibility,
} from './eligibility';

describe('isEligibleGivenAbsences', () => {
  it('returns true when there are no absences', () => {
    expect(isEligibleGivenAbsences([], '2025-12-04')).toBe(true);
  });

  it('treats November dated absence as blocking Nov and eligible in Dec', () => {
    const novAbsence: AbsenceForEligibility = {
      startsOn: '2025-11-01',
      endsOn: '2025-11-30',
      status: AbsenceStatus.ACTIVE,
    };

    expect(isEligibleGivenAbsences([novAbsence], '2025-11-06')).toBe(false);
    expect(isEligibleGivenAbsences([novAbsence], '2025-11-30')).toBe(false);
    expect(isEligibleGivenAbsences([novAbsence], '2025-12-04')).toBe(true);
  });

  it('keeps Dec eligible after Nov absence even without acknowledge (ENDED)', () => {
    const novAbsence: AbsenceForEligibility = {
      startsOn: '2025-11-01',
      endsOn: '2025-11-30',
      status: AbsenceStatus.ENDED,
    };

    expect(isEligibleGivenAbsences([novAbsence], '2025-12-04')).toBe(true);
    expect(isEligibleGivenAbsences([novAbsence], '2025-11-13')).toBe(false);
  });

  it('blocks all dates while open-ended absence is ACTIVE', () => {
    const openEnded: AbsenceForEligibility = {
      startsOn: '2025-10-01',
      endsOn: null,
      status: AbsenceStatus.ACTIVE,
    };

    expect(isEligibleGivenAbsences([openEnded], '2025-10-01')).toBe(false);
    expect(isEligibleGivenAbsences([openEnded], '2025-12-04')).toBe(false);
    expect(isEligibleGivenAbsences([openEnded], '2026-06-15')).toBe(false);
  });

  it('allows assignment after open-ended absence is reactivated (ENDED + endsOn)', () => {
    const reactivated: AbsenceForEligibility = {
      startsOn: '2025-10-01',
      endsOn: '2025-11-15',
      status: AbsenceStatus.ENDED,
    };

    expect(isEligibleGivenAbsences([reactivated], '2025-11-15')).toBe(false);
    expect(isEligibleGivenAbsences([reactivated], '2025-11-16')).toBe(true);
  });

  it('ignores CANCELLED absences', () => {
    const cancelled: AbsenceForEligibility = {
      startsOn: '2025-11-01',
      endsOn: null,
      status: AbsenceStatus.CANCELLED,
    };

    expect(isEligibleGivenAbsences([cancelled], '2025-12-04')).toBe(true);
  });

  it('does not block dates before startsOn', () => {
    const future: AbsenceForEligibility = {
      startsOn: '2025-12-01',
      endsOn: '2025-12-31',
      status: AbsenceStatus.ACTIVE,
    };

    expect(isEligibleGivenAbsences([future], '2025-11-20')).toBe(true);
  });
});
