import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContainerModule } from './container/container.module';
import { DatabaseModule } from './database/database.module';
import { ItemModule } from './item/item.module';
import { StorageUnitModule } from './storage-unit/storage-unit.module';

const frontendDist = join(__dirname, 'frontend');

@Module({
  imports: [
    DatabaseModule,
    StorageUnitModule,
    ContainerModule,
    ItemModule,
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
