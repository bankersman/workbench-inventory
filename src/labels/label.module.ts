import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Container } from '../entities/container.entity';
import { Project } from '../entities/project.entity';
import { StorageUnit } from '../entities/storage-unit.entity';
import { BrotherQlService } from './brother-ql.service';
import { LabelController } from './label.controller';
import { LabelService } from './label.service';

@Module({
  imports: [TypeOrmModule.forFeature([Container, StorageUnit, Project])],
  controllers: [LabelController],
  providers: [LabelService, BrotherQlService],
  exports: [LabelService, BrotherQlService],
})
export class LabelModule {}
