import { Module } from '@nestjs/common';
import { ScheduleModule } from '../schedule/schedule.module';
import { SettingsModule } from '../settings/settings.module';
import { PublicScheduleController } from './public-schedule.controller';
import { PublicScheduleService } from './public-schedule.service';

@Module({
  imports: [SettingsModule, ScheduleModule],
  controllers: [PublicScheduleController],
  providers: [PublicScheduleService],
})
export class PublicScheduleModule {}
