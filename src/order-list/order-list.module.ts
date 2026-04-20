import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BOMLine } from '../entities/bom-line.entity';
import { Item } from '../entities/item.entity';
import { Project } from '../entities/project.entity';
import { SupplierData } from '../entities/supplier-data.entity';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { OrderListController } from './order-list.controller';
import { OrderListService } from './order-list.service';

@Module({
  imports: [TypeOrmModule.forFeature([Item, BOMLine, Project, SupplierData]), SuppliersModule],
  controllers: [OrderListController],
  providers: [OrderListService],
  exports: [OrderListService],
})
export class OrderListModule {}
