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

export const DURATION_BY_CODE: Record<string, string> = {
  TESOUROS: '10 min',
  JOIAS: '10 min',
  LEITURA_BIBLIA: '4 min',
  ESTUDO_BIBLICO: '30 min',
};

const FIXED_PART_LABELS: Record<string, string> = {
  JOIAS: 'Joias espirituais',
  LEITURA_BIBLIA: 'Leitura da Bíblia',
  ESTUDO_BIBLICO: 'Estudo bíblico de congregação',
};

const OPENING_SONG = 'Cântico [número]';
const CLOSING_SONG = 'Cântico [número]';
const NVC_SONG = 'Cântico [número]';

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

export function formatMeetingDateShort(isoDate: string): string {
  const date = parseDateOnly(isoDate);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function partDuration(part: S140PartInput): string | null {
  if (DURATION_BY_CODE[part.partTypeCode]) {
    return DURATION_BY_CODE[part.partTypeCode];
  }
  if (part.topic === PartTopic.MINISTRY) {
    return 'X min';
  }
  if (
    part.topic === PartTopic.CHRISTIAN_LIFE &&
    !isStudyPartType(part.partTypeCode)
  ) {
    return 'XX min';
  }
  return null;
}

function partThemeText(part: S140PartInput): string {
  const fixed = FIXED_PART_LABELS[part.partTypeCode];
  if (fixed) {
    return fixed;
  }
  return part.title?.trim() || part.partTypeLabel;
}

function formatPartTitle(
  number: number | null,
  theme: string,
  duration: string | null,
): string {
  const prefix = number !== null ? `${number}. ` : '';
  const durationSuffix = duration ? ` (${duration})` : '';
  return `${prefix}${theme}${durationSuffix}`;
}

function toPartLine(
  part: S140PartInput,
  options: { number: number | null; study?: boolean },
): S140PartLine {
  const study = options.study ?? false;
  const duration = partDuration(part);
  const theme = partThemeText(part);

  return {
    number: options.number,
    title: formatPartTitle(options.number, theme, duration),
    duration,
    assignee: formatAssignees(part.slots, { study }),
    studyPair: study,
    showDirectorLabel: study,
  };
}

function assignSequentialNumbers(
  parts: S140PartInput[],
  startNumber: number,
  study = false,
): { lines: S140PartLine[]; nextNumber: number } {
  let num = startNumber;
  const lines = parts.map((part) => {
    const line = toPartLine(part, { number: num, study });
    num += 1;
    return line;
  });
  return { lines, nextNumber: num };
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
      const treasureParts = parts.filter((p) => p.topic === PartTopic.TREASURES);
      const ministryParts = parts.filter((p) => p.topic === PartTopic.MINISTRY);
      const christianLifeParts = parts.filter(
        (p) =>
          p.topic === PartTopic.CHRISTIAN_LIFE &&
          !isStudyPartType(p.partTypeCode),
      );

      const { lines: treasures, nextNumber: afterTreasures } =
        assignSequentialNumbers(treasureParts, 1);
      const { lines: ministry, nextNumber: afterMinistry } =
        assignSequentialNumbers(ministryParts, afterTreasures);
      const { lines: christianLife } = assignSequentialNumbers(
        christianLifeParts,
        afterMinistry,
      );

      const study = studyPart
        ? toPartLine(studyPart, { number: 10, study: true })
        : null;

      return {
        meetingDateShort: formatMeetingDateShort(week.meetingDate),
        president: pickTitularName(parts, 'PRESIDENTE'),
        openingPrayer: pickTitularName(parts, 'ORACAO_INICIAL'),
        closingPrayer: pickTitularName(parts, 'ORACAO_FINAL'),
        openingSong: OPENING_SONG,
        closingSong: CLOSING_SONG,
        openingComments: EMPTY_SLOT_PLACEHOLDER,
        closingComments: EMPTY_SLOT_PLACEHOLDER,
        treasures,
        ministry,
        christianLife,
        study,
        nvcSong: NVC_SONG,
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
