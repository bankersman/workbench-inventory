import { IsString, MinLength } from 'class-validator';

export class ResolveScanDto {
  @IsString()
  @MinLength(1)
  value!: string;
}
