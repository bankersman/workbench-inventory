import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsArray()
  attributes?: unknown[]; // validated in service via assertValidCategoryAttributes
}
