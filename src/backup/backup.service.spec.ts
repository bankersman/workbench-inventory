import { BackupService } from './backup.service';
import type { SettingsService } from '../settings/settings.service';

describe('BackupService', () => {
  it('backupsDirectory is under cwd', () => {
    const settings = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as SettingsService;
    const svc = new BackupService(settings);
    expect(svc.backupsDirectory()).toContain('backups');
  });
});
