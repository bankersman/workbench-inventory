import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Container } from '../entities/container.entity';
import { Project } from '../entities/project.entity';
import { StorageUnit } from '../entities/storage-unit.entity';
import { ContainerController } from './container.controller';
import { ContainerService } from './container.service';

@Module({
  imports: [TypeOrmModule.forFeature([Container, StorageUnit, Project])],
  controllers: [ContainerController],
  providers: [ContainerService],
  exports: [ContainerService],
})
export class ContainerModule {}
