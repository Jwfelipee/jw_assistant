import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssignmentRole,
  PartTopic,
  Prisma,
  prisma,
  type AssignmentSlot,
  type PartType,
  type WeekPart,
} from '@jw/database';
import {
  Weekday,
  addMonths,
  bimesterIndexForMonth,
  buildWeeksForMonth,
  currentYearMonth,
  formatDateOnly,
  formatYearMonth,
  parseDateOnly,
  parseYearMonth,
  type YearMonth,
} from '@jw/shared';
import { isEligibleGivenAbsences } from '../absences/eligibility';
import {
  DEFAULT_FSM_PART_COUNT,
  DEFAULT_NVC_PART_COUNT,
  buildMixedSexAlert,
  buildRepeatMonthAlert,
  counterKeyForRole,
  hardRejectMessage,
  isStudyPartType,
  sortSuggestionCandidates,
  validateHardAssignRules,
  type AssignHardRejectReason,
  type SoftAlert,
  type ParticipantRules,
} from './assign-rules';
import type { AddWeekPartDto } from './dto/add-week-part.dto';
import type { AssignSlotDto } from './dto/assign-slot.dto';
import type { HistoryQueryDto } from './dto/history-query.dto';
import type { UpdateWeekPartDto } from './dto/update-week-part.dto';

type Tx = Prisma.TransactionClient;

type SlotView = {
  id: string;
  role: AssignmentRole;
  participantId: string | null;
  participantName: string | null;
};

type WeekPartView = {
  id: string;
  partTypeId: string;
  partTypeCode: string;
  partTypeLabel: string;
  title: string;
  sortOrder: number;
  topic: PartTopic;
  countsAsMinistryPractice: boolean;
  deletable: boolean;
  slots: SlotView[];
};

type WeekView = {
  id: string;
  weekStartDate: string;
  meetingDate: string;
  parts: WeekPartView[];
};

type MonthView = {
  id: string;
  yearMonth: string;
  year: number;
  month: number;
  bimester: { id: string; year: number; index: number };
  weeks: WeekView[];
  complete: boolean;
};

type SlotWithContext = Awaited<
  ReturnType<ScheduleService['loadSlotContext']>
>;

type EligibleParticipantView = {
  id: string;
  name: string;
  sex: string;
  privilege: string;
  counter: number;
};

type IneligibleVisibleView = {
  id: string;
  name: string;
  reasonCode: AssignHardRejectReason;
  reason: string;
};

const HIDDEN_REJECT_REASONS = new Set<AssignHardRejectReason>([
  'SEX_NOT_ALLOWED',
  'PRIVILEGE_NOT_ALLOWED',
  'ROLE_PREFERENCE',
]);

@Injectable()
export class ScheduleService {
  async ensureMonth(yearMonth: string): Promise<MonthView> {
    const ym = this.parseYmOrThrow(yearMonth);
    const settings = await this.requireSettings();
    const weekday = settings.meetingWeekday as Weekday;

    const bimesterIndex = bimesterIndexForMonth(ym.month);
    const bimester = await prisma.bimester.upsert({
      where: {
        year_index: { year: ym.year, index: bimesterIndex },
      },
      create: { year: ym.year, index: bimesterIndex },
      update: {},
    });

    const month = await prisma.month.upsert({
      where: { year_month: { year: ym.year, month: ym.month } },
      create: {
        year: ym.year,
        month: ym.month,
        bimesterId: bimester.id,
      },
      update: {},
    });

    const planned = buildWeeksForMonth(ym.year, ym.month, weekday);
    const partTypes = await prisma.partType.findMany({
      orderBy: { defaultSortOrder: 'asc' },
    });

    for (const row of planned) {
      const existing = await prisma.week.findUnique({
        where: {
          monthId_weekStartDate: {
            monthId: month.id,
            weekStartDate: row.weekStartDateUtc,
          },
        },
        select: { id: true },
      });
      if (existing) {
        continue;
      }

      await this.createWeekWithTemplate({
        monthId: month.id,
        weekStartDateUtc: row.weekStartDateUtc,
        meetingDateUtc: row.meetingDateUtc,
        partTypes,
      });
    }

    return this.getMonth(yearMonth);
  }

  async getMonth(yearMonth: string): Promise<MonthView> {
    const ym = this.parseYmOrThrow(yearMonth);
    const month = await prisma.month.findUnique({
      where: { year_month: { year: ym.year, month: ym.month } },
      include: {
        bimester: true,
        weeks: {
          orderBy: { weekStartDate: 'asc' },
          include: {
            parts: {
              orderBy: { sortOrder: 'asc' },
              include: {
                partType: true,
                slots: {
                  include: {
                    participant: { select: { id: true, name: true } },
                  },
                  orderBy: { role: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!month) {
      throw new NotFoundException(
        `Mês ${formatYearMonth(ym.year, ym.month)} ainda não foi gerado`,
      );
    }

    return this.toMonthView(month);
  }

  async addWeekPart(weekId: string, dto: AddWeekPartDto): Promise<WeekPartView> {
    const week = await prisma.week.findUnique({
      where: { id: weekId },
      include: { parts: { include: { partType: true } } },
    });
    if (!week) {
      throw new NotFoundException('Semana não encontrada');
    }

    const partType = await prisma.partType.findUnique({
      where: { id: dto.partTypeId },
    });
    if (!partType) {
      throw new NotFoundException('Tipo de parte não encontrado');
    }

    if (
      partType.topic !== PartTopic.MINISTRY &&
      partType.topic !== PartTopic.CHRISTIAN_LIFE
    ) {
      throw new BadRequestException(
        'Só é possível adicionar partes FSM ou NVC na semana',
      );
    }

    if (isStudyPartType(partType.code)) {
      throw new BadRequestException(
        'O estudo bíblico de congregação já faz parte do template',
      );
    }

    const sortOrder = this.nextSortOrderForTopic(week.parts, partType.topic);
    const created = await prisma.weekPart.create({
      data: {
        weekId: week.id,
        partTypeId: partType.id,
        title: (dto.title?.trim() || partType.label).slice(0, 300),
        sortOrder,
        topic: partType.topic,
        slots: {
          create: partType.roles.map((role) => ({ role })),
        },
      },
      include: {
        partType: true,
        slots: {
          include: { participant: { select: { id: true, name: true } } },
          orderBy: { role: 'asc' },
        },
      },
    });

    return this.toPartView(created);
  }

  async removeWeekPart(partId: string): Promise<{ ok: true }> {
    const part = await prisma.weekPart.findUnique({
      where: { id: partId },
      include: {
        partType: true,
        slots: true,
      },
    });
    if (!part) {
      throw new NotFoundException('Parte não encontrada');
    }

    if (isStudyPartType(part.partType.code)) {
      throw new BadRequestException(
        'Não é permitido remover o estudo bíblico de congregação',
      );
    }

    if (
      part.topic !== PartTopic.MINISTRY &&
      part.topic !== PartTopic.CHRISTIAN_LIFE
    ) {
      throw new BadRequestException(
        'Só é possível remover partes FSM ou NVC (exceto estudo)',
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const slot of part.slots) {
        if (slot.participantId) {
          await this.decrementCounters(
            tx,
            slot.participantId,
            slot.role,
            part.partType.countsAsMinistryPractice,
          );
        }
      }
      await tx.weekPart.delete({ where: { id: partId } });
    });

    return { ok: true };
  }

  async updateWeekPartTitle(partId: string, dto: UpdateWeekPartDto) {
    const part = await prisma.weekPart.findUnique({
      where: { id: partId },
      include: { partType: true },
    });
    if (!part) {
      throw new NotFoundException('Parte não encontrada');
    }

    const title = dto.title.trim().slice(0, 300);
    if (!title) {
      throw new BadRequestException('title é obrigatório');
    }

    const updated = await prisma.weekPart.update({
      where: { id: partId },
      data: { title },
      include: { partType: true },
    });

    return {
      id: updated.id,
      title: updated.title,
      partTypeLabel: updated.partType.label,
    };
  }

  async assignSlot(slotId: string, dto: AssignSlotDto) {
    const slot = await this.loadSlotContext(slotId);
    const participant = await prisma.participant.findUnique({
      where: { id: dto.participantId },
      include: { absences: true },
    });
    if (!participant) {
      throw new NotFoundException('Participante não encontrado');
    }

    const partType = slot.weekPart.partType;
    const role = slot.role;
    const meetingDate = slot.weekPart.week.meetingDate;
    const weekId = slot.weekPart.weekId;
    const monthId = slot.weekPart.week.monthId;

    const existingAssignments = await this.countParticipantAssignmentsInWeek(
      weekId,
      participant.id,
      slot.id,
    );

    const hard = validateHardAssignRules({
      partType: {
        code: partType.code,
        allowedSexes: partType.allowedSexes as never,
        privileges: partType.privileges as never,
        roles: partType.roles as never,
        countsAsMinistryPractice: partType.countsAsMinistryPractice,
      },
      participant: this.toParticipantRules(participant),
      role: role as never,
      femaleAssignmentCountInWeek: existingAssignments,
      isSameParticipantReassign: false,
    });

    if (hard) {
      throw new BadRequestException(hardRejectMessage(hard));
    }

    if (!isEligibleGivenAbsences(participant.absences, meetingDate)) {
      throw new BadRequestException(hardRejectMessage('ABSENCE'));
    }

    const alerts = await this.collectSoftAlerts({
      participantId: participant.id,
      privilege: participant.privilege,
      sex: participant.sex,
      monthId,
      weekPartId: slot.weekPartId,
      excludingSlotId: slot.id,
    });

    if (alerts.length > 0 && !dto.confirm) {
      return {
        assigned: false,
        requiresConfirmation: true,
        alerts,
        slot: this.toSlotView(slot),
      };
    }

    await prisma.$transaction(async (tx) => {
      if (slot.participantId && slot.participantId !== participant.id) {
        await this.decrementCounters(
          tx,
          slot.participantId,
          role,
          partType.countsAsMinistryPractice,
        );
      }

      if (slot.participantId !== participant.id) {
        await this.incrementCounters(
          tx,
          participant.id,
          role,
          partType.countsAsMinistryPractice,
        );
      }

      await tx.assignmentSlot.update({
        where: { id: slot.id },
        data: { participantId: participant.id },
      });
    });

    const updated = await this.loadSlotContext(slotId);
    return {
      assigned: true,
      requiresConfirmation: false,
      alerts,
      slot: this.toSlotView(updated),
    };
  }

  async unassignSlot(slotId: string) {
    const slot = await this.loadSlotContext(slotId);
    if (!slot.participantId) {
      return { ok: true, slot: this.toSlotView(slot) };
    }

    await prisma.$transaction(async (tx) => {
      await this.decrementCounters(
        tx,
        slot.participantId!,
        slot.role,
        slot.weekPart.partType.countsAsMinistryPractice,
      );
      await tx.assignmentSlot.update({
        where: { id: slot.id },
        data: { participantId: null },
      });
    });

    const updated = await this.loadSlotContext(slotId);
    return { ok: true, slot: this.toSlotView(updated) };
  }

  async suggestForPart(
    partId: string,
    role: AssignmentRole,
    excludeParticipantId?: string,
  ) {
    const part = await prisma.weekPart.findUnique({
      where: { id: partId },
      include: {
        partType: true,
        week: true,
        slots: true,
      },
    });
    if (!part) {
      throw new NotFoundException('Parte não encontrada');
    }

    if (!part.partType.roles.includes(role)) {
      throw new BadRequestException('Papel inválido para esta parte');
    }

    const { eligibleRules } = await this.buildParticipantEligibilityForSlot({
      id: part.slots[0]?.id ?? partId,
      role,
      participantId: null,
      participant: null,
      weekPart: {
        id: part.id,
        weekId: part.weekId,
        partType: part.partType,
        week: part.week,
      },
    } as SlotWithContext);

    const filtered = excludeParticipantId
      ? eligibleRules.filter((p) => p.id !== excludeParticipantId)
      : eligibleRules;

    const sorted = sortSuggestionCandidates(filtered, role as never);
    const suggestion = sorted[0] ?? null;

    return {
      role,
      partId,
      suggestion: suggestion
        ? {
            id: suggestion.id,
            name: suggestion.name,
            sex: suggestion.sex,
            privilege: suggestion.privilege,
            counter: suggestion[counterKeyForRole(role as never)],
          }
        : null,
      candidatesCount: sorted.length,
    };
  }

  async getEligibleParticipants(slotId: string) {
    const slot = await this.loadSlotContext(slotId);
    const { eligible, ineligibleVisible } =
      await this.buildParticipantEligibilityForSlot(slot);

    const sortedEligible = [...eligible].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    );

    return {
      slotId: slot.id,
      role: slot.role,
      eligible: sortedEligible,
      ineligibleVisible,
    };
  }

  async history(query: HistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const nameFilter = query.q?.trim();
    const from = query.from ? parseDateOnly(query.from) : undefined;
    const to = query.to ? parseDateOnly(query.to) : undefined;

    const where: Prisma.AssignmentSlotWhereInput = {
      participantId: query.participantId
        ? query.participantId
        : { not: null },
      ...(query.role ? { role: query.role } : {}),
      ...(nameFilter
        ? {
            participant: {
              name: { contains: nameFilter, mode: 'insensitive' as const },
            },
          }
        : {}),
      weekPart: {
        ...(query.topic ? { topic: query.topic } : {}),
        week: {
          ...(from || to
            ? {
                meetingDate: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              }
            : {}),
        },
      },
    };

    const [total, rows] = await prisma.$transaction([
      prisma.assignmentSlot.count({ where }),
      prisma.assignmentSlot.findMany({
        where,
        include: {
          participant: { select: { id: true, name: true } },
          weekPart: {
            include: {
              partType: true,
              week: {
                include: {
                  month: true,
                },
              },
            },
          },
        },
        orderBy: {
          weekPart: { week: { meetingDate: 'desc' } },
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      items: rows.map((row) => ({
        id: row.id,
        role: row.role,
        participantId: row.participantId,
        participantName: row.participant?.name ?? null,
        partTitle: row.weekPart.title,
        partTopic: row.weekPart.topic,
        partTypeLabel: row.weekPart.partType.label,
        meetingDate: formatDateOnly(row.weekPart.week.meetingDate),
        weekStartDate: formatDateOnly(row.weekPart.week.weekStartDate),
        yearMonth: formatYearMonth(
          row.weekPart.week.month.year,
          row.weekPart.week.month.month,
        ),
      })),
    };
  }

  /**
   * Next civil month (from current month forward) without a complete schedule.
   * Complete = month exists, has ≥1 week, and every assignment slot is filled.
   */
  async nextMonthHelper(now: Date = new Date()) {
    let cursor: YearMonth = currentYearMonth(now);

    for (let i = 0; i < 24; i++) {
      const yearMonth = formatYearMonth(cursor.year, cursor.month);
      const status = await this.monthCompleteness(cursor);

      if (!status.complete) {
        return {
          yearMonth,
          exists: status.exists,
          complete: false,
          openSlots: status.openSlots,
          href: `/schedule/${yearMonth}`,
        };
      }

      cursor = addMonths(cursor, 1);
    }

    const fallback = addMonths(currentYearMonth(now), 1);
    const yearMonth = formatYearMonth(fallback.year, fallback.month);
    return {
      yearMonth,
      exists: false,
      complete: false,
      openSlots: null as number | null,
      href: `/schedule/${yearMonth}`,
    };
  }

  /** Build S-140 default part list from catalog (exported for unit tests). */
  selectTemplatePartTypes(partTypes: PartType[]): PartType[] {
    const byTopic = (topic: PartTopic) =>
      partTypes
        .filter((p) => p.topic === topic)
        .sort((a, b) => a.defaultSortOrder - b.defaultSortOrder);

    const out = byTopic(PartTopic.OUT_OF_TOPIC).filter((p) =>
      ['PRESIDENTE', 'ORACAO_INICIAL', 'ORACAO_FINAL'].includes(p.code),
    );
    const treasures = byTopic(PartTopic.TREASURES);
    const fsm = byTopic(PartTopic.MINISTRY).slice(0, DEFAULT_FSM_PART_COUNT);
    const nvcDefaults = byTopic(PartTopic.CHRISTIAN_LIFE)
      .filter((p) => !isStudyPartType(p.code))
      .slice(0, DEFAULT_NVC_PART_COUNT);
    const study = partTypes.find((p) => isStudyPartType(p.code));

    const ordered = [...out, ...treasures, ...fsm, ...nvcDefaults];
    if (study) {
      ordered.push(study);
    }

    return ordered.sort((a, b) => a.defaultSortOrder - b.defaultSortOrder);
  }

  // ─── private helpers ─────────────────────────────────────────────

  private async buildParticipantEligibilityForSlot(
    slot: SlotWithContext,
  ): Promise<{
    eligible: EligibleParticipantView[];
    eligibleRules: ParticipantRules[];
    ineligibleVisible: IneligibleVisibleView[];
  }> {
    const partType = slot.weekPart.partType;
    const role = slot.role;
    const meetingDate = slot.weekPart.week.meetingDate;
    const weekId = slot.weekPart.weekId;

    const participants = await prisma.participant.findMany({
      include: { absences: true },
    });

    const eligible: EligibleParticipantView[] = [];
    const eligibleRules: ParticipantRules[] = [];
    const ineligibleVisible: IneligibleVisibleView[] = [];

    for (const p of participants) {
      const existingAssignments = await this.countParticipantAssignmentsInWeek(
        weekId,
        p.id,
      );
      const hard = validateHardAssignRules({
        partType: {
          code: partType.code,
          allowedSexes: partType.allowedSexes as never,
          privileges: partType.privileges as never,
          roles: partType.roles as never,
          countsAsMinistryPractice: partType.countsAsMinistryPractice,
        },
        participant: this.toParticipantRules(p),
        role: role as never,
        femaleAssignmentCountInWeek: existingAssignments,
      });

      if (hard) {
        if (HIDDEN_REJECT_REASONS.has(hard)) {
          continue;
        }
        if (hard === 'FEMALE_WEEK_LIMIT') {
          ineligibleVisible.push({
            id: p.id,
            name: p.name,
            reasonCode: hard,
            reason: hardRejectMessage(hard),
          });
        }
        continue;
      }

      if (!isEligibleGivenAbsences(p.absences, meetingDate)) {
        ineligibleVisible.push({
          id: p.id,
          name: p.name,
          reasonCode: 'ABSENCE',
          reason: hardRejectMessage('ABSENCE'),
        });
        continue;
      }

      const rules = this.toParticipantRules(p);
      eligibleRules.push(rules);
      eligible.push({
        id: p.id,
        name: p.name,
        sex: p.sex,
        privilege: p.privilege,
        counter: rules[counterKeyForRole(role as never)],
      });
    }

    return { eligible, eligibleRules, ineligibleVisible };
  }

  private async createWeekWithTemplate(input: {
    monthId: string;
    weekStartDateUtc: Date;
    meetingDateUtc: Date;
    partTypes: PartType[];
  }): Promise<void> {
    const template = this.selectTemplatePartTypes(input.partTypes);

    await prisma.week.create({
      data: {
        monthId: input.monthId,
        weekStartDate: input.weekStartDateUtc,
        meetingDate: input.meetingDateUtc,
        parts: {
          create: template.map((pt) => ({
            partTypeId: pt.id,
            title: pt.label,
            sortOrder: pt.defaultSortOrder,
            topic: pt.topic,
            slots: {
              create: pt.roles.map((role) => ({ role })),
            },
          })),
        },
      },
    });
  }

  private nextSortOrderForTopic(
    parts: Array<WeekPart & { partType: PartType }>,
    topic: PartTopic,
  ): number {
    const study = parts.find((p) => isStudyPartType(p.partType.code));
    const studyOrder = study?.sortOrder ?? 90;
    const sameTopic = parts.filter(
      (p) => p.topic === topic && !isStudyPartType(p.partType.code),
    );
    const max = sameTopic.reduce(
      (acc, p) => Math.max(acc, p.sortOrder),
      topic === PartTopic.MINISTRY ? 19 : 29,
    );
    const next = max + 1;
    if (topic === PartTopic.CHRISTIAN_LIFE && next >= studyOrder) {
      return Math.max(studyOrder - 1, max);
    }
    return next;
  }

  private async collectSoftAlerts(input: {
    participantId: string;
    privilege: string;
    sex: string;
    monthId: string;
    weekPartId: string;
    excludingSlotId: string;
  }): Promise<SoftAlert[]> {
    const alerts: SoftAlert[] = [];

    const alertConfig = await prisma.alertConfig.findUnique({
      where: { privilege: input.privilege as never },
    });

    const otherInMonth = await prisma.assignmentSlot.count({
      where: {
        participantId: input.participantId,
        id: { not: input.excludingSlotId },
        weekPart: { week: { monthId: input.monthId } },
      },
    });

    const repeat = buildRepeatMonthAlert(
      alertConfig?.repeatMonthAlertEnabled ?? false,
      otherInMonth > 0,
    );
    if (repeat) {
      alerts.push(repeat);
    }

    const siblingSlots = await prisma.assignmentSlot.findMany({
      where: {
        weekPartId: input.weekPartId,
        id: { not: input.excludingSlotId },
        participantId: { not: null },
      },
      include: {
        participant: { select: { id: true, sex: true } },
      },
    });

    for (const sibling of siblingSlots) {
      if (!sibling.participant) continue;
      const hasAssociation = await this.hasAssociation(
        input.participantId,
        sibling.participant.id,
      );
      const mixed = buildMixedSexAlert({
        assigningSex: input.sex as never,
        otherSlotSex: sibling.participant.sex as never,
        hasAssociation,
      });
      if (mixed) {
        alerts.push(mixed);
        break;
      }
    }

    return alerts;
  }

  private async hasAssociation(aId: string, bId: string): Promise<boolean> {
    const [x, y] = aId < bId ? [aId, bId] : [bId, aId];
    const row = await prisma.participantAssociation.findUnique({
      where: { aId_bId: { aId: x, bId: y } },
    });
    return Boolean(row);
  }

  /** Assignments of this participant in the week, optionally excluding a slot. */
  private async countParticipantAssignmentsInWeek(
    weekId: string,
    participantId: string,
    excludingSlotId?: string,
  ): Promise<number> {
    return prisma.assignmentSlot.count({
      where: {
        participantId,
        ...(excludingSlotId ? { id: { not: excludingSlotId } } : {}),
        weekPart: { weekId },
      },
    });
  }

  private async incrementCounters(
    tx: Tx,
    participantId: string,
    role: AssignmentRole,
    ministry: boolean,
  ): Promise<void> {
    const key = counterKeyForRole(role as never);
    await tx.participant.update({
      where: { id: participantId },
      data: {
        [key]: { increment: 1 },
        ...(ministry ? { ministryPracticeCount: { increment: 1 } } : {}),
      },
    });
  }

  private async decrementCounters(
    tx: Tx,
    participantId: string,
    role: AssignmentRole,
    ministry: boolean,
  ): Promise<void> {
    const participant = await tx.participant.findUnique({
      where: { id: participantId },
    });
    if (!participant) return;

    const key = counterKeyForRole(role as never);
    const current = participant[key];
    const ministryCurrent = participant.ministryPracticeCount;

    await tx.participant.update({
      where: { id: participantId },
      data: {
        [key]: Math.max(0, current - 1),
        ...(ministry
          ? { ministryPracticeCount: Math.max(0, ministryCurrent - 1) }
          : {}),
      },
    });
  }

  private async loadSlotContext(slotId: string) {
    const slot = await prisma.assignmentSlot.findUnique({
      where: { id: slotId },
      include: {
        participant: { select: { id: true, name: true } },
        weekPart: {
          include: {
            partType: true,
            week: true,
          },
        },
      },
    });
    if (!slot) {
      throw new NotFoundException('Slot não encontrado');
    }
    return slot;
  }

  private async monthCompleteness(ym: YearMonth): Promise<{
    exists: boolean;
    complete: boolean;
    openSlots: number;
  }> {
    const month = await prisma.month.findUnique({
      where: { year_month: { year: ym.year, month: ym.month } },
      include: {
        weeks: {
          include: {
            parts: { include: { slots: true } },
          },
        },
      },
    });

    if (!month || month.weeks.length === 0) {
      return { exists: Boolean(month), complete: false, openSlots: -1 };
    }

    let open = 0;
    let total = 0;
    for (const week of month.weeks) {
      for (const part of week.parts) {
        for (const slot of part.slots) {
          total += 1;
          if (!slot.participantId) open += 1;
        }
      }
    }

    return {
      exists: true,
      complete: total > 0 && open === 0,
      openSlots: open,
    };
  }

  private async requireSettings() {
    const settings = await prisma.congregationSettings.findUnique({
      where: { id: 1 },
    });
    if (!settings) {
      throw new NotFoundException(
        'Configurações da congregação não encontradas',
      );
    }
    return settings;
  }

  private parseYmOrThrow(yearMonth: string): YearMonth {
    try {
      return parseYearMonth(yearMonth);
    } catch {
      throw new BadRequestException(
        'yearMonth inválido; use o formato YYYY-MM',
      );
    }
  }

  private toParticipantRules(p: {
    id: string;
    name: string;
    sex: string;
    privilege: string;
    rolePreference: string;
    titularCount: number;
    ajudanteCount: number;
    dirigenteCount: number;
    leitorCount: number;
  }): ParticipantRules {
    return {
      id: p.id,
      name: p.name,
      sex: p.sex as never,
      privilege: p.privilege as never,
      rolePreference: p.rolePreference as never,
      titularCount: p.titularCount,
      ajudanteCount: p.ajudanteCount,
      dirigenteCount: p.dirigenteCount,
      leitorCount: p.leitorCount,
    };
  }

  private toSlotView(
    slot: AssignmentSlot & {
      participant?: { id: string; name: string } | null;
    },
  ): SlotView {
    return {
      id: slot.id,
      role: slot.role,
      participantId: slot.participantId,
      participantName: slot.participant?.name ?? null,
    };
  }

  private toPartView(
    part: WeekPart & {
      partType: PartType;
      slots: Array<
        AssignmentSlot & {
          participant?: { id: string; name: string } | null;
        }
      >;
    },
  ): WeekPartView {
    return {
      id: part.id,
      partTypeId: part.partTypeId,
      partTypeCode: part.partType.code,
      partTypeLabel: part.partType.label,
      title: part.title,
      sortOrder: part.sortOrder,
      topic: part.topic,
      countsAsMinistryPractice: part.partType.countsAsMinistryPractice,
      deletable:
        !isStudyPartType(part.partType.code) &&
        (part.topic === PartTopic.MINISTRY ||
          part.topic === PartTopic.CHRISTIAN_LIFE),
      slots: part.slots.map((s) => this.toSlotView(s)),
    };
  }

  private toMonthView(month: {
    id: string;
    year: number;
    month: number;
    bimester: { id: string; year: number; index: number };
    weeks: Array<{
      id: string;
      weekStartDate: Date;
      meetingDate: Date;
      parts: Array<
        WeekPart & {
          partType: PartType;
          slots: Array<
            AssignmentSlot & {
              participant?: { id: string; name: string } | null;
            }
          >;
        }
      >;
    }>;
  }): MonthView {
    const weeks = month.weeks.map((week) => ({
      id: week.id,
      weekStartDate: formatDateOnly(week.weekStartDate),
      meetingDate: formatDateOnly(week.meetingDate),
      parts: week.parts.map((p) => this.toPartView(p)),
    }));

    let open = 0;
    let total = 0;
    for (const week of weeks) {
      for (const part of week.parts) {
        for (const slot of part.slots) {
          total += 1;
          if (!slot.participantId) open += 1;
        }
      }
    }

    return {
      id: month.id,
      yearMonth: formatYearMonth(month.year, month.month),
      year: month.year,
      month: month.month,
      bimester: month.bimester,
      weeks,
      complete: total > 0 && open === 0,
    };
  }
}
