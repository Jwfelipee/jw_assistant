import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Weekday } from '@jw/shared';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Nome da congregação não pode ser vazio' })
  @MaxLength(200)
  congregationName?: string;

  @IsOptional()
  @IsEnum(Weekday, { message: 'Dia da reunião inválido' })
  meetingWeekday?: Weekday;

  @IsOptional()
  @IsBoolean()
  publicLinkCurrentWeekEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  publicLinkNextWeekEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  publicLinkCurrentMonthEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  publicLinkNextMonthEnabled?: boolean;
}
