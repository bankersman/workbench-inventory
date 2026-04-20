import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppSetting } from '../entities/app-setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly appSettingRepository: Repository<AppSetting>,
  ) {}

  async get(key: string): Promise<string | null> {
    const row = await this.appSettingRepository.findOne({ where: { key } });
    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.appSettingRepository.save({ key, value });
  }

  /** Prefer env (12-factor), then persisted settings. */
  getMouserApiKey(): string | null {
    return process.env.MOUSER_API_KEY?.trim() || null;
  }

  getTmeCredentials(): { token: string; secret: string } | null {
    const token = process.env.TME_APP_KEY?.trim() || null;
    const secret = process.env.TME_APP_SECRET?.trim() || null;
    if (token && secret) {
      return { token, secret };
    }
    return null;
  }
}
