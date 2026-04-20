import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class PreviewLabelDto {
  @IsIn(['container', 'storage-unit', 'project'])
  entityType!: 'container' | 'storage-unit' | 'project';

  @IsInt()
  entityId!: number;

  @IsOptional()
  @IsString()
  template?: string;
}
