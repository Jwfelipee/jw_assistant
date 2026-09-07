import { IsOptional, IsString } from 'class-validator';

export class MonthsQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
