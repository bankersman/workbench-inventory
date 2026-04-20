import { Controller, Get } from '@nestjs/common';

import { ScannerService } from './scanner.service';

@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Get('status')
  status() {
    return {
      enabled: this.scannerService.isEnabled(),
      connected: this.scannerService.isConnected(),
    };
  }
}
