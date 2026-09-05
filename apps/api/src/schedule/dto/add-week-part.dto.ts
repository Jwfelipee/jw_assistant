import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddWeekPartDto {
  @IsString()
  @IsNotEmpty({ message: 'partTypeId é obrigatório' })
  partTypeId!: string;

  /** Optional free-text theme (Apostila theme not required). */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;
}
