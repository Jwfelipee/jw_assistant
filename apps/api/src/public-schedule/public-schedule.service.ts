import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AssignmentRole,
  PartTopic,
  prisma,
  type AssignmentSlot,
  type PartType,
  type WeekPart,
} from '@jw/database';
import {
  addIsoWeeks,
  addMonths,
  currentYearMonth,
  formatDateOnly,
  formatYearMonth,
  isoWeekBoundsForDate,
  toUtcDateOnly,
} from '@jw/shared';
import { ScheduleService } from '../schedule/schedule.service';
import { SettingsService } from '../settings/settings.service';
import type {
  PublicPartView,
  PublicScheduleScope,
  PublicScheduleView,
  PublicSlotView,
  PublicWeekView,
} from './public-schedule.types';

const SCOPE_TITLES: Record<PublicScheduleScope, string> = {
  'current-week': 'Esta semana',
  'next-week': 'Próxima semana',
  'current-month': 'Este mês',
  'next-month': 'Próximo mês',
};

const LINK_FLAG_BY_SCOPE: Record<
  PublicScheduleScope,
  keyof Pick<
    Awaited<ReturnType<SettingsService['get']>>,
    | 'publicLinkCurrentWeekEnabled'
    | 'publicLinkNextWeekEnabled'
    | 'publicLinkCurrentMonthEnabled'
    | 'publicLinkNextMonthEnabled'
  >
> = {
  'current-week': 'publicLinkCurrentWeekEnabled',
  'next-week': 'publicLinkNextWeekEnabled',
  'current-month': 'publicLinkCurrentMonthEnabled',
  'next-month': 'publicLinkNextMonthEnabled',
};

const ROLE_LABELS: Record<AssignmentRole, string> = {
  [AssignmentRole.TITULAR]: 'Titular',
  [AssignmentRole.AJUDANTE]: 'Ajudante',
  [AssignmentRole.DIRIGENTE]: 'Dirigente',
  [AssignmentRole.LEITOR]: 'Leitor',
};

const TOPIC_LABELS: Record<PartTopic, string> = {
  [PartTopic.OUT_OF_TOPIC]: 'Abertura e encerramento',
  [PartTopic.TREASURES]: 'Tesouros da Palavra de Deus',
  [PartTopic.MINISTRY]: 'Faça seu melhor no ministério',
  [PartTopic.CHRISTIAN_LIFE]: 'Nossa vida cristã',
};

type WeekWithParts = {
  weekStartDate: Date;
  meetingDate: Date;
  parts: Array<
    WeekPart & {
      partType: PartType;
      slots: Array<
        AssignmentSlot & {
          participant?: { name: string } | null;
        }
      >;
    }
  >;
};

@Injectable()
export class PublicScheduleService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly scheduleService: ScheduleService,
  ) {}

  async getCurrentWeek(now: Date = new Date()): Promise<PublicScheduleView> {
    const settings = await this.assertLinkEnabled('current-week');
    const bounds = isoWeekBoundsForDate(now);
    const weeks = await this.findWeeksInBounds(bounds);
    return this.buildView(settings.congregationName, 'current-week', weeks);
  }

  async getNextWeek(now: Date = new Date()): Promise<PublicScheduleView> {
    const settings = await this.assertLinkEnabled('next-week');
    const bounds = addIsoWeeks(isoWeekBoundsForDate(now), 1);
    const weeks = await this.findWeeksInBounds(bounds);
    return this.buildView(settings.congregationName, 'next-week', weeks);
  }

  async getCurrentMonth(now: Date = new Date()): Promise<PublicScheduleView> {
    const settings = await this.assertLinkEnabled('current-month');
    const ym = currentYearMonth(now);
    const yearMonth = formatYearMonth(ym.year, ym.month);
    const month = await this.scheduleService.getMonth(yearMonth);
    return this.buildMonthView(
      settings.congregationName,
      'current-month',
      yearMonth,
      month.weeks,
    );
  }

  async getNextMonth(now: Date = new Date()): Promise<PublicScheduleView> {
    const settings = await this.assertLinkEnabled('next-month');
    const ym = addMonths(currentYearMonth(now), 1);
    const yearMonth = formatYearMonth(ym.year, ym.month);
    const month = await this.scheduleService.getMonth(yearMonth);
    return this.buildMonthView(
      settings.congregationName,
      'next-month',
      yearMonth,
      month.weeks,
    );
  }

  private async assertLinkEnabled(scope: PublicScheduleScope) {
    const settings = await this.settingsService.get();
    const flag = LINK_FLAG_BY_SCOPE[scope];
    if (!settings[flag]) {
      throw new NotFoundException('Este link está desativado.');
    }
    return settings;
  }

  private async findWeeksInBounds(bounds: {
    start: Date;
    end: Date;
  }): Promise<WeekWithParts[]> {
    return prisma.week.findMany({
      where: {
        meetingDate: {
          gte: toUtcDateOnly(bounds.start),
          lte: toUtcDateOnly(bounds.end),
        },
      },
      include: {
        parts: {
          orderBy: { sortOrder: 'asc' },
          include: {
            partType: true,
            slots: {
              include: { participant: true },
              orderBy: { role: 'asc' },
            },
          },
        },
      },
      orderBy: { meetingDate: 'asc' },
    });
  }

  private buildView(
    congregationName: string,
    scope: PublicScheduleScope,
    weeks: WeekWithParts[],
  ): PublicScheduleView {
    return {
      congregationName,
      scope,
      title: SCOPE_TITLES[scope],
      weeks: weeks.map((week) => this.toPublicWeekView(week)),
    };
  }

  private buildMonthView(
    congregationName: string,
    scope: PublicScheduleScope,
    yearMonth: string,
    weeks: Array<{
      weekStartDate: string;
      meetingDate: string;
      parts: Array<{
        partTypeLabel: string;
        title: string;
        topic: PartTopic;
        sortOrder: number;
        slots: Array<{
          role: AssignmentRole;
          participantName: string | null;
          participantPhone?: string | null;
          participantId?: string | null;
          id?: string;
        }>;
      }>;
    }>,
  ): PublicScheduleView {
    return {
      congregationName,
      scope,
      title: SCOPE_TITLES[scope],
      yearMonth,
      weeks: weeks.map((week) => ({
        meetingDate: week.meetingDate,
        weekStartDate: week.weekStartDate,
        parts: week.parts
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((part) => this.toPublicPartView(part)),
      })),
    };
  }

  toPublicWeekView(week: WeekWithParts): PublicWeekView {
    return {
      meetingDate: formatDateOnly(week.meetingDate),
      weekStartDate: formatDateOnly(week.weekStartDate),
      parts: week.parts.map((part) => this.toPublicPartView(part)),
    };
  }

  private toPublicPartView(
    part: WeekWithParts['parts'][number] | {
      partTypeLabel: string;
      title: string;
      topic: PartTopic;
      slots: Array<{
        role: AssignmentRole;
        participantName: string | null;
        participant?: { name: string } | null;
      }>;
    },
  ): PublicPartView {
    const partTypeLabel =
      'partType' in part ? part.partType.label : part.partTypeLabel;

    const slots = part.slots.map((slot) => this.toPublicSlotView(slot));

    return {
      partTypeLabel,
      title: part.title,
      topic: part.topic,
      topicLabel: TOPIC_LABELS[part.topic],
      slots,
    };
  }

  private toPublicSlotView(
    slot:
      | (AssignmentSlot & { participant?: { name: string } | null })
      | {
          role: AssignmentRole;
          participantName: string | null;
          participantPhone?: string | null;
          participantId?: string | null;
          id?: string;
        },
  ): PublicSlotView {
    const participantName =
      'participantName' in slot
        ? slot.participantName
        : (slot.participant?.name ?? null);

    return {
      role: slot.role,
      roleLabel: ROLE_LABELS[slot.role],
      participantName,
    };
  }
}
