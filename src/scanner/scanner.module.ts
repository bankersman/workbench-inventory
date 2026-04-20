import { Module } from '@nestjs/common';

import { ScannerGateway } from './scanner.gateway';
import { ScannerService } from './scanner.service';

@Module({
  providers: [ScannerService, ScannerGateway],
  exports: [ScannerService],
})
export class ScannerModule {}
