import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AbsencesModule } from './absences/absences.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { AuthGuard } from './common/guards/auth.guard';
import { ParticipantsModule } from './participants/participants.module';
import { PdfModule } from './pdf/pdf.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(__dirname, '../../../.env'),
        resolve(process.cwd(), '../../.env'),
        resolve(process.cwd(), '.env'),
      ],
    }),
    AuthModule,
    SettingsModule,
    ParticipantsModule,
    AbsencesModule,
    CatalogModule,
    ScheduleModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
