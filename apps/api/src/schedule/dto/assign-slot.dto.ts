import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class AssignSlotDto {
  @IsString()
  @IsNotEmpty({ message: 'participantId é obrigatório' })
  participantId!: string;

  /** When soft alerts exist, set true to confirm assignment. */
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}
