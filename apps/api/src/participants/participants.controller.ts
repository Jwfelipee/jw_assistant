import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateAssociationDto } from './dto/create-association.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { ParticipantsService } from './participants.service';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get()
  list() {
    return this.participantsService.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.participantsService.getById(id);
  }

  @Get(':id/assignments')
  listAssignments(@Param('id') id: string) {
    return this.participantsService.listAssignments(id);
  }

  @Post()
  create(@Body() dto: CreateParticipantDto) {
    return this.participantsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParticipantDto) {
    return this.participantsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string) {
    return this.participantsService.remove(id);
  }

  @Post(':id/associations')
  createAssociation(
    @Param('id') id: string,
    @Body() dto: CreateAssociationDto,
  ) {
    return this.participantsService.createAssociation(id, dto);
  }

  @Delete(':id/associations/:associationId')
  @HttpCode(200)
  deleteAssociation(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
  ) {
    return this.participantsService.deleteAssociation(id, associationId);
  }
}
