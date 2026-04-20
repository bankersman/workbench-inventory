import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number | null;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string | number | null>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minQty?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reorderQty?: number | null;

  @IsString()
  @MinLength(1)
  unit!: string;

  @IsOptional()
  @IsString()
  barcode?: string | null;

  @Type(() => Number)
  @IsInt()
  containerId!: number;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
