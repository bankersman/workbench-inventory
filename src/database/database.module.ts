import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseInitService } from './database-init.service';

export function resolveDatabasePath(): string {
  const raw = process.env.DB_PATH;
  if (raw && raw.trim().length > 0) {
    return raw.trim();
  }
  return `${process.cwd()}/data/inventory.db`;
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const database = resolveDatabasePath();
        mkdirSync(dirname(database), { recursive: true });
        return {
          type: 'better-sqlite3' as const,
          database,
          entities: [],
          synchronize: false,
          logging: false,
        };
      },
    }),
  ],
  providers: [DatabaseInitService],
})
export class DatabaseModule {}
