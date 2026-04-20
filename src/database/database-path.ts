/**
 * Shared DB path resolution for NestJS runtime and TypeORM CLI (migrations).
 */
export function resolveDatabasePath(): string {
  const raw = process.env.DB_PATH;
  if (raw && raw.trim().length > 0) {
    return raw.trim();
  }
  return `${process.cwd()}/data/inventory.db`;
}
