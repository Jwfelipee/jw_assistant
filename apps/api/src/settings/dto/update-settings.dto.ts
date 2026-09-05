import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Weekday } from '@jw/shared';

export class UpdateSettingsDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da congregação não pode ser vazio' })
  @MaxLength(200)
  congregationName!: string;

  @IsEnum(Weekday, { message: 'Dia da reunião inválido' })
  meetingWeekday!: Weekday;
}
