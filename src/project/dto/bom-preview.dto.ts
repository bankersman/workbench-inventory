import { IsString, MinLength } from 'class-validator';

export class BomPreviewDto {
  @IsString()
  @MinLength(1)
  csv!: string;
}
