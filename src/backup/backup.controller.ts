import {
  Controller,
  Get,
  Header,
  Post,
  StreamableFile,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'node:fs';

import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('status')
  async status() {
    const lastBackup = await this.backupService.getLastBackupIso();
    const dbPath = this.backupService.databasePathForDownload();
    return {
      lastBackup,
      backupsDirectory: this.backupService.backupsDirectory(),
      databasePath: dbPath,
      databaseExists: existsSync(dbPath),
    };
  }

  @Post('run')
  async run() {
    return this.backupService.runBackup();
  }

  @Get('download')
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment; filename="inventory.db"')
  download(): StreamableFile {
    const path = this.backupService.databasePathForDownload();
    if (!existsSync(path)) {
      throw new ServiceUnavailableException('Database file not found');
    }
    return new StreamableFile(createReadStream(path));
  }
}
