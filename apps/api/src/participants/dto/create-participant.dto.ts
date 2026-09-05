import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Privilege, RolePreference, Sex } from '@jw/shared';

export class CreateParticipantDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsEnum(Sex, { message: 'Sexo inválido' })
  sex!: Sex;

  @IsEnum(Privilege, { message: 'Privilégio inválido' })
  privilege!: Privilege;

  @IsOptional()
  @IsEnum(RolePreference, { message: 'Preferência de papel inválida' })
  rolePreference?: RolePreference;
}
