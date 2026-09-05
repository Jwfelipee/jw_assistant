import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AbsencesService } from './absences.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';

@Controller()
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @Get('absences/alerts')
  listAlerts() {
    return this.absencesService.listEndAlerts();
  }

  @Get('participants/:participantId/absences')
  listByParticipant(
    @Param('participantId') participantId: string,
    @Query('revealJustification', new DefaultValuePipe(false), ParseBoolPipe)
    revealJustification: boolean,
  ) {
    return this.absencesService.listByParticipant(
      participantId,
      revealJustification,
    );
  }

  @Post('participants/:participantId/absences')
  create(
    @Param('participantId') participantId: string,
    @Body() dto: CreateAbsenceDto,
  ) {
    return this.absencesService.create(participantId, dto);
  }

  @Post('absences/:id/reveal')
  reveal(@Param('id') id: string) {
    return this.absencesService.reveal(id);
  }

  @Post('absences/:id/acknowledge')
  acknowledge(@Param('id') id: string) {
    return this.absencesService.acknowledge(id);
  }

  @Post('absences/:id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.absencesService.reactivate(id);
  }
}
