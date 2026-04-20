import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AvailabilityModule } from './availability/availability.module';
import { CategoryModule } from './category/category.module';
import { ContainerModule } from './container/container.module';
import { DatabaseModule } from './database/database.module';
import { ItemModule } from './item/item.module';
import { ScanModule } from './scan/scan.module';
import { ScannerModule } from './scanner/scanner.module';
import { StorageUnitModule } from './storage-unit/storage-unit.module';

const frontendDist = join(__dirname, 'frontend');

@Module({
  imports: [
    DatabaseModule,
    StorageUnitModule,
    ContainerModule,
    ItemModule,
    CategoryModule,
    ScanModule,
    AvailabilityModule,
    ScannerModule,
    ...(existsSync(frontendDist)
      ? [
          ServeStaticModule.forRoot({
            rootPath: frontendDist,
            exclude: ['/api*'],
          }),
        ]
      : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
