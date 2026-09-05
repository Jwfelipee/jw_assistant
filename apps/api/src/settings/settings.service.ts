import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, type Weekday } from '@jw/database';
import type { UpdateSettingsDto } from './dto/update-settings.dto';

export type SettingsResponse = {
  congregationName: string;
  meetingWeekday: Weekday;
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

    return this.toResponse(settings.name, settings.meetingWeekday);
  }

  async update(dto: UpdateSettingsDto): Promise<SettingsResponse> {
    const existing = await prisma.congregationSettings.findUnique({
      where: { id: 1 },
    });

    if (!existing) {
      throw new NotFoundException('Configurações da congregação não encontradas');
    }

    const updated = await prisma.congregationSettings.update({
      where: { id: 1 },
      data: {
        name: dto.congregationName.trim(),
        meetingWeekday: dto.meetingWeekday,
      },
    });

    return this.toResponse(updated.name, updated.meetingWeekday);
  }

  private toResponse(
    name: string,
    meetingWeekday: Weekday,
  ): SettingsResponse {
    return {
      congregationName: name,
      meetingWeekday,
    };
  }
}
