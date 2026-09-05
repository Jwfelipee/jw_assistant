import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateAbsenceDto {
  @IsDateString({}, { message: 'Data de início inválida' })
  startsOn!: string;

  /** Omit or null for open-ended absence. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsDateString({}, { message: 'Data de fim inválida' })
  endsOn?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  justification?: string;
}
