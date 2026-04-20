import 'reflect-metadata';

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { DataSource } from 'typeorm';

import { resolveDatabasePath } from './database/database-path';
import { ALL_ENTITIES } from './entities';

const database = resolveDatabasePath();
mkdirSync(dirname(database), { recursive: true });

export default new DataSource({
  type: 'better-sqlite3',
  database,
  entities: ALL_ENTITIES,
  migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
  synchronize: false,
  logging: false,
});
