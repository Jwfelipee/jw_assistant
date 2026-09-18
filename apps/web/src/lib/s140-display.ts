import { AssignmentRole, PartTopic, parseDateOnly } from "@jw/shared";
import {
  formatPublicParticipantName,
  type PublicPartView,
  type PublicSlotView,
  type PublicWeekView,
} from "@/lib/public-schedule";

export const DURATION_BY_CODE: Record<string, string> = {
  TESOUROS: "10 min",
  JOIAS: "10 min",
  LEITURA_BIBLIA: "4 min",
  ESTUDO_BIBLICO: "30 min",
};

const LABEL_TO_CODE: Record<string, string> = {
  Presidente: "PRESIDENTE",
  "Oração inicial": "ORACAO_INICIAL",
  "Oração final": "ORACAO_FINAL",
  "Tesouros da Palavra de Deus": "TESOUROS",
  "Joias espirituais": "JOIAS",
  "Leitura da Bíblia": "LEITURA_BIBLIA",
  "Estudo bíblico de congregação": "ESTUDO_BIBLICO",
};

const FIXED_PART_LABELS: Record<string, string> = {
  JOIAS: "Joias espirituais",
  LEITURA_BIBLIA: "Leitura da Bíblia",
  ESTUDO_BIBLICO: "Estudo bíblico de congregação",
};

const OPENING_SONG = "Cântico [número]";
const CLOSING_SONG = "Cântico [número]";
const NVC_SONG = "Cântico [número]";

export type S140PartLine = {
  number: number | null;
  title: string;
  assignee: string;
  showDirectorLabel?: boolean;
};

export type S140PublicWeek = {
  meetingDateShort: string;
  president: string;
  openingPrayer: string;
  closingPrayer: string;
  openingSong: string;
  closingSong: string;
  openingComments: string;
  closingComments: string;
  treasures: S140PartLine[];
  ministry: S140PartLine[];
  christianLife: S140PartLine[];
  study: S140PartLine | null;
  nvcSong: string;
};

function partTypeCode(part: PublicPartView): string | null {
  return LABEL_TO_CODE[part.partTypeLabel] ?? null;
}

function isStudyPart(part: PublicPartView): boolean {
  return partTypeCode(part) === "ESTUDO_BIBLICO";
}

export function formatMeetingDateShort(isoDate: string): string {
  const date = parseDateOnly(isoDate);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function formatPublicAssignees(
  slots: PublicSlotView[],
  options?: { study?: boolean },
): string {
  const findName = (role: AssignmentRole) =>
    slots.find((slot) => slot.role === role)?.participantName ?? null;

  if (options?.study) {
    return `${formatPublicParticipantName(findName(AssignmentRole.DIRIGENTE))}/${formatPublicParticipantName(findName(AssignmentRole.LEITOR))}`;
  }

  const hasAjudante = slots.some((slot) => slot.role === AssignmentRole.AJUDANTE);
  if (hasAjudante) {
    return `${formatPublicParticipantName(findName(AssignmentRole.TITULAR))}/${formatPublicParticipantName(findName(AssignmentRole.AJUDANTE))}`;
  }

  return formatPublicParticipantName(findName(AssignmentRole.TITULAR));
}

function partDuration(part: PublicPartView): string | null {
  const code = partTypeCode(part);
  if (code && DURATION_BY_CODE[code]) {
    return DURATION_BY_CODE[code];
  }
  if (part.topic === PartTopic.MINISTRY) {
    return "X min";
  }
  if (part.topic === PartTopic.CHRISTIAN_LIFE && !isStudyPart(part)) {
    return "XX min";
  }
  return null;
}

function partThemeText(part: PublicPartView): string {
  const code = partTypeCode(part);
  if (code && FIXED_PART_LABELS[code]) {
    return FIXED_PART_LABELS[code];
  }
  return part.title?.trim() || part.partTypeLabel;
}

function formatPartTitle(
  number: number | null,
  theme: string,
  duration: string | null,
): string {
  const prefix = number !== null ? `${number}. ` : "";
  const durationSuffix = duration ? ` (${duration})` : "";
  return `${prefix}${theme}${durationSuffix}`;
}

function toPartLine(
  part: PublicPartView,
  options: { number: number | null; study?: boolean },
): S140PartLine {
  const study = options.study ?? false;
  const duration = partDuration(part);
  const theme = partThemeText(part);

  return {
    number: options.number,
    title: formatPartTitle(options.number, theme, duration),
    assignee: formatPublicAssignees(part.slots, { study }),
    showDirectorLabel: study,
  };
}

function assignSequentialNumbers(
  parts: PublicPartView[],
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

function pickTitularName(parts: PublicPartView[], label: string): string {
  const part = parts.find((item) => item.partTypeLabel === label);
  if (!part) {
    return "—";
  }
  return formatPublicAssignees(part.slots);
}

export function buildPublicS140Week(week: PublicWeekView): S140PublicWeek {
  const parts = [...week.parts];
  const studyPart = parts.find(isStudyPart);
  const treasureParts = parts.filter((part) => part.topic === PartTopic.TREASURES);
  const ministryParts = parts.filter((part) => part.topic === PartTopic.MINISTRY);
  const christianLifeParts = parts.filter(
    (part) => part.topic === PartTopic.CHRISTIAN_LIFE && !isStudyPart(part),
  );

  const { lines: treasures, nextNumber: afterTreasures } =
    assignSequentialNumbers(treasureParts, 1);
  const { lines: ministry, nextNumber: afterMinistry } = assignSequentialNumbers(
    ministryParts,
    afterTreasures,
  );
  const { lines: christianLife } = assignSequentialNumbers(
    christianLifeParts,
    afterMinistry,
  );

  const study = studyPart
    ? toPartLine(studyPart, { number: 10, study: true })
    : null;

  return {
    meetingDateShort: formatMeetingDateShort(week.meetingDate),
    president: pickTitularName(parts, "Presidente"),
    openingPrayer: pickTitularName(parts, "Oração inicial"),
    closingPrayer: pickTitularName(parts, "Oração final"),
    openingSong: OPENING_SONG,
    closingSong: CLOSING_SONG,
    openingComments: "—",
    closingComments: "—",
    treasures,
    ministry,
    christianLife,
    study,
    nvcSong: NVC_SONG,
  };
}
