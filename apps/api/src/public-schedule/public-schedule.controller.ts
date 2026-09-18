import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PublicScheduleService } from './public-schedule.service';

@Controller('public/schedule')
export class PublicScheduleController {
  constructor(private readonly publicScheduleService: PublicScheduleService) {}

  @Public()
  @Get('esta-semana')
  @Header('Cache-Control', 'public, max-age=60')
  currentWeek() {
    return this.publicScheduleService.getCurrentWeek();
  }

  @Public()
  @Get('proxima-semana')
  @Header('Cache-Control', 'public, max-age=60')
  nextWeek() {
    return this.publicScheduleService.getNextWeek();
  }

  @Public()
  @Get('este-mes')
  @Header('Cache-Control', 'public, max-age=60')
  currentMonth() {
    return this.publicScheduleService.getCurrentMonth();
  }

  @Public()
  @Get('proximo-mes')
  @Header('Cache-Control', 'public, max-age=60')
  nextMonth() {
    return this.publicScheduleService.getNextMonth();
  }
}
