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
import {
  PartTopic,
  Privilege,
  Sex,
  SlotMode,
} from '@jw/shared';

export class CreatePartTypeDto {
  @IsEnum(PartTopic)
  topic!: PartTopic;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(Sex, { each: true })
  allowedSexes!: Sex[];

  @IsEnum(SlotMode)
  slotMode!: SlotMode;

  /** Optional privileges; defaults derived from topic/sex when omitted. */
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
