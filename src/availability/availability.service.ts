import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BOMLine } from '../entities/bom-line.entity';
import { Item } from '../entities/item.entity';
import { Project, ProjectStatus } from '../entities/project.entity';

const PULL_STATUSES: ProjectStatus[] = [
  ProjectStatus.Draft,
  ProjectStatus.Active,
  ProjectStatus.Hibernating,
];

const RESERVED_STATUSES: ProjectStatus[] = [ProjectStatus.Draft, ProjectStatus.Active];

export interface ItemAvailability {
  itemId: number;
  quantity: number;
  /** Stock physically in warehouse for this item (PLAN: quantity minus pulled to active projects). */
  inWarehouse: number;
  /** Reserved against active/draft BOM lines (required minus installed). */
  totalReserved: number;
  effectivelyFree: number;
}

export interface ProjectLineAvailability {
  bomLineId: number;
  itemId: number;
  quantityRequired: number;
  quantityPulled: number;
  quantityInstalled: number;
  stillNeeded: number;
  itemAvailability: ItemAvailability;
}

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(BOMLine)
    private readonly bomLineRepository: Repository<BOMLine>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getItemAvailability(itemId: number): Promise<ItemAvailability> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    const pulledRow = await this.bomLineRepository
      .createQueryBuilder('bom')
      .innerJoin('bom.project', 'project')
      .where('bom.item_id = :itemId', { itemId })
      .andWhere('project.status IN (:...pullStatuses)', { pullStatuses: PULL_STATUSES })
      .select('COALESCE(SUM(bom.quantityPulled), 0)', 'sum')
      .getRawOne<{ sum: string }>();

    const reservedRow = await this.bomLineRepository
      .createQueryBuilder('bom')
      .innerJoin('bom.project', 'project')
      .where('bom.item_id = :itemId', { itemId })
      .andWhere('project.status IN (:...resStatuses)', { resStatuses: RESERVED_STATUSES })
      .select('COALESCE(SUM(bom.quantityRequired - bom.quantityInstalled), 0)', 'sum')
      .getRawOne<{ sum: string }>();

    const sumPulled = Number(pulledRow?.sum ?? 0);
    const sumReserved = Number(reservedRow?.sum ?? 0);
    const inWarehouse = item.quantity - sumPulled;
    const effectivelyFree = inWarehouse - sumReserved;

    return {
      itemId: item.id,
      quantity: item.quantity,
      inWarehouse,
      totalReserved: sumReserved,
      effectivelyFree,
    };
  }

  async getProjectAvailability(projectId: number): Promise<ProjectLineAvailability[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const lines = await this.bomLineRepository.find({
      where: { projectId },
      order: { id: 'ASC' },
    });

    const out: ProjectLineAvailability[] = [];
    for (const line of lines) {
      const itemAvailability = await this.getItemAvailability(line.itemId);
      const stillNeeded = line.quantityRequired - line.quantityPulled - line.quantityInstalled;
      out.push({
        bomLineId: line.id,
        itemId: line.itemId,
        quantityRequired: line.quantityRequired,
        quantityPulled: line.quantityPulled,
        quantityInstalled: line.quantityInstalled,
        stillNeeded,
        itemAvailability,
      });
    }
    return out;
  }
}
