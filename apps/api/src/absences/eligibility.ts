import { AbsenceStatus } from '@jw/shared';

/** Minimal absence shape for eligibility checks (no justification). */
export type AbsenceForEligibility = {
  startsOn: Date | string;
  endsOn: Date | string | null;
  status: AbsenceStatus | `${AbsenceStatus}`;
};

/** Normalize to YYYY-MM-DD for calendar comparisons. */
export function toDateOnly(value: Date | string): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

/**
 * Whether a participant is eligible for assignment on `meetingDate`
 * given their absence periods.
 *
 * Rules:
 * 1. Active open-ended absence → never eligible
 * 2. Dated absence covering meetingDate (inclusive) → not eligible
 * 3. Dated absence with meetingDate after endsOn → eligible (even without acknowledge)
 * 4. No blocking absence → eligible
 * 5. CANCELLED absences never block
 */
export function isEligibleGivenAbsences(
  absences: AbsenceForEligibility[],
  meetingDate: Date | string,
): boolean {
  const meeting = toDateOnly(meetingDate);

  for (const absence of absences) {
    if (absence.status === AbsenceStatus.CANCELLED) {
      continue;
    }

    const startsOn = toDateOnly(absence.startsOn);
    if (meeting < startsOn) {
      continue;
    }

    if (absence.endsOn == null) {
      if (absence.status === AbsenceStatus.ACTIVE) {
        return false;
      }
      continue;
    }

    const endsOn = toDateOnly(absence.endsOn);
    if (meeting <= endsOn) {
      return false;
    }
  }

  return true;
}
