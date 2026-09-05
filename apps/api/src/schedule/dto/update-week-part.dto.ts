import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateWeekPartDto {
  @IsString()
  @IsNotEmpty({ message: 'title é obrigatório' })
  @MaxLength(300, { message: 'title deve ter no máximo 300 caracteres' })
  title!: string;
}
