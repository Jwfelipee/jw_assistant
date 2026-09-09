import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Privilege, Sex } from '@jw/shared';

export const PARTICIPANT_COUNTER_FIELDS = [
  'presidente',
  'oracao',
  'titular',
  'dirigente',
  'ajudante',
  'ministerio',
] as const;

export type ParticipantCounterField =
  (typeof PARTICIPANT_COUNTER_FIELDS)[number];

export class ListParticipantsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsEnum(Privilege)
  privilege?: Privilege;

  @IsOptional()
  @IsIn(PARTICIPANT_COUNTER_FIELDS)
  counter?: ParticipantCounterField;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  counterMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  counterMax?: number;

  /** `any` = has associations; `none` = no associations */
  @IsOptional()
  @IsIn(['any', 'none'])
  association?: 'any' | 'none';

  /** Filter participants associated with this participant id */
  @IsOptional()
  @IsString()
  associatedWith?: string;

  @IsOptional()
  @IsIn(PARTICIPANT_COUNTER_FIELDS)
  sortCounter?: ParticipantCounterField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
