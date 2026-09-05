import {
  AssignmentRole,
  PartTopic,
  Privilege,
  RolePreference,
  Sex,
  SlotMode,
} from '@jw/database';
import { AbsenceStatus } from '@jw/shared';
import { NotFoundException } from '@nestjs/common';
import { prisma } from '@jw/database';
import { ScheduleService } from './schedule.service';
import { hardRejectMessage } from './assign-rules';

jest.mock('@jw/database', () => {
  const actual = jest.requireActual('@jw/database');
  return {
    ...actual,
    prisma: {
      assignmentSlot: {
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      participant: {
        findMany: jest.fn(),
      },
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

  it('includes eligible participant with correct counter and sorts by name', async () => {
    mockSlot(fsmPartType);
    mockedPrisma.participant.findMany.mockResolvedValue([
      { ...elder, id: 'p-z', name: 'Zeca', titularCount: 5 },
      { ...elder, id: 'p-a', name: 'Ana', titularCount: 1 },
    ]);

    const result = await service.getEligibleParticipants(slotId);

    expect(result.eligible).toEqual([
      {
        id: 'p-a',
        name: 'Ana',
        sex: Sex.MALE,
        privilege: Privilege.ELDER,
        counter: 1,
      },
      {
        id: 'p-z',
        name: 'Zeca',
        sex: Sex.MALE,
        privilege: Privilege.ELDER,
        counter: 5,
      },
    ]);
    expect(result.slotId).toBe(slotId);
    expect(result.role).toBe(AssignmentRole.TITULAR);
  });
});
