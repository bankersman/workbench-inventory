import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ALL_ENTITIES, Category } from '../entities';
import { CategorySeedService } from './category-seed.service';
import { resolveDatabasePath } from './database-path';
import { DatabaseInitService } from './database-init.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const database = resolveDatabasePath();
        mkdirSync(dirname(database), { recursive: true });
        return {
          type: 'better-sqlite3' as const,
          database,
          entities: ALL_ENTITIES,
          migrations: [join(__dirname, '..', 'migrations', '*.js')],
          migrationsRun: true,
          synchronize: false,
          logging: false,
        };
      },
    }),
    TypeOrmModule.forFeature([Category]),
  ],
  providers: [DatabaseInitService, CategorySeedService],
})
export class DatabaseModule {}
