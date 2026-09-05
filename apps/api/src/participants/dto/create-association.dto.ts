import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAssociationDto {
  @IsString()
  @IsNotEmpty({ message: 'Participante associado é obrigatório' })
  otherParticipantId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Motivo é obrigatório' })
  @MaxLength(500)
  reason!: string;
}
