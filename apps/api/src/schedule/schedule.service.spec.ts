import {
  AssignmentRole,
  PartTopic,
  Privilege,
  RolePreference,
  Sex,
  SlotMode,
} from '@jw/database';
import { AbsenceStatus } from '@jw/shared';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@jw/database';
import { ScheduleService } from './schedule.service';
import { hardRejectMessage } from './assign-rules';
import { StudyHistoryRole } from './dto/history-query.dto';

jest.mock('@jw/database', () => {
  const actual = jest.requireActual('@jw/database');
  return {
    ...actual,
    prisma: {
      assignmentSlot: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      participant: {
        findMany: jest.fn(),
      },
      weekPart: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      week: {
        findUnique: jest.fn(),
      },
      month: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
      $queryRaw: jest.fn(),
    },
  };
});

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ScheduleService.getEligibleParticipants', () => {
  const service = new ScheduleService();

  const meetingDate = new Date('2026-03-10');
  const slotId = 'slot-1';
  const weekId = 'week-1';

  const treasuresPartType = {
    id: 'pt-treasures',
    code: 'TESOUROS',
    label: 'Tesouros',
    topic: PartTopic.TREASURES,
    allowedSexes: [Sex.MALE],
    privileges: [Privilege.ELDER, Privilege.MINISTERIAL_SERVANT],
    roles: [AssignmentRole.TITULAR],
    countsAsMinistryPractice: false,
    slotMode: SlotMode.ONE,
    isSystem: true,
    deletable: false,
    defaultSortOrder: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const fsmPartType = {
    ...treasuresPartType,
    id: 'pt-fsm',
    code: 'FSM_INICIANDO',
    topic: PartTopic.MINISTRY,
    allowedSexes: [Sex.MALE, Sex.FEMALE],
    privileges: Object.values(Privilege),
    roles: [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE],
    countsAsMinistryPractice: true,
  };

  const elder = {
    id: 'p-elder',
    name: 'Ancião João',
    phone: null,
    sex: Sex.MALE,
    privilege: Privilege.ELDER,
    rolePreference: RolePreference.ANY,
    titularCount: 2,
    ajudanteCount: 0,
    dirigenteCount: 0,
    leitorCount: 0,
    ministryPracticeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    absences: [],
  };

  const publisherMale = {
    ...elder,
    id: 'p-publisher',
    name: 'Publicador Pedro',
    privilege: Privilege.PUBLISHER,
    titularCount: 0,
  };

  const sisterEligible = {
    id: 'p-sister-ok',
    name: 'Irmã Ana',
    phone: null,
    sex: Sex.FEMALE,
    privilege: Privilege.BAPTIZED,
    rolePreference: RolePreference.ANY,
    titularCount: 1,
    ajudanteCount: 0,
    dirigenteCount: 0,
    leitorCount: 0,
    ministryPracticeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    absences: [],
  };

  const sisterWeekLimit = {
    ...sisterEligible,
    id: 'p-sister-limit',
    name: 'Irmã Maria',
    titularCount: 3,
  };

  const assistantOnlySister = {
    ...sisterEligible,
    id: 'p-sister-pref',
    name: 'Irmã Pref',
    rolePreference: RolePreference.ASSISTANT_ONLY,
  };

  const absentElder = {
    ...elder,
    id: 'p-absent',
    name: 'Ancião Ausente',
    absences: [
      {
        id: 'abs-1',
        participantId: 'p-absent',
        startsOn: new Date('2026-03-01'),
        endsOn: new Date('2026-03-31'),
        justification: null,
        status: AbsenceStatus.ACTIVE,
        acknowledgedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };

  function mockSlot(partType: typeof treasuresPartType) {
    mockedPrisma.assignmentSlot.findUnique.mockResolvedValue({
      id: slotId,
      role: AssignmentRole.TITULAR,
      participantId: null,
      weekPartId: 'wp-1',
      participant: null,
      weekPart: {
        id: 'wp-1',
        weekId,
        partTypeId: partType.id,
        title: partType.label,
        sortOrder: 10,
        topic: partType.topic,
        partType,
        week: {
          id: weekId,
          monthId: 'month-1',
          weekStartDate: new Date('2026-03-09'),
          meetingDate,
        },
      },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockedPrisma.assignmentSlot.count.mockResolvedValue(0);
    mockedPrisma.assignmentSlot.findMany.mockResolvedValue([]);
    mockedPrisma.assignmentSlot.groupBy.mockResolvedValue([]);
    mockedPrisma.$queryRaw.mockResolvedValue([]);
  });

  it('throws 404 when slot does not exist', async () => {
    mockedPrisma.assignmentSlot.findUnique.mockResolvedValue(null);

    await expect(service.getEligibleParticipants('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('omits male publisher on Tesouros (privilege not allowed)', async () => {
    mockSlot(treasuresPartType);
    mockedPrisma.participant.findMany.mockResolvedValue([
      elder,
      publisherMale,
    ]);

    const result = await service.getEligibleParticipants(slotId);

    expect(result.eligible.map((p) => p.id)).toEqual(['p-elder']);
    expect(result.ineligibleVisible).toHaveLength(0);
    expect(
      result.eligible.find((p) => p.id === 'p-publisher'),
    ).toBeUndefined();
    expect(
      result.ineligibleVisible.find((p) => p.id === 'p-publisher'),
    ).toBeUndefined();
  });

  it('omits female participant on Tesouros (sex not allowed)', async () => {
    mockSlot(treasuresPartType);
    mockedPrisma.participant.findMany.mockResolvedValue([sisterEligible]);

    const result = await service.getEligibleParticipants(slotId);

    expect(result.eligible).toHaveLength(0);
    expect(result.ineligibleVisible).toHaveLength(0);
  });

  it('omits participant with incompatible role preference', async () => {
    mockSlot(fsmPartType);
    mockedPrisma.participant.findMany.mockResolvedValue([assistantOnlySister]);

    const result = await service.getEligibleParticipants(slotId);

    expect(result.eligible).toHaveLength(0);
    expect(result.ineligibleVisible).toHaveLength(0);
  });

  it('lists absent participant in ineligibleVisible with ABSENCE', async () => {
    mockSlot(treasuresPartType);
    mockedPrisma.participant.findMany.mockResolvedValue([absentElder]);

    const result = await service.getEligibleParticipants(slotId);

    expect(result.eligible).toHaveLength(0);
    expect(result.ineligibleVisible).toEqual([
      {
        id: 'p-absent',
        name: 'Ancião Ausente',
        reasonCode: 'ABSENCE',
        reason: hardRejectMessage('ABSENCE'),
      },
    ]);
  });

  it('lists sister with week assignment in ineligibleVisible with FEMALE_WEEK_LIMIT', async () => {
    mockSlot(fsmPartType);
    mockedPrisma.assignmentSlot.count.mockImplementation(async (_args) => {
      const where = _args?.where as { participantId?: string };
      if (where?.participantId === 'p-sister-limit') {
        return 1;
      }
      return 0;
    });
    mockedPrisma.participant.findMany.mockResolvedValue([
      sisterEligible,
      sisterWeekLimit,
    ]);

    const result = await service.getEligibleParticipants(slotId);

    expect(result.eligible.map((p) => p.id)).toEqual(['p-sister-ok']);
    expect(result.ineligibleVisible).toEqual([
      {
        id: 'p-sister-limit',
        name: 'Irmã Maria',
        reasonCode: 'FEMALE_WEEK_LIMIT',
        reason: hardRejectMessage('FEMALE_WEEK_LIMIT'),
      },
    ]);
  });

  it('includes enriched fields, sortCategory, and sorts by month/total counts', async () => {
    mockSlot(fsmPartType);
    mockedPrisma.participant.findMany.mockResolvedValue([
      { ...elder, id: 'p-z', name: 'Zeca', ministerioCount: 5 },
      { ...elder, id: 'p-a', name: 'Ana', ministerioCount: 1 },
    ]);
    mockedPrisma.assignmentSlot.findMany.mockResolvedValue([
      {
        participantId: 'p-a',
        role: AssignmentRole.TITULAR,
        participant: { sex: Sex.MALE },
        weekPart: {
          week: { monthId: 'month-1' },
          partType: { code: 'FSM_INICIANDO', topic: PartTopic.MINISTRY },
        },
      },
      {
        participantId: 'p-z',
        role: AssignmentRole.TITULAR,
        participant: { sex: Sex.MALE },
        weekPart: {
          week: { monthId: 'month-1' },
          partType: { code: 'FSM_INICIANDO', topic: PartTopic.MINISTRY },
        },
      },
      {
        participantId: 'p-z',
        role: AssignmentRole.TITULAR,
        participant: { sex: Sex.MALE },
        weekPart: {
          week: { monthId: 'month-1' },
          partType: { code: 'FSM_INICIANDO', topic: PartTopic.MINISTRY },
        },
      },
      {
        participantId: 'p-z',
        role: AssignmentRole.TITULAR,
        participant: { sex: Sex.MALE },
        weekPart: {
          week: { monthId: 'other-month' },
          partType: { code: 'FSM_INICIANDO', topic: PartTopic.MINISTRY },
        },
      },
    ]);
    mockedPrisma.assignmentSlot.groupBy.mockResolvedValue([
      { participantId: 'p-z', _count: { _all: 1 } },
    ]);

    const result = await service.getEligibleParticipants(slotId);

    expect(result.sortCategory).toBe('ministerio');
    expect(result.eligible).toEqual([
      {
        id: 'p-a',
        name: 'Ana',
        sex: Sex.MALE,
        privilege: Privilege.ELDER,
        phone: null,
        assignedThisWeek: false,
        countsThisMonth: { ministerio: 1 },
        countsTotal: { ministerio: 1 },
        counter: 1,
        lastAssignment: null,
      },
      {
        id: 'p-z',
        name: 'Zeca',
        sex: Sex.MALE,
        privilege: Privilege.ELDER,
        phone: null,
        assignedThisWeek: true,
        countsThisMonth: { ministerio: 2 },
        countsTotal: { ministerio: 3 },
        counter: 3,
        lastAssignment: null,
      },
    ]);
    expect(result.slotId).toBe(slotId);
    expect(result.role).toBe(AssignmentRole.TITULAR);
  });

  it('counts female FSM titular in both titular and ministerio', async () => {
    mockSlot(fsmPartType);
    mockedPrisma.participant.findMany.mockResolvedValue([sisterEligible]);
    mockedPrisma.assignmentSlot.findMany.mockResolvedValue([
      {
        participantId: 'p-sister-ok',
        role: AssignmentRole.TITULAR,
        participant: { sex: Sex.FEMALE },
        weekPart: {
          week: { monthId: 'month-1' },
          partType: { code: 'FSM_INICIANDO', topic: PartTopic.MINISTRY },
        },
      },
    ]);

    const result = await service.getEligibleParticipants(slotId);

    expect(result.eligible[0].countsThisMonth).toEqual({
      titular: 1,
      ministerio: 1,
    });
    expect(result.eligible[0].countsTotal).toEqual({
      titular: 1,
      ministerio: 1,
    });
  });
});

describe('ScheduleService.updateWeekPartTitle', () => {
  const service = new ScheduleService();
  const partId = 'wp-1';

  const partType = {
    id: 'pt-fsm',
    code: 'FSM_INICIANDO',
    label: 'Leitura da Bíblia',
    topic: PartTopic.MINISTRY,
    allowedSexes: [Sex.MALE, Sex.FEMALE],
    privileges: Object.values(Privilege),
    roles: [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE],
    countsAsMinistryPractice: true,
    slotMode: SlotMode.ONE,
    isSystem: true,
    deletable: false,
    defaultSortOrder: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const existingPart = {
    id: partId,
    weekId: 'week-1',
    partTypeId: partType.id,
    title: 'Tema antigo',
    sortOrder: 10,
    topic: PartTopic.MINISTRY,
    partType,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists trimmed title and returns partial view', async () => {
    mockedPrisma.weekPart.findUnique.mockResolvedValue(existingPart);
    mockedPrisma.weekPart.update.mockResolvedValue({
      ...existingPart,
      title: 'Discurso sobre fé',
    });

    const result = await service.updateWeekPartTitle(partId, {
      title: '  Discurso sobre fé  ',
    });

    expect(mockedPrisma.weekPart.update).toHaveBeenCalledWith({
      where: { id: partId },
      data: { title: 'Discurso sobre fé' },
      include: { partType: true },
    });
    expect(result).toEqual({
      id: partId,
      title: 'Discurso sobre fé',
      partTypeLabel: 'Leitura da Bíblia',
    });
  });

  it('throws 404 when part does not exist', async () => {
    mockedPrisma.weekPart.findUnique.mockResolvedValue(null);

    await expect(
      service.updateWeekPartTitle('missing', { title: 'Novo tema' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws 400 when title is empty after trim', async () => {
    mockedPrisma.weekPart.findUnique.mockResolvedValue(existingPart);

    await expect(
      service.updateWeekPartTitle(partId, { title: '   ' }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('ScheduleService.suggestForPart', () => {
  const service = new ScheduleService();
  const partId = 'wp-1';
  const slotId = 'slot-1';
  const weekId = 'week-1';
  const meetingDate = new Date('2026-03-10');

  const fsmPartType = {
    id: 'pt-fsm',
    code: 'FSM_INICIANDO',
    label: 'FSM',
    topic: PartTopic.MINISTRY,
    allowedSexes: [Sex.MALE, Sex.FEMALE],
    privileges: Object.values(Privilege),
    roles: [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE],
    countsAsMinistryPractice: true,
    slotMode: SlotMode.ONE,
    isSystem: true,
    deletable: false,
    defaultSortOrder: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const elderLow = {
    id: 'p-low',
    name: 'Ana',
    phone: null,
    sex: Sex.MALE,
    privilege: Privilege.ELDER,
    rolePreference: RolePreference.ANY,
    titularCount: 1,
    ajudanteCount: 0,
    dirigenteCount: 0,
    leitorCount: 0,
    ministryPracticeCount: 0,
    ministerioCount: 1,
    presidenteCount: 0,
    oracaoCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    absences: [],
  };

  const elderHigh = {
    ...elderLow,
    id: 'p-high',
    name: 'Zeca',
    titularCount: 5,
    ministerioCount: 5,
  };

  function mockPart() {
    mockedPrisma.weekPart.findUnique.mockResolvedValue({
      id: partId,
      weekId,
      partTypeId: fsmPartType.id,
      title: fsmPartType.label,
      sortOrder: 10,
      topic: PartTopic.MINISTRY,
      partType: fsmPartType,
      week: {
        id: weekId,
        monthId: 'month-1',
        weekStartDate: new Date('2026-03-09'),
        meetingDate,
      },
      slots: [{ id: slotId, role: AssignmentRole.TITULAR, participantId: null }],
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockedPrisma.assignmentSlot.count.mockResolvedValue(0);
    mockedPrisma.participant.findMany.mockResolvedValue([elderHigh, elderLow]);
  });

  it('returns lowest-counter candidate without exclude', async () => {
    mockPart();

    const result = await service.suggestForPart(partId, AssignmentRole.TITULAR);

    expect(result.suggestion?.id).toBe('p-low');
    expect(result.candidatesCount).toBe(2);
  });

  it('returns next candidate when excludeParticipantId is provided', async () => {
    mockPart();

    const result = await service.suggestForPart(
      partId,
      AssignmentRole.TITULAR,
      'p-low',
    );

    expect(result.suggestion?.id).toBe('p-high');
    expect(result.candidatesCount).toBe(1);
  });

  it('returns null suggestion when only excluded participant was eligible', async () => {
    mockPart();
    mockedPrisma.participant.findMany.mockResolvedValue([elderLow]);

    const result = await service.suggestForPart(
      partId,
      AssignmentRole.TITULAR,
      'p-low',
    );

    expect(result.suggestion).toBeNull();
    expect(result.candidatesCount).toBe(0);
  });
});

describe('ScheduleService.ensureHorizon', () => {
  const service = new ScheduleService();
  const fixedNow = new Date('2026-09-15');

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ensures exactly 7 months from current civil month through +6', async () => {
    const ensureMonthSpy = jest
      .spyOn(service, 'ensureMonth')
      .mockResolvedValue({} as never);

    const result = await service.ensureHorizon(fixedNow);

    expect(result).toEqual({
      ensuredFrom: '2026-09',
      ensuredTo: '2027-03',
      monthsEnsured: 7,
    });
    expect(ensureMonthSpy).toHaveBeenCalledTimes(7);
    expect(ensureMonthSpy.mock.calls.map((c) => c[0])).toEqual([
      '2026-09',
      '2026-10',
      '2026-11',
      '2026-12',
      '2027-01',
      '2027-02',
      '2027-03',
    ]);
  });

  it('is idempotent when called twice', async () => {
    const ensureMonthSpy = jest
      .spyOn(service, 'ensureMonth')
      .mockResolvedValue({} as never);

    await service.ensureHorizon(fixedNow);
    await service.ensureHorizon(fixedNow);

    expect(ensureMonthSpy).toHaveBeenCalledTimes(14);
  });
});

describe('ScheduleService.getMonthStatus', () => {
  const service = new ScheduleService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns incomplete status for empty month without weeks', async () => {
    mockedPrisma.month.findUnique.mockResolvedValue({
      id: 'month-1',
      year: 2026,
      month: 9,
      bimesterId: 'bim-1',
      weeks: [],
    });

    const status = await service.getMonthStatus({ year: 2026, month: 9 });

    expect(status).toEqual({
      exists: true,
      complete: false,
      openSlots: -1,
      totalSlots: -1,
      weekCount: 0,
    });
  });

  it('returns complete status when every slot is filled', async () => {
    mockedPrisma.month.findUnique.mockResolvedValue({
      id: 'month-1',
      year: 2026,
      month: 9,
      bimesterId: 'bim-1',
      weeks: [
        {
          id: 'week-1',
          parts: [
            {
              slots: [
                { participantId: 'p-1' },
                { participantId: 'p-2' },
              ],
            },
          ],
        },
      ],
    });

    const status = await service.getMonthStatus({ year: 2026, month: 9 });

    expect(status).toEqual({
      exists: true,
      complete: true,
      openSlots: 0,
      totalSlots: 2,
      weekCount: 1,
    });
  });

  it('returns incomplete status with open slot count when slots are empty', async () => {
    mockedPrisma.month.findUnique.mockResolvedValue({
      id: 'month-1',
      year: 2026,
      month: 9,
      bimesterId: 'bim-1',
      weeks: [
        {
          id: 'week-1',
          parts: [
            {
              slots: [
                { participantId: 'p-1' },
                { participantId: null },
                { participantId: null },
              ],
            },
          ],
        },
      ],
    });

    const status = await service.getMonthStatus({ year: 2026, month: 9 });

    expect(status).toEqual({
      exists: true,
      complete: false,
      openSlots: 2,
      totalSlots: 3,
      weekCount: 1,
    });
  });
});

describe('ScheduleService.listScheduleMonths', () => {
  const service = new ScheduleService();
  const fixedNow = new Date('2026-09-15');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(service, 'ensureHorizon').mockResolvedValue({
      ensuredFrom: '2026-09',
      ensuredTo: '2027-03',
      monthsEnsured: 7,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns months with correct horizon and past flags', async () => {
    mockedPrisma.month.findMany.mockResolvedValue([
      { id: 'm-past', year: 2026, month: 8, bimesterId: 'b1' },
      { id: 'm-current', year: 2026, month: 9, bimesterId: 'b1' },
      { id: 'm-future', year: 2026, month: 10, bimesterId: 'b1' },
    ]);

    jest.spyOn(service, 'getMonthStatus').mockImplementation(async (ym) => {
      if (ym.month === 8) {
        return {
          exists: true,
          complete: true,
          openSlots: 0,
          totalSlots: 12,
          weekCount: 4,
        };
      }
      if (ym.month === 9) {
        return {
          exists: true,
          complete: false,
          openSlots: 3,
          totalSlots: 12,
          weekCount: 4,
        };
      }
      return {
        exists: true,
        complete: false,
        openSlots: 12,
        totalSlots: 12,
        weekCount: 4,
      };
    });

    const result = await service.listScheduleMonths({}, fixedNow);

    expect(result.currentYearMonth).toBe('2026-09');
    expect(result.horizonEnd).toBe('2027-03');
    expect(result.months.map((m) => m.yearMonth)).toEqual([
      '2026-08',
      '2026-09',
      '2026-10',
    ]);

    const past = result.months.find((m) => m.yearMonth === '2026-08');
    const current = result.months.find((m) => m.yearMonth === '2026-09');
    const future = result.months.find((m) => m.yearMonth === '2026-10');

    expect(past).toMatchObject({
      isPast: true,
      isCurrent: false,
      isInHorizon: false,
      complete: true,
      href: '/schedule/2026-08',
    });
    expect(current).toMatchObject({
      isPast: false,
      isCurrent: true,
      isInHorizon: true,
      complete: false,
      openSlots: 3,
      weekCount: 4,
    });
    expect(future).toMatchObject({
      isPast: false,
      isCurrent: false,
      isInHorizon: true,
      complete: false,
      openSlots: 12,
    });
    expect(service.ensureHorizon).toHaveBeenCalledWith(fixedNow);
  });
});

describe('ScheduleService.reorderWeekParts', () => {
  const service = new ScheduleService();
  const weekId = 'week-1';

  const fsmPartType = {
    id: 'pt-fsm',
    code: 'FSM_INICIANDO',
    label: 'FSM',
    topic: PartTopic.MINISTRY,
    allowedSexes: [Sex.MALE, Sex.FEMALE],
    privileges: Object.values(Privilege),
    roles: [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE],
    countsAsMinistryPractice: true,
    slotMode: SlotMode.ONE,
    isSystem: true,
    deletable: false,
    defaultSortOrder: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const studyPartType = {
    ...fsmPartType,
    id: 'pt-study',
    code: 'ESTUDO_BIBLICO',
    label: 'Estudo bíblico',
    topic: PartTopic.CHRISTIAN_LIFE,
    defaultSortOrder: 90,
  };

  const treasuresPartType = {
    ...fsmPartType,
    id: 'pt-treasures',
    code: 'TESOUROS',
    label: 'Tesouros',
    topic: PartTopic.TREASURES,
    defaultSortOrder: 10,
  };

  function makePart(
    id: string,
    partType: typeof fsmPartType,
    sortOrder: number,
  ) {
    return {
      id,
      weekId,
      partTypeId: partType.id,
      title: partType.label,
      sortOrder,
      topic: partType.topic,
      partType,
    };
  }

  function mockWeek(parts: ReturnType<typeof makePart>[]) {
    mockedPrisma.week.findUnique.mockResolvedValue({
      id: weekId,
      monthId: 'month-1',
      weekStartDate: new Date('2026-03-09'),
      meetingDate: new Date('2026-03-10'),
      parts,
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockedPrisma.$transaction.mockImplementation(async (ops) => {
      if (Array.isArray(ops)) {
        return Promise.all(ops);
      }
      return ops(mockedPrisma);
    });
    mockedPrisma.weekPart.update.mockImplementation(async (args) => args);
  });

  it('reorders 3 FSM parts to sortOrder 20, 21, 22', async () => {
    const p1 = makePart('fsm-1', fsmPartType, 20);
    const p2 = makePart('fsm-2', fsmPartType, 21);
    const p3 = makePart('fsm-3', fsmPartType, 22);
    mockWeek([p1, p2, p3]);

    const result = await service.reorderWeekParts(weekId, {
      orderedPartIds: ['fsm-3', 'fsm-1', 'fsm-2'],
    });

    expect(result).toEqual({ ok: true });
    expect(mockedPrisma.weekPart.update).toHaveBeenCalledTimes(3);
    expect(mockedPrisma.weekPart.update).toHaveBeenCalledWith({
      where: { id: 'fsm-3' },
      data: { sortOrder: 20 },
    });
    expect(mockedPrisma.weekPart.update).toHaveBeenCalledWith({
      where: { id: 'fsm-1' },
      data: { sortOrder: 21 },
    });
    expect(mockedPrisma.weekPart.update).toHaveBeenCalledWith({
      where: { id: 'fsm-2' },
      data: { sortOrder: 22 },
    });
  });

  it('rejects study id in payload', async () => {
    const fsm = makePart('fsm-1', fsmPartType, 20);
    const study = makePart('study-1', studyPartType, 90);
    mockWeek([fsm, study]);

    await expect(
      service.reorderWeekParts(weekId, {
        orderedPartIds: ['fsm-1', 'study-1'],
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockedPrisma.weekPart.update).not.toHaveBeenCalled();
  });

  it('rejects foreign week id', async () => {
    const fsm = makePart('fsm-1', fsmPartType, 20);
    mockWeek([fsm]);

    await expect(
      service.reorderWeekParts(weekId, {
        orderedPartIds: ['fsm-1', 'foreign-part'],
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockedPrisma.weekPart.update).not.toHaveBeenCalled();
  });

  it('leaves treasures sortOrder unchanged (not in payload)', async () => {
    const treasures = makePart('t-1', treasuresPartType, 10);
    const fsm = makePart('fsm-1', fsmPartType, 20);
    mockWeek([treasures, fsm]);

    await service.reorderWeekParts(weekId, { orderedPartIds: ['fsm-1'] });

    expect(mockedPrisma.weekPart.update).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.weekPart.update).toHaveBeenCalledWith({
      where: { id: 'fsm-1' },
      data: { sortOrder: 20 },
    });
  });
});

describe('ScheduleService.history', () => {
  const service = new ScheduleService();

  const joiasPartType = {
    id: 'pt-joias',
    code: 'JOIAS_ESPIRITUAIS',
    label: 'Joias espirituais',
    topic: PartTopic.TREASURES,
    allowedSexes: [Sex.MALE, Sex.FEMALE],
    privileges: Object.values(Privilege),
    roles: [AssignmentRole.TITULAR],
    countsAsMinistryPractice: false,
    slotMode: SlotMode.ONE,
    isSystem: true,
    deletable: false,
    defaultSortOrder: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const presidentePartType = {
    ...joiasPartType,
    id: 'pt-presidente',
    code: 'PRESIDENTE',
    label: 'Presidente',
    defaultSortOrder: 5,
  };

  const estudoPartType = {
    ...joiasPartType,
    id: 'pt-estudo',
    code: 'ESTUDO_BIBLICO',
    label: 'Estudo bíblico',
    topic: PartTopic.CHRISTIAN_LIFE,
    roles: [AssignmentRole.DIRIGENTE, AssignmentRole.LEITOR],
    defaultSortOrder: 90,
  };

  type HistorySlotRow = {
    id: string;
    role: AssignmentRole;
    participantId: string;
    participant: { id: string; name: string };
    weekPart: {
      id: string;
      title: string;
      topic: PartTopic;
      partType: typeof joiasPartType;
      week: {
        id: string;
        weekStartDate: Date;
        meetingDate: Date;
        month: { year: number; month: number };
      };
    };
  };

  function makeHistorySlot(params: {
    id: string;
    role: AssignmentRole;
    participantId: string;
    participantName: string;
    partType: typeof joiasPartType;
    meetingDate: Date;
  }): HistorySlotRow {
    const d = params.meetingDate;
    return {
      id: params.id,
      role: params.role,
      participantId: params.participantId,
      participant: { id: params.participantId, name: params.participantName },
      weekPart: {
        id: `wp-${params.id}`,
        title: params.partType.label,
        topic: params.partType.topic,
        partType: params.partType,
        week: {
          id: `week-${params.id}`,
          weekStartDate: d,
          meetingDate: d,
          month: { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 },
        },
      },
    };
  }

  function installFlatHistoryMocks(
    rows: HistorySlotRow[],
    total = rows.length,
  ) {
    let capturedWhere: unknown;
    mockedPrisma.assignmentSlot.count.mockImplementation((args) => {
      capturedWhere = args.where;
      return Promise.resolve(total);
    });
    mockedPrisma.assignmentSlot.findMany.mockResolvedValue(rows);
    mockedPrisma.$transaction.mockImplementation(async (ops) => {
      if (Array.isArray(ops)) {
        return Promise.all(ops);
      }
      return ops(mockedPrisma);
    });
    return {
      getWhere: () => capturedWhere,
    };
  }

  function installLastPerParticipantMocks(options: {
    total: number;
    winnerIds: string[];
    rows: HistorySlotRow[];
  }) {
    mockedPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: options.total }])
      .mockResolvedValueOnce(options.winnerIds.map((id) => ({ id })));
    mockedPrisma.assignmentSlot.findMany.mockResolvedValue(options.rows);
    mockedPrisma.$transaction.mockImplementation(async (ops) => {
      if (Array.isArray(ops)) {
        return Promise.all(ops);
      }
      return ops(mockedPrisma);
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sex and partTypeId filters', () => {
    it('returns only the sister Joias slot when sex=FEMALE', async () => {
      const sisterSlot = makeHistorySlot({
        id: 'slot-sister',
        role: AssignmentRole.TITULAR,
        participantId: 'p-sister',
        participantName: 'Irmã Ana',
        partType: joiasPartType,
        meetingDate: new Date('2025-03-10'),
      });
      const { getWhere } = installFlatHistoryMocks([sisterSlot], 1);

      const result = await service.history({
        sex: Sex.FEMALE,
        partTypeId: joiasPartType.id,
      });

      expect(getWhere()).toMatchObject({
        participant: { sex: Sex.FEMALE },
        weekPart: { partTypeId: joiasPartType.id },
      });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 'slot-sister',
        participantName: 'Irmã Ana',
      });
    });

    it('filters by partTypeId so Presidente query excludes Joias', async () => {
      const presidenteSlot = makeHistorySlot({
        id: 'slot-pres',
        role: AssignmentRole.TITULAR,
        participantId: 'p-elder',
        participantName: 'Ancião',
        partType: presidentePartType,
        meetingDate: new Date('2025-04-01'),
      });
      const { getWhere } = installFlatHistoryMocks([presidenteSlot], 1);

      const result = await service.history({
        partTypeId: presidentePartType.id,
      });

      expect(getWhere()).toMatchObject({
        weekPart: expect.objectContaining({
          partTypeId: presidentePartType.id,
        }),
      });
      expect(result.items[0].partTypeLabel).toBe('Presidente');
    });
  });

  describe('studyRole filter', () => {
    const dirigenteSlot = makeHistorySlot({
      id: 'slot-dir',
      role: AssignmentRole.DIRIGENTE,
      participantId: 'p-dir',
      participantName: 'Dirigente',
      partType: estudoPartType,
      meetingDate: new Date('2025-05-12'),
    });
    const leitorSlot = makeHistorySlot({
      id: 'slot-leitor',
      role: AssignmentRole.LEITOR,
      participantId: 'p-leitor',
      participantName: 'Leitor',
      partType: estudoPartType,
      meetingDate: new Date('2025-05-12'),
    });

    it('studyRole=DIRIGENTE returns one DIRIGENTE assignment', async () => {
      const { getWhere } = installFlatHistoryMocks([dirigenteSlot], 1);

      const result = await service.history({
        partTypeId: estudoPartType.id,
        studyRole: StudyHistoryRole.DIRIGENTE,
      });

      expect(getWhere()).toMatchObject({ role: AssignmentRole.DIRIGENTE });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].role).toBe(AssignmentRole.DIRIGENTE);
    });

    it('studyRole=LEITOR returns one LEITOR assignment', async () => {
      const { getWhere } = installFlatHistoryMocks([leitorSlot], 1);

      const result = await service.history({
        partTypeId: estudoPartType.id,
        studyRole: StudyHistoryRole.LEITOR,
      });

      expect(getWhere()).toMatchObject({ role: AssignmentRole.LEITOR });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].role).toBe(AssignmentRole.LEITOR);
    });

    it('studyRole=BOTH includes DIRIGENTE and LEITOR, not TITULAR', async () => {
      const { getWhere } = installFlatHistoryMocks(
        [dirigenteSlot, leitorSlot],
        2,
      );

      const result = await service.history({
        partTypeId: estudoPartType.id,
        studyRole: StudyHistoryRole.BOTH,
      });

      expect(getWhere()).toMatchObject({
        role: {
          in: [AssignmentRole.DIRIGENTE, AssignmentRole.LEITOR],
        },
      });
      expect(result.items).toHaveLength(2);
      expect(result.items.map((i) => i.role).sort()).toEqual([
        AssignmentRole.DIRIGENTE,
        AssignmentRole.LEITOR,
      ]);
      expect(result.items.every((i) => i.role !== AssignmentRole.TITULAR)).toBe(
        true,
      );
    });
  });

  describe('lastPerParticipant', () => {
    const slotPJan = makeHistorySlot({
      id: 'slot-p-jan',
      role: AssignmentRole.TITULAR,
      participantId: 'p-p',
      participantName: 'Participante P',
      partType: joiasPartType,
      meetingDate: new Date('2025-01-01'),
    });
    const slotPJun = makeHistorySlot({
      id: 'slot-p-jun',
      role: AssignmentRole.TITULAR,
      participantId: 'p-p',
      participantName: 'Participante P',
      partType: joiasPartType,
      meetingDate: new Date('2025-06-01'),
    });
    const slotQ = makeHistorySlot({
      id: 'slot-q',
      role: AssignmentRole.TITULAR,
      participantId: 'p-q',
      participantName: 'Participante Q',
      partType: joiasPartType,
      meetingDate: new Date('2025-03-15'),
    });

    it('flat listing returns all assignment rows', async () => {
      installFlatHistoryMocks([slotPJan, slotPJun, slotQ], 3);

      const result = await service.history({
        partTypeId: joiasPartType.id,
      });

      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);
    });

    it('with date range keeps latest Joias per participant in range', async () => {
      installLastPerParticipantMocks({
        total: 2,
        winnerIds: ['slot-p-jun', 'slot-q'],
        rows: [slotPJun, slotQ],
      });

      const result = await service.history({
        partTypeId: joiasPartType.id,
        lastPerParticipant: true,
        from: '2025-01-01',
        to: '2025-12-31',
      });

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      const pItem = result.items.find((i) => i.participantId === 'p-p');
      expect(pItem?.meetingDate).toBe('2025-06-01');
      expect(result.items[0].meetingDate).toBe('2025-06-01');
    });

    it('without dates uses global latest per participant', async () => {
      installLastPerParticipantMocks({
        total: 2,
        winnerIds: ['slot-p-jun', 'slot-q'],
        rows: [slotPJun, slotQ],
      });

      const result = await service.history({
        partTypeId: joiasPartType.id,
        lastPerParticipant: true,
      });

      expect(result.total).toBe(2);
      const pItem = result.items.find((i) => i.participantId === 'p-p');
      expect(pItem?.meetingDate).toBe('2025-06-01');
    });

    it('paginates aggregated participants with limit=1', async () => {
      installLastPerParticipantMocks({
        total: 2,
        winnerIds: ['slot-p-jun'],
        rows: [slotPJun],
      });

      const result = await service.history({
        partTypeId: joiasPartType.id,
        lastPerParticipant: true,
        limit: 1,
        page: 1,
      });

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(1);
      expect(result.limit).toBe(1);
    });
  });
});
