import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AvailabilityModule } from '../availability/availability.module';
import { BOMLine } from '../entities/bom-line.entity';
import { Item } from '../entities/item.entity';
import { Project } from '../entities/project.entity';
import { BomImportService } from './bom-import.service';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, BOMLine, Item]), AvailabilityModule],
  controllers: [ProjectController],
  providers: [ProjectService, BomImportService],
  exports: [ProjectService, BomImportService],
})
export class ProjectModule {}
