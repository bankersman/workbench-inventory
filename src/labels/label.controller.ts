import { Body, Controller, Get, Header, Post, Query, StreamableFile } from '@nestjs/common';

import { BrotherQlService } from './brother-ql.service';
import { PreviewLabelDto } from './dto/preview-label.dto';
import { LabelService } from './label.service';

@Controller('labels')
export class LabelController {
  constructor(
    private readonly labelService: LabelService,
    private readonly brotherQlService: BrotherQlService,
  ) {}

  @Get('barcode.png')
  async barcode(@Query('text') text: string): Promise<StreamableFile> {
    const buf = await this.labelService.renderBarcodePng(text ?? '');
    return new StreamableFile(buf, { type: 'image/png' });
  }

  @Get('command-sheet')
  @Header('Content-Type', 'text/html; charset=utf-8')
  commandSheet(): string {
    return this.labelService.commandSheetHtml();
  }

  @Post('preview')
  async preview(@Body() dto: PreviewLabelDto): Promise<StreamableFile> {
    const buf = await this.labelService.renderLabelPng(dto);
    return new StreamableFile(buf, {
      type: 'image/png',
      disposition: 'inline; filename="label.png"',
    });
  }

  @Post('print')
  async print(@Body() dto: PreviewLabelDto): Promise<{ ok: true }> {
    const buf = await this.labelService.renderLabelPng(dto);
    await this.brotherQlService.printPng(buf);
    return { ok: true };
  }

  @Get('printer-status')
  async printerStatus() {
    return this.brotherQlService.getStatus();
  }
}
