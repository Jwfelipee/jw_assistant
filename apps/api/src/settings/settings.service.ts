import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, type Weekday } from '@jw/database';
import type { UpdateSettingsDto } from './dto/update-settings.dto';

export type SettingsResponse = {
  congregationName: string;
  meetingWeekday: Weekday;
  publicLinkCurrentWeekEnabled: boolean;
  publicLinkNextWeekEnabled: boolean;
  publicLinkCurrentMonthEnabled: boolean;
  publicLinkNextMonthEnabled: boolean;
};

@Injectable()
export class SettingsService {
  async get(): Promise<SettingsResponse> {
    const settings = await prisma.congregationSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      throw new NotFoundException('Configurações da congregação não encontradas');
    }

    return this.toResponse(settings);
  }

  async update(dto: UpdateSettingsDto): Promise<SettingsResponse> {
    const existing = await prisma.congregationSettings.findUnique({
      where: { id: 1 },
    });

    if (!existing) {
      throw new NotFoundException('Configurações da congregação não encontradas');
    }

    const data: {
      name?: string;
      meetingWeekday?: Weekday;
      publicLinkCurrentWeekEnabled?: boolean;
      publicLinkNextWeekEnabled?: boolean;
      publicLinkCurrentMonthEnabled?: boolean;
      publicLinkNextMonthEnabled?: boolean;
    } = {};

    if (dto.congregationName !== undefined) {
      data.name = dto.congregationName.trim();
    }
    if (dto.meetingWeekday !== undefined) {
      data.meetingWeekday = dto.meetingWeekday;
    }
    if (dto.publicLinkCurrentWeekEnabled !== undefined) {
      data.publicLinkCurrentWeekEnabled = dto.publicLinkCurrentWeekEnabled;
    }
    if (dto.publicLinkNextWeekEnabled !== undefined) {
      data.publicLinkNextWeekEnabled = dto.publicLinkNextWeekEnabled;
    }
    if (dto.publicLinkCurrentMonthEnabled !== undefined) {
      data.publicLinkCurrentMonthEnabled = dto.publicLinkCurrentMonthEnabled;
    }
    if (dto.publicLinkNextMonthEnabled !== undefined) {
      data.publicLinkNextMonthEnabled = dto.publicLinkNextMonthEnabled;
    }

    const updated = await prisma.congregationSettings.update({
      where: { id: 1 },
      data,
    });

    return this.toResponse(updated);
  }

  private toResponse(settings: {
    name: string;
    meetingWeekday: Weekday;
    publicLinkCurrentWeekEnabled: boolean;
    publicLinkNextWeekEnabled: boolean;
    publicLinkCurrentMonthEnabled: boolean;
    publicLinkNextMonthEnabled: boolean;
  }): SettingsResponse {
    return {
      congregationName: settings.name,
      meetingWeekday: settings.meetingWeekday,
      publicLinkCurrentWeekEnabled: settings.publicLinkCurrentWeekEnabled,
      publicLinkNextWeekEnabled: settings.publicLinkNextWeekEnabled,
      publicLinkCurrentMonthEnabled: settings.publicLinkCurrentMonthEnabled,
      publicLinkNextMonthEnabled: settings.publicLinkNextMonthEnabled,
    };
  }
}
