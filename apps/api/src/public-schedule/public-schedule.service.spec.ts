import { NotFoundException } from '@nestjs/common';
import {
  AssignmentRole,
  PartTopic,
  prisma,
} from '@jw/database';
import { ScheduleService } from '../schedule/schedule.service';
import { SettingsService } from '../settings/settings.service';
import { PublicScheduleService } from './public-schedule.service';

jest.mock('@jw/database', () => {
  const actual = jest.requireActual('@jw/database');
  return {
    ...actual,
    prisma: {
      week: {
        findMany: jest.fn(),
      },
    },
  };
});

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('PublicScheduleService', () => {
  const settingsService = {
    get: jest.fn(),
  } as unknown as jest.Mocked<SettingsService>;

  const scheduleService = {
    getMonth: jest.fn(),
  } as unknown as jest.Mocked<ScheduleService>;

  const service = new PublicScheduleService(settingsService, scheduleService);

  const enabledSettings = {
    congregationName: 'Congregação Centro',
    meetingWeekday: 'THURSDAY' as const,
    publicLinkCurrentWeekEnabled: true,
    publicLinkNextWeekEnabled: true,
    publicLinkCurrentMonthEnabled: true,
    publicLinkNextMonthEnabled: true,
  };

  const weekRow = {
    weekStartDate: new Date('2026-09-14T00:00:00.000Z'),
    meetingDate: new Date('2026-09-18T00:00:00.000Z'),
    parts: [
      {
        title: 'Discurso',
        sortOrder: 1,
        topic: PartTopic.TREASURES,
        partType: { label: 'Discurso' },
        slots: [
          {
            role: AssignmentRole.TITULAR,
            participant: { name: 'João Silva' },
          },
          {
            role: AssignmentRole.AJUDANTE,
            participant: null,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    settingsService.get.mockResolvedValue(enabledSettings);
  });

  describe('getCurrentWeek', () => {
    it('returns meeting in the current ISO week without phone fields', async () => {
      mockedPrisma.week.findMany.mockResolvedValue([weekRow] as never);

      const result = await service.getCurrentWeek(new Date(2026, 8, 18));

      expect(mockedPrisma.week.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            meetingDate: {
              gte: new Date('2026-09-14T00:00:00.000Z'),
              lte: new Date('2026-09-20T00:00:00.000Z'),
            },
          },
        }),
      );
      expect(result).toMatchObject({
        congregationName: 'Congregação Centro',
        scope: 'current-week',
        title: 'Esta semana',
        weeks: [
          {
            meetingDate: '2026-09-18',
            weekStartDate: '2026-09-14',
            parts: [
              {
                partTypeLabel: 'Discurso',
                title: 'Discurso',
                topic: PartTopic.TREASURES,
                topicLabel: 'Tesouros da Palavra de Deus',
                slots: [
                  {
                    role: AssignmentRole.TITULAR,
                    roleLabel: 'Titular',
                    participantName: 'João Silva',
                  },
                  {
                    role: AssignmentRole.AJUDANTE,
                    roleLabel: 'Ajudante',
                    participantName: null,
                  },
                ],
              },
            ],
          },
        ],
      });
      expect(JSON.stringify(result)).not.toContain('participantPhone');
      expect(JSON.stringify(result)).not.toContain('participantId');
    });

    it('throws NotFoundException when current-week link is disabled', async () => {
      settingsService.get.mockResolvedValue({
        ...enabledSettings,
        publicLinkCurrentWeekEnabled: false,
      });

      await expect(service.getCurrentWeek()).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockedPrisma.week.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getNextWeek', () => {
    it('queries the next ISO week bounds', async () => {
      mockedPrisma.week.findMany.mockResolvedValue([]);

      const result = await service.getNextWeek(new Date(2026, 8, 18));

      expect(mockedPrisma.week.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            meetingDate: {
              gte: new Date('2026-09-21T00:00:00.000Z'),
              lte: new Date('2026-09-27T00:00:00.000Z'),
            },
          },
        }),
      );
      expect(result.scope).toBe('next-week');
      expect(result.title).toBe('Próxima semana');
    });

    it('throws NotFoundException when next-week link is disabled', async () => {
      settingsService.get.mockResolvedValue({
        ...enabledSettings,
        publicLinkNextWeekEnabled: false,
      });

      await expect(service.getNextWeek()).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getCurrentMonth', () => {
    it('delegates to ScheduleService.getMonth for the current civil month', async () => {
      scheduleService.getMonth.mockResolvedValue({
        id: 'month-1',
        yearMonth: '2026-09',
        year: 2026,
        month: 9,
        bimester: { id: 'b1', year: 2026, index: 5 },
        complete: false,
        weeks: [
          {
            id: 'week-1',
            weekStartDate: '2026-09-14',
            meetingDate: '2026-09-18',
            parts: [
              {
                id: 'part-1',
                partTypeId: 'pt-1',
                partTypeCode: 'DISCURSO',
                partTypeLabel: 'Discurso',
                title: 'Discurso',
                sortOrder: 1,
                topic: PartTopic.TREASURES,
                countsAsMinistryPractice: false,
                deletable: false,
                slots: [
                  {
                    id: 'slot-1',
                    role: AssignmentRole.TITULAR,
                    participantId: 'p-1',
                    participantName: 'Maria',
                    participantPhone: '11999999999',
                  },
                ],
              },
            ],
          },
        ],
      });

      const result = await service.getCurrentMonth(new Date(2026, 8, 18));

      expect(scheduleService.getMonth).toHaveBeenCalledWith('2026-09');
      expect(result).toMatchObject({
        scope: 'current-month',
        title: 'Este mês',
        yearMonth: '2026-09',
        weeks: [
          {
            meetingDate: '2026-09-18',
            parts: [
              {
                slots: [{ participantName: 'Maria', roleLabel: 'Titular' }],
              },
            ],
          },
        ],
      });
      expect(JSON.stringify(result)).not.toContain('participantPhone');
    });

    it('throws NotFoundException when current-month link is disabled', async () => {
      settingsService.get.mockResolvedValue({
        ...enabledSettings,
        publicLinkCurrentMonthEnabled: false,
      });

      await expect(service.getCurrentMonth()).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(scheduleService.getMonth).not.toHaveBeenCalled();
    });
  });

  describe('getNextMonth', () => {
    it('delegates to ScheduleService.getMonth for the next civil month', async () => {
      scheduleService.getMonth.mockResolvedValue({
        id: 'month-2',
        yearMonth: '2026-10',
        year: 2026,
        month: 10,
        bimester: { id: 'b1', year: 2026, index: 5 },
        complete: true,
        weeks: [],
      });

      const result = await service.getNextMonth(new Date(2026, 8, 18));

      expect(scheduleService.getMonth).toHaveBeenCalledWith('2026-10');
      expect(result.scope).toBe('next-month');
      expect(result.title).toBe('Próximo mês');
      expect(result.yearMonth).toBe('2026-10');
    });

    it('throws NotFoundException when next-month link is disabled', async () => {
      settingsService.get.mockResolvedValue({
        ...enabledSettings,
        publicLinkNextMonthEnabled: false,
      });

      await expect(service.getNextMonth()).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('toPublicWeekView', () => {
    it('omits phone and internal ids from mapped slots', () => {
      const view = service.toPublicWeekView({
        weekStartDate: new Date('2026-09-14T00:00:00.000Z'),
        meetingDate: new Date('2026-09-18T00:00:00.000Z'),
        parts: [
          {
            title: 'Oração',
            sortOrder: 1,
            topic: PartTopic.OUT_OF_TOPIC,
            partType: { label: 'Oração inicial' },
            slots: [
              {
                id: 'slot-internal',
                role: AssignmentRole.TITULAR,
                participantId: 'participant-internal',
                participant: { name: 'Ana', phone: '11888888888' },
              },
            ],
          },
        ],
      } as never);

      expect(view.parts[0].slots[0]).toEqual({
        role: AssignmentRole.TITULAR,
        roleLabel: 'Titular',
        participantName: 'Ana',
      });
      expect(JSON.stringify(view)).not.toContain('phone');
      expect(JSON.stringify(view)).not.toContain('participantId');
      expect(JSON.stringify(view)).not.toContain('slot-internal');
    });
  });
});
