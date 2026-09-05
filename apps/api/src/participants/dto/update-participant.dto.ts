import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Privilege, RolePreference, Sex } from '@jw/shared';

export class UpdateParticipantDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  @MaxLength(200)
  name?: string;

  /** Pass `null` to clear phone; omit to leave unchanged. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @IsOptional()
  @IsEnum(Sex, { message: 'Sexo inválido' })
  sex?: Sex;

  @IsOptional()
  @IsEnum(Privilege, { message: 'Privilégio inválido' })
  privilege?: Privilege;

  @IsOptional()
  @IsEnum(RolePreference, { message: 'Preferência de papel inválida' })
  rolePreference?: RolePreference;
}
