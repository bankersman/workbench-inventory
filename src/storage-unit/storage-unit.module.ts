import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Container } from '../entities';
import { StorageUnit } from '../entities/storage-unit.entity';
import { StorageUnitController } from './storage-unit.controller';
import { StorageUnitService } from './storage-unit.service';

@Module({
  imports: [TypeOrmModule.forFeature([StorageUnit, Container])],
  controllers: [StorageUnitController],
  providers: [StorageUnitService],
  exports: [StorageUnitService],
})
export class StorageUnitModule {}
