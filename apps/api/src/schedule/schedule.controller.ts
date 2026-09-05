import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AssignmentRole } from '@jw/shared';
import { AddWeekPartDto } from './dto/add-week-part.dto';
import { AssignSlotDto } from './dto/assign-slot.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { UpdateWeekPartDto } from './dto/update-week-part.dto';
import { ScheduleService } from './schedule.service';

@Controller()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('schedule/months/:yearMonth/ensure')
  ensureMonth(@Param('yearMonth') yearMonth: string) {
    return this.scheduleService.ensureMonth(yearMonth);
  }

  @Get('schedule/months/:yearMonth')
  getMonth(@Param('yearMonth') yearMonth: string) {
    return this.scheduleService.getMonth(yearMonth);
  }

  @Get('schedule/next-month')
  nextMonth() {
    return this.scheduleService.nextMonthHelper();
  }

  @Post('schedule/weeks/:weekId/parts')
  addPart(@Param('weekId') weekId: string, @Body() dto: AddWeekPartDto) {
    return this.scheduleService.addWeekPart(weekId, dto);
  }

  @Delete('schedule/parts/:partId')
  @HttpCode(200)
  removePart(@Param('partId') partId: string) {
    return this.scheduleService.removeWeekPart(partId);
  }

  @Patch('schedule/parts/:partId')
  updatePart(
    @Param('partId') partId: string,
    @Body() dto: UpdateWeekPartDto,
  ) {
    return this.scheduleService.updateWeekPartTitle(partId, dto);
  }

  @Put('slots/:id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignSlotDto) {
    return this.scheduleService.assignSlot(id, dto);
  }

  @Delete('slots/:id/assign')
  @HttpCode(200)
  unassign(@Param('id') id: string) {
    return this.scheduleService.unassignSlot(id);
  }

  @Get('parts/:id/suggest')
  suggest(
    @Param('id') id: string,
    @Query('role', new ParseEnumPipe(AssignmentRole)) role: AssignmentRole,
    @Query('excludeParticipantId') excludeParticipantId?: string,
  ) {
    return this.scheduleService.suggestForPart(id, role, excludeParticipantId);
  }

  @Get('slots/:id/eligible-participants')
  eligibleParticipants(@Param('id') id: string) {
    return this.scheduleService.getEligibleParticipants(id);
  }

  @Get('assignments/history')
  history(@Query() query: HistoryQueryDto) {
    return this.scheduleService.history(query);
  }
}
