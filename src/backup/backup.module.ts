import { Module } from '@nestjs/common';

import { SettingsModule } from '../settings/settings.module';
import { BackupController } from './backup.controller';
import { BackupScheduler } from './backup.scheduler';
import { BackupService } from './backup.service';

@Module({
  imports: [SettingsModule],
  controllers: [BackupController],
  providers: [BackupService, BackupScheduler],
  exports: [BackupService],
})
export class BackupModule {}
