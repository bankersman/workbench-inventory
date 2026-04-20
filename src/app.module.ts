import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AvailabilityModule } from './availability/availability.module';
import { BackupModule } from './backup/backup.module';
import { CategoryModule } from './category/category.module';
import { ContainerModule } from './container/container.module';
import { DatabaseModule } from './database/database.module';
import { ItemModule } from './item/item.module';
import { LabelModule } from './labels/label.module';
import { OrderListModule } from './order-list/order-list.module';
import { ProjectModule } from './project/project.module';
import { SettingsModule } from './settings/settings.module';
import { ScanModule } from './scan/scan.module';
import { ScannerModule } from './scanner/scanner.module';
import { StorageUnitModule } from './storage-unit/storage-unit.module';

const frontendDist = join(__dirname, 'frontend');

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    StorageUnitModule,
    ContainerModule,
    ItemModule,
    ProjectModule,
    SettingsModule,
    OrderListModule,
    LabelModule,
    BackupModule,
    CategoryModule,
    ScanModule,
    AvailabilityModule,
    ScannerModule,
    ...(existsSync(frontendDist)
      ? [
          ServeStaticModule.forRoot({
            rootPath: frontendDist,
            exclude: ['/api*'],
            // Express 5: serve index.html for client-side routes on full page load (e.g. /projects).
            renderPath: '{*any}',
          }),
        ]
      : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
