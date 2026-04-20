import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): string {
    return this.appService.getRootMessage();
  }

  @Get('health')
  getHealth(): { ok: true; version: string } {
    return { ok: true, version: this.appService.getAppVersion() };
  }
}
