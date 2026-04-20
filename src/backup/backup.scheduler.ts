import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { BackupService } from './backup.service';

@Injectable()
export class BackupScheduler {
  private readonly logger = new Logger(BackupScheduler.name);

  constructor(private readonly backupService: BackupService) {}

  @Cron('0 2 * * *')
  async nightlyBackup(): Promise<void> {
    try {
      await this.backupService.runBackup();
    } catch (e) {
      this.logger.error(`Scheduled backup failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
