/** Minimal schedule shapes consumed by the S-140 PDF builder. */
export type S140SlotInput = {
  role: string;
  participantName: string | null;
};

export type S140PartInput = {
  partTypeCode: string;
  partTypeLabel: string;
  title: string;
  sortOrder: number;
  /** PartTopic value (shared or Prisma enum). */
  topic: string;
  slots: S140SlotInput[];
};

export type S140WeekInput = {
  meetingDate: string;
  weekStartDate: string;
  parts: S140PartInput[];
};

export type S140MonthInput = {
  yearMonth: string;
  weeks: S140WeekInput[];
};

export type S140PartLine = {
  title: string;
  assignee: string;
  studyPair: boolean;
};

export type S140WeekView = {
  meetingDateLabel: string;
  president: string;
  openingPrayer: string;
  closingPrayer: string;
  treasures: S140PartLine[];
  ministry: S140PartLine[];
  christianLife: S140PartLine[];
  study: S140PartLine | null;
};

export type S140DocumentData = {
  congregationName: string;
  yearMonth: string;
  weeks: S140WeekView[];
};
