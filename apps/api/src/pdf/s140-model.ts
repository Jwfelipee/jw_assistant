import { AssignmentRole, PartTopic, parseDateOnly } from '@jw/shared';
import { isStudyPartType } from '../schedule/assign-rules';
import type {
  S140DocumentData,
  S140MonthInput,
  S140PartInput,
  S140PartLine,
  S140SlotInput,
  S140WeekView,
} from './s140.types';

export const EMPTY_SLOT_PLACEHOLDER = '____________';

export function formatSlotName(name: string | null | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : EMPTY_SLOT_PLACEHOLDER;
}

export function formatPairNames(
  primary: string | null | undefined,
  secondary: string | null | undefined,
): string {
  return `${formatSlotName(primary)}/${formatSlotName(secondary)}`;
}

export function formatAssignees(
  slots: S140SlotInput[],
  options?: { study?: boolean },
): string {
  if (options?.study) {
    return formatPairNames(
      findName(slots, AssignmentRole.DIRIGENTE),
      findName(slots, AssignmentRole.LEITOR),
    );
  }

  const hasAjudante = slots.some((s) => s.role === AssignmentRole.AJUDANTE);
  if (hasAjudante) {
    return formatPairNames(
      findName(slots, AssignmentRole.TITULAR),
      findName(slots, AssignmentRole.AJUDANTE),
    );
  }

  return formatSlotName(findName(slots, AssignmentRole.TITULAR));
}

function findName(
  slots: S140SlotInput[],
  role: AssignmentRole,
): string | null {
  return slots.find((s) => s.role === role)?.participantName ?? null;
}

export function formatMeetingDateLabel(isoDate: string): string {
  const date = parseDateOnly(isoDate);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function toPartLine(part: S140PartInput, study: boolean): S140PartLine {
  return {
    title: part.title?.trim() || part.partTypeLabel,
    assignee: formatAssignees(part.slots, { study }),
    studyPair: study,
  };
}

function pickTitularName(parts: S140PartInput[], code: string): string {
  const part = parts.find((p) => p.partTypeCode === code);
  if (!part) {
    return EMPTY_SLOT_PLACEHOLDER;
  }
  return formatAssignees(part.slots);
}

export function buildS140DocumentData(
  month: S140MonthInput,
  congregationName: string,
): S140DocumentData {
  const weeks: S140WeekView[] = [...month.weeks]
    .sort((a, b) => {
      const byMeeting = a.meetingDate.localeCompare(b.meetingDate);
      if (byMeeting !== 0) return byMeeting;
      return a.weekStartDate.localeCompare(b.weekStartDate);
    })
    .map((week) => {
      const parts = [...week.parts].sort((a, b) => a.sortOrder - b.sortOrder);
      const studyPart = parts.find((p) => isStudyPartType(p.partTypeCode));
      const treasures = parts
        .filter((p) => p.topic === PartTopic.TREASURES)
        .map((p) => toPartLine(p, false));
      const ministry = parts
        .filter((p) => p.topic === PartTopic.MINISTRY)
        .map((p) => toPartLine(p, false));
      const christianLife = parts
        .filter(
          (p) =>
            p.topic === PartTopic.CHRISTIAN_LIFE &&
            !isStudyPartType(p.partTypeCode),
        )
        .map((p) => toPartLine(p, false));

      return {
        meetingDateLabel: formatMeetingDateLabel(week.meetingDate),
        president: pickTitularName(parts, 'PRESIDENTE'),
        openingPrayer: pickTitularName(parts, 'ORACAO_INICIAL'),
        closingPrayer: pickTitularName(parts, 'ORACAO_FINAL'),
        treasures,
        ministry,
        christianLife,
        study: studyPart ? toPartLine(studyPart, true) : null,
      };
    });

  return {
    congregationName: congregationName.trim() || 'Congregação',
    yearMonth: month.yearMonth,
    weeks,
  };
}

export function s140Filename(yearMonth: string): string {
  return `S-140-${yearMonth}.pdf`;
}
