import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContainerDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  storageUnitId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number | null;
}
