import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SupplierData } from '../entities/supplier-data.entity';
import { SettingsModule } from '../settings/settings.module';
import { MouserService } from './mouser.service';
import { SupplierRefreshService } from './supplier-refresh.service';
import { TmeService } from './tme.service';

@Module({
  imports: [SettingsModule, TypeOrmModule.forFeature([SupplierData])],
  providers: [MouserService, TmeService, SupplierRefreshService],
  exports: [MouserService, TmeService, SupplierRefreshService],
})
export class SuppliersModule {}
