import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateBomLineDto } from './dto/create-bom-line.dto';
import { BomConfirmDto } from './dto/bom-confirm.dto';
import { BomPreviewDto } from './dto/bom-preview.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateBomLineDto } from './dto/update-bom-line.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { BomImportService } from './bom-import.service';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly bomImportService: BomImportService,
  ) {}

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.projectService.remove(id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async complete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.projectService.completeProject(id);
  }

  @Get(':id/bom')
  listBom(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.listBom(id);
  }

  @Get(':id/bom/availability')
  bomAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.bomLinesWithAvailability(id);
  }

  @Post(':id/bom')
  addBomLine(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateBomLineDto) {
    return this.projectService.addBomLine(id, dto);
  }

  @Patch(':id/bom/:lineId')
  updateBomLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineId', ParseIntPipe) lineId: number,
    @Body() dto: UpdateBomLineDto,
  ) {
    return this.projectService.updateBomLine(id, lineId, dto);
  }

  @Delete(':id/bom/:lineId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBomLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineId', ParseIntPipe) lineId: number,
  ): Promise<void> {
    await this.projectService.removeBomLine(id, lineId);
  }

  @Post(':id/bom/preview-import')
  async previewImport(@Param('id', ParseIntPipe) projectId: number, @Body() dto: BomPreviewDto) {
    await this.projectService.findOne(projectId);
    return this.bomImportService.previewCsv(dto.csv);
  }

  @Post(':id/bom/confirm-import')
  async confirmImport(@Param('id', ParseIntPipe) projectId: number, @Body() dto: BomConfirmDto) {
    await this.projectService.findOne(projectId);
    for (const line of dto.lines) {
      await this.projectService.addBomLine(projectId, {
        itemId: line.itemId,
        quantityRequired: line.quantityRequired,
        notes: line.notes ?? null,
      });
    }
    return { ok: true, inserted: dto.lines.length };
  }

  @Get(':id/export/bom.csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="bom.csv"')
  exportBom(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.projectService.exportBomCsv(id);
  }

  @Get(':id/export/missing.csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="missing.csv"')
  exportMissing(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.projectService.exportMissingCsv(id);
  }
}
