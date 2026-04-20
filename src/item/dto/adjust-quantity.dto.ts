import { IsInt, IsString, MinLength } from 'class-validator';

export class AdjustQuantityDto {
  @IsInt()
  delta!: number;

  @IsString()
  @MinLength(1)
  reason!: string;
}
