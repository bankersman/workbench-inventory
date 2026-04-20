import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { ProjectStatus } from '../../entities/project.entity';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(ProjectStatus)
  status!: ProjectStatus;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
