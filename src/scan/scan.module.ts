import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Container } from '../entities/container.entity';
import { Item } from '../entities/item.entity';
import { Project } from '../entities/project.entity';
import { StorageUnit } from '../entities/storage-unit.entity';
import { ScanResolveController } from './scan-resolve.controller';
import { ScanResolveService } from './scan-resolve.service';

@Module({
  imports: [TypeOrmModule.forFeature([StorageUnit, Container, Project, Item])],
  controllers: [ScanResolveController],
  providers: [ScanResolveService],
  exports: [ScanResolveService],
})
export class ScanModule {}
