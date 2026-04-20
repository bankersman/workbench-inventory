import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createCanvas, loadImage } from 'canvas';
import * as bwipjs from 'bwip-js';
import { Repository } from 'typeorm';

import { Container } from '../entities/container.entity';
import { Project } from '../entities/project.entity';
import { StorageUnit } from '../entities/storage-unit.entity';
import type { PreviewLabelDto } from './dto/preview-label.dto';

const COMMAND_CODES = [
  'CMD:TAKE',
  'CMD:ADD',
  'CMD:PULL',
  'CMD:MOVE',
  'CMD:NEW',
  'CMD:CONFIRM',
  'CMD:CANCEL',
  'QTY:1',
  'QTY:2',
  'QTY:3',
  'QTY:4',
  'QTY:5',
  'QTY:10',
  'QTY:20',
  'QTY:50',
  'QTY:100',
];

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Container)
    private readonly containerRepository: Repository<Container>,
    @InjectRepository(StorageUnit)
    private readonly storageUnitRepository: Repository<StorageUnit>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  static commandCodes(): readonly string[] {
    return COMMAND_CODES;
  }

  async renderBarcodePng(text: string): Promise<Buffer> {
    const t = text.trim();
    if (!t || t.length > 120) {
      throw new BadRequestException('Invalid barcode text');
    }
    return bwipjs.toBuffer({
      bcid: 'code128',
      text: t,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: 'center',
    });
  }

  async renderLabelPng(dto: PreviewLabelDto): Promise<Buffer> {
    const template = dto.template ?? 'bin-standard';
    if (dto.entityType === 'container') {
      return this.renderContainer(dto.entityId, template);
    }
    if (dto.entityType === 'storage-unit') {
      return this.renderStorageUnit(dto.entityId, template);
    }
    return this.renderProject(dto.entityId, template);
  }

  commandSheetHtml(apiPrefix = '/api'): string {
    const rows = COMMAND_CODES.map((code) => {
      const src = `${apiPrefix}/labels/barcode.png?text=${encodeURIComponent(code)}`;
      return `<section class="cmd"><img alt="${escapeHtml(code)}" src="${src}" /><div>${escapeHtml(
        code,
      )}</div></section>`;
    }).join('\n');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Command sheet</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 1rem; background: #111; color: #eee; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
  .cmd { text-align: center; }
  img { max-width: 100%; height: auto; background: #fff; padding: 8px; border-radius: 4px; }
  @media print { body { background: #fff; color: #000; } }
</style>
</head>
<body>
<h1>Workbench command codes</h1>
<p>Print from the browser (A4). Scanner/touch use the same strings.</p>
<div class="grid">
${rows}
</div>
</body>
</html>`;
  }

  private async renderContainer(id: number, template: string): Promise<Buffer> {
    const container = await this.containerRepository.findOne({
      where: { id },
      relations: ['storageUnit'],
    });
    if (!container) {
      throw new NotFoundException(`Container ${id} not found`);
    }
    let path = '';
    if (container.storageUnitId) {
      path = await this.storageUnitPath(container.storageUnitId);
    }
    const title = container.name;
    const subtitle = path || null;
    const compact = template === 'bin-compact';
    return this.composePng(title, subtitle, container.barcode, compact);
  }

  private async renderStorageUnit(id: number, _template: string): Promise<Buffer> {
    const su = await this.storageUnitRepository.findOne({ where: { id } });
    if (!su) {
      throw new NotFoundException(`Storage unit ${id} not found`);
    }
    const path = await this.storageUnitPath(id);
    return this.composePng(su.name, path, su.barcode, false);
  }

  private async renderProject(id: number, _template: string): Promise<Buffer> {
    const p = await this.projectRepository.findOne({ where: { id } });
    if (!p) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    const barcode = `PRJ:${p.id}`;
    return this.composePng(p.name, `Status: ${p.status}`, barcode, false);
  }

  private async storageUnitPath(id: number): Promise<string> {
    const parts: string[] = [];
    let cur: StorageUnit | null = await this.storageUnitRepository.findOne({ where: { id } });
    const guard = new Set<number>();
    while (cur) {
      if (guard.has(cur.id)) {
        break;
      }
      guard.add(cur.id);
      parts.push(cur.name);
      if (cur.parentId == null) {
        break;
      }
      cur = await this.storageUnitRepository.findOne({ where: { id: cur.parentId } });
    }
    return parts.reverse().join(' → ');
  }

  private async composePng(
    title: string,
    subtitle: string | null,
    barcode: string,
    compact: boolean,
  ): Promise<Buffer> {
    const width = compact ? 560 : 720;
    const height = compact ? 220 : 360;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#111111';
    ctx.font = compact ? '20px sans-serif' : '26px sans-serif';
    ctx.fillText(title.slice(0, 80), 16, compact ? 32 : 40);
    if (subtitle) {
      ctx.font = compact ? '14px sans-serif' : '18px sans-serif';
      ctx.fillText(subtitle.slice(0, 120), 16, compact ? 56 : 72);
    }
    const bc = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcode,
      scale: compact ? 2 : 3,
      height: compact ? 10 : 12,
      includetext: true,
      textxalign: 'center',
    });
    const img = await loadImage(bc);
    const bx = 16;
    const by = compact ? 72 : 96;
    const maxW = width - 32;
    const scale = Math.min(1, maxW / img.width);
    ctx.drawImage(img, bx, by, img.width * scale, img.height * scale);
    return canvas.toBuffer('image/png');
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
