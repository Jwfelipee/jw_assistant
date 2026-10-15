import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SkipWeekDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe o motivo da semana zerada.' })
  @MaxLength(500, { message: 'O motivo deve ter no máximo 500 caracteres.' })
  reason!: string;
}
