import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class BomConfirmLineDto {
  @Type(() => Number)
  @IsInt()
  itemId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantityRequired!: number;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class BomConfirmDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomConfirmLineDto)
  lines!: BomConfirmLineDto[];
}
