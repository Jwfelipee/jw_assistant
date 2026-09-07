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
  number: number | null;
  title: string;
  duration: string | null;
  assignee: string;
  studyPair?: boolean;
  showDirectorLabel?: boolean;
};

export type S140WeekView = {
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

export type S140DocumentData = {
  congregationName: string;
  yearMonth: string;
  weeks: S140WeekView[];
};
