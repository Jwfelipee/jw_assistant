import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AssignmentRole, PartTopic, Sex } from '@jw/shared';

export enum StudyHistoryRole {
  DIRIGENTE = 'DIRIGENTE',
  LEITOR = 'LEITOR',
  BOTH = 'BOTH',
}

export class HistoryQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  participantId?: string;

  @IsOptional()
  @IsEnum(PartTopic)
  topic?: PartTopic;

  @IsOptional()
  @IsEnum(AssignmentRole)
  role?: AssignmentRole;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsString()
  partTypeId?: string;

  @IsOptional()
  @IsEnum(StudyHistoryRole)
  studyRole?: StudyHistoryRole;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  lastPerParticipant?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
