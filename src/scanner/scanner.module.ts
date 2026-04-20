import { Module } from '@nestjs/common';

import { ScannerController } from './scanner.controller';
import { ScannerGateway } from './scanner.gateway';
import { ScannerService } from './scanner.service';

@Module({
  controllers: [ScannerController],
  providers: [ScannerService, ScannerGateway],
  exports: [ScannerService],
})
export class ScannerModule {}
