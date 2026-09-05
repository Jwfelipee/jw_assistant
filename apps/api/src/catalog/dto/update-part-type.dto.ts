import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { Privilege, Sex, SlotMode } from '@jw/shared';

export class UpdatePartTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(Sex, { each: true })
  allowedSexes?: Sex[];

  @IsOptional()
  @IsEnum(SlotMode)
  slotMode?: SlotMode;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(Privilege, { each: true })
  privileges?: Privilege[];

  @IsOptional()
  @IsBoolean()
  countsAsMinistryPractice?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultSortOrder?: number;
}
