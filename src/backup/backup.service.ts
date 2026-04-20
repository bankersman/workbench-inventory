import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { resolveDatabasePath } from '../database/database-path';
import { SettingsService } from '../settings/settings.service';

const LAST_BACKUP_KEY = 'last_backup';
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private readonly settingsService: SettingsService) {}

  backupsDirectory(): string {
    return join(process.cwd(), 'backups');
  }

  async getLastBackupIso(): Promise<string | null> {
    return this.settingsService.get(LAST_BACKUP_KEY);
  }

  async runBackup(): Promise<{ destPath: string }> {
    const dbPath = resolveDatabasePath();
    if (!existsSync(dbPath)) {
      throw new ServiceUnavailableException(`Database file missing: ${dbPath}`);
    }
    const dir = this.backupsDirectory();
    await mkdir(dir, { recursive: true });
    const stamp = BackupService.formatStamp(new Date());
    const destPath = join(dir, `inventory_${stamp}.db`);
    await copyFile(dbPath, destPath);
    await this.settingsService.set(LAST_BACKUP_KEY, new Date().toISOString());
    await this.pruneOldBackups(dir);
    this.syncNas(dir);
    this.logger.log(`Backup written to ${destPath}`);
    return { destPath };
  }

  private static formatStamp(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }

  private async pruneOldBackups(dir: string): Promise<void> {
    let names: string[];
    try {
      names = await readdir(dir);
    } catch {
      return;
    }
    const now = Date.now();
    for (const name of names) {
      if (!/^inventory_\d{8}\.db$/u.test(name)) {
        continue;
      }
      const full = join(dir, name);
      try {
        const s = await stat(full);
        if (now - s.mtimeMs > RETENTION_MS) {
          await unlink(full);
          this.logger.log(`Pruned old backup ${name}`);
        }
      } catch {
        /* ignore */
      }
    }
  }

  private syncNas(backupDir: string): void {
    const nas = process.env.NAS_PATH?.trim();
    if (!nas) {
      return;
    }
    const r = spawnSync('rsync', ['-a', `${backupDir}/`, nas], { encoding: 'utf8' });
    if (r.status !== 0) {
      this.logger.warn(`rsync to NAS failed: ${r.stderr || r.error || r.status}`);
    }
  }

  databasePathForDownload(): string {
    return resolveDatabasePath();
  }
}
