import { Injectable } from '@nestjs/common';
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { formatYearMonth } from '@jw/shared';
import { ScheduleService } from '../schedule/schedule.service';
import { SettingsService } from '../settings/settings.service';
import { S140Document } from './s140-document';
import { buildS140DocumentData, s140Filename } from './s140-model';

export type S140PdfResult = {
  buffer: Buffer;
  filename: string;
  contentType: 'application/pdf';
};

async function readableToBuffer(
  stream: NodeJS.ReadableStream,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

@Injectable()
export class S140PdfService {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly settingsService: SettingsService,
  ) {}

  async renderMonth(yearMonth: string): Promise<S140PdfResult> {
    const [month, settings] = await Promise.all([
      this.scheduleService.getMonth(yearMonth),
      this.settingsService.get(),
    ]);

    const data = buildS140DocumentData(
      {
        yearMonth: formatYearMonth(month.year, month.month),
        weeks: month.weeks.map((week) => ({
          meetingDate: week.meetingDate,
          weekStartDate: week.weekStartDate,
          parts: week.parts.map((part) => ({
            partTypeCode: part.partTypeCode,
            partTypeLabel: part.partTypeLabel,
            title: part.title,
            sortOrder: part.sortOrder,
            topic: part.topic,
            slots: part.slots.map((slot) => ({
              role: slot.role,
              participantName: slot.participantName,
            })),
          })),
        })),
      },
      settings.congregationName,
    );

    const element = React.createElement(S140Document, { data });
    // react-pdf expects its Document root; our wrapper renders Document inside.
    const stream = await pdf(element as Parameters<typeof pdf>[0]).toBuffer();
    const buffer = await readableToBuffer(stream);

    return {
      buffer,
      filename: s140Filename(data.yearMonth),
      contentType: 'application/pdf',
    };
  }
}
