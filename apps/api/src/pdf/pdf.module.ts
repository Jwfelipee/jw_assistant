import { Module } from '@nestjs/common';
import { ScheduleModule } from '../schedule/schedule.module';
import { SettingsModule } from '../settings/settings.module';
import { S140PdfController } from './s140-pdf.controller';
import { S140PdfService } from './s140-pdf.service';

@Module({
  imports: [ScheduleModule, SettingsModule],
  controllers: [S140PdfController],
  providers: [S140PdfService],
  exports: [S140PdfService],
})
export class PdfModule {}
