import type { AssignmentRole, PartTopic } from '@jw/shared';

export type PublicScheduleScope =
  | 'current-week'
  | 'next-week'
  | 'current-month'
  | 'next-month';

export type PublicSlotView = {
  role: AssignmentRole;
  roleLabel: string;
  participantName: string | null;
};

export type PublicPartView = {
  partTypeLabel: string;
  title: string;
  topic: PartTopic;
  topicLabel: string;
  slots: PublicSlotView[];
};

export type PublicWeekView = {
  meetingDate: string;
  weekStartDate: string;
  parts: PublicPartView[];
};

export type PublicScheduleView = {
  congregationName: string;
  scope: PublicScheduleScope;
  title: string;
  yearMonth?: string;
  weeks: PublicWeekView[];
};
