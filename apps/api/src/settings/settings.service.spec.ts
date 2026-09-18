import { NotFoundException } from '@nestjs/common';
import { prisma } from '@jw/database';
import { SettingsService } from './settings.service';

jest.mock('@jw/database', () => {
  const actual = jest.requireActual('@jw/database');
  return {
    ...actual,
    prisma: {
      congregationSettings: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('SettingsService', () => {
  const service = new SettingsService();

  const existingSettings = {
    id: 1,
    name: 'Congregação Centro',
    meetingWeekday: 'THURSDAY' as const,
    publicLinkCurrentWeekEnabled: true,
    publicLinkNextWeekEnabled: true,
    publicLinkCurrentMonthEnabled: true,
    publicLinkNextMonthEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('returns all settings including public link flags', async () => {
      mockedPrisma.congregationSettings.findUnique.mockResolvedValue(
        existingSettings,
      );

      const result = await service.get();

      expect(result).toEqual({
        congregationName: 'Congregação Centro',
        meetingWeekday: 'THURSDAY',
        publicLinkCurrentWeekEnabled: true,
        publicLinkNextWeekEnabled: true,
        publicLinkCurrentMonthEnabled: true,
        publicLinkNextMonthEnabled: true,
      });
    });

    it('throws when settings are missing', async () => {
      mockedPrisma.congregationSettings.findUnique.mockResolvedValue(null);

      await expect(service.get()).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('persists a single public link toggle without congregation name', async () => {
      mockedPrisma.congregationSettings.findUnique.mockResolvedValue(
        existingSettings,
      );
      mockedPrisma.congregationSettings.update.mockResolvedValue({
        ...existingSettings,
        publicLinkCurrentWeekEnabled: false,
      });

      const result = await service.update({
        publicLinkCurrentWeekEnabled: false,
      });

      expect(mockedPrisma.congregationSettings.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { publicLinkCurrentWeekEnabled: false },
      });
      expect(result.publicLinkCurrentWeekEnabled).toBe(false);
      expect(result.congregationName).toBe('Congregação Centro');
    });

    it('updates congregation name and weekday when provided', async () => {
      mockedPrisma.congregationSettings.findUnique.mockResolvedValue(
        existingSettings,
      );
      mockedPrisma.congregationSettings.update.mockResolvedValue({
        ...existingSettings,
        name: 'Nova Congregação',
        meetingWeekday: 'WEDNESDAY',
      });

      const result = await service.update({
        congregationName: 'Nova Congregação',
        meetingWeekday: 'WEDNESDAY',
      });

      expect(mockedPrisma.congregationSettings.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Nova Congregação',
          meetingWeekday: 'WEDNESDAY',
        },
      });
      expect(result.congregationName).toBe('Nova Congregação');
      expect(result.meetingWeekday).toBe('WEDNESDAY');
    });
  });
});
