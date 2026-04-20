import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { BOMLine } from '../entities/bom-line.entity';
import { Item } from '../entities/item.entity';
import { Project, ProjectStatus } from '../entities/project.entity';
import { AvailabilityService } from '../availability/availability.service';
import { CreateBomLineDto } from './dto/create-bom-line.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateBomLineDto } from './dto/update-bom-line.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(BOMLine)
    private readonly bomLineRepository: Repository<BOMLine>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private readonly dataSource: DataSource,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const entity = this.projectRepository.create({
      name: dto.name,
      status: dto.status,
      description: dto.description ?? null,
      createdAt: Math.floor(Date.now() / 1000),
      notes: dto.notes ?? null,
    });
    return this.projectRepository.save(entity);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Project> {
    const p = await this.projectRepository.findOne({ where: { id } });
    if (!p) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return p;
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const p = await this.findOne(id);
    if (dto.name !== undefined) {
      p.name = dto.name;
    }
    if (dto.status !== undefined) {
      p.status = dto.status;
    }
    if (dto.description !== undefined) {
      p.description = dto.description;
    }
    if (dto.notes !== undefined) {
      p.notes = dto.notes;
    }
    return this.projectRepository.save(p);
  }

  async remove(id: number): Promise<void> {
    const r = await this.projectRepository.delete(id);
    if (r.affected === 0) {
      throw new NotFoundException(`Project ${id} not found`);
    }
  }

  async listBom(projectId: number): Promise<BOMLine[]> {
    await this.findOne(projectId);
    return this.bomLineRepository.find({
      where: { projectId },
      order: { id: 'ASC' },
      relations: ['item'],
    });
  }

  async addBomLine(projectId: number, dto: CreateBomLineDto): Promise<BOMLine> {
    await this.findOne(projectId);
    const item = await this.itemRepository.findOne({ where: { id: dto.itemId } });
    if (!item) {
      throw new BadRequestException(`Item ${dto.itemId} not found`);
    }
    const line = this.bomLineRepository.create({
      projectId,
      itemId: dto.itemId,
      quantityRequired: dto.quantityRequired,
      quantityPulled: 0,
      quantityInstalled: 0,
      notes: dto.notes ?? null,
    });
    return this.bomLineRepository.save(line);
  }

  async updateBomLine(projectId: number, lineId: number, dto: UpdateBomLineDto): Promise<BOMLine> {
    await this.findOne(projectId);
    const line = await this.bomLineRepository.findOne({
      where: { id: lineId, projectId },
    });
    if (!line) {
      throw new NotFoundException(`BOM line ${lineId} not found`);
    }
    if (dto.itemId !== undefined) {
      const item = await this.itemRepository.findOne({ where: { id: dto.itemId } });
      if (!item) {
        throw new BadRequestException(`Item ${dto.itemId} not found`);
      }
      line.itemId = dto.itemId;
    }
    if (dto.quantityRequired !== undefined) {
      line.quantityRequired = dto.quantityRequired;
    }
    if (dto.quantityPulled !== undefined) {
      line.quantityPulled = dto.quantityPulled;
    }
    if (dto.quantityInstalled !== undefined) {
      line.quantityInstalled = dto.quantityInstalled;
    }
    if (dto.notes !== undefined) {
      line.notes = dto.notes;
    }
    return this.bomLineRepository.save(line);
  }

  async removeBomLine(projectId: number, lineId: number): Promise<void> {
    await this.findOne(projectId);
    const r = await this.bomLineRepository.delete({ id: lineId, projectId });
    if (r.affected === 0) {
      throw new NotFoundException(`BOM line ${lineId} not found`);
    }
  }

  /** PLAN: project completion consume flow — adjust stock and clear pulls. */
  async completeProject(projectId: number): Promise<void> {
    await this.findOne(projectId);
    await this.dataSource.transaction(async (manager) => {
      const lines = await manager.find(BOMLine, { where: { projectId } });
      for (const line of lines) {
        const item = await manager.findOne(Item, { where: { id: line.itemId } });
        if (!item) {
          continue;
        }
        const delta = line.quantityPulled - line.quantityInstalled;
        item.quantity = Math.max(0, item.quantity - delta);
        line.quantityInstalled = line.quantityRequired;
        line.quantityPulled = 0;
        await manager.save(item);
        await manager.save(line);
      }
      const proj = await manager.findOne(Project, { where: { id: projectId } });
      if (proj) {
        proj.status = ProjectStatus.Complete;
        await manager.save(proj);
      }
    });
  }

  async bomLinesWithAvailability(projectId: number) {
    const lines = await this.listBom(projectId);
    const out = [];
    for (const line of lines) {
      const avail = await this.availabilityService.getItemAvailability(line.itemId);
      const stillNeeded = line.quantityRequired - line.quantityPulled - line.quantityInstalled;
      out.push({ line, stillNeeded, itemAvailability: avail });
    }
    return out;
  }

  async exportBomCsv(projectId: number): Promise<string> {
    const lines = await this.listBom(projectId);
    const rows = ['item_name,quantity_required,quantity_pulled,quantity_installed,notes'];
    for (const line of lines) {
      const name = line.item?.name ?? '';
      const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
      rows.push(
        [
          esc(name),
          String(line.quantityRequired),
          String(line.quantityPulled),
          String(line.quantityInstalled),
          line.notes ? esc(line.notes) : '',
        ].join(','),
      );
    }
    return rows.join('\n');
  }

  async exportMissingCsv(projectId: number): Promise<string> {
    const enriched = await this.bomLinesWithAvailability(projectId);
    const rows = ['item_name,still_needed,in_warehouse,effectively_free,quantity_required'];
    for (const row of enriched) {
      if (row.stillNeeded <= 0) {
        continue;
      }
      const name = row.line.item?.name ?? '';
      const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
      rows.push(
        [
          esc(name),
          String(row.stillNeeded),
          String(row.itemAvailability.inWarehouse),
          String(row.itemAvailability.effectivelyFree),
          String(row.line.quantityRequired),
        ].join(','),
      );
    }
    return rows.join('\n');
  }
}
