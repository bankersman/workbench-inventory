import { Body, Controller, Post } from '@nestjs/common';

import { ResolveScanDto } from './dto/resolve-scan.dto';
import { ScanResolveResult, ScanResolveService } from './scan-resolve.service';

@Controller('scan')
export class ScanResolveController {
  constructor(private readonly scanResolveService: ScanResolveService) {}

  @Post('resolve')
  resolve(@Body() dto: ResolveScanDto): Promise<ScanResolveResult> {
    return this.scanResolveService.resolve(dto.value);
  }
}
