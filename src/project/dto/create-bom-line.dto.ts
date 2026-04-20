import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBomLineDto {
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
