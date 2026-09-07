import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderWeekPartsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'orderedPartIds deve conter ao menos um id' })
  @IsString({ each: true })
  orderedPartIds!: string[];
}
