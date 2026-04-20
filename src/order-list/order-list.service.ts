import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { BOMLine } from '../entities/bom-line.entity';
import { Item } from '../entities/item.entity';
import { Project, ProjectStatus } from '../entities/project.entity';
import { SupplierData } from '../entities/supplier-data.entity';

const GAP_STATUSES: ProjectStatus[] = [
  ProjectStatus.Draft,
  ProjectStatus.Active,
  ProjectStatus.Hibernating,
];

export type OrderListReason = 'low_stock' | 'project_gap';

export interface OrderListProjectGap {
  projectId: number;
  projectName: string;
  stillNeeded: number;
}

export interface OrderListEntry {
  itemId: number;
  itemName: string;
  quantity: number;
  minQty: number | null;
  reorderQty: number | null;
  reasons: OrderListReason[];
  projectGaps: OrderListProjectGap[];
  suggestedQty: number;
  preferredSupplier: {
    supplier: string;
    supplierSku: string | null;
    url: string | null;
    unitPrice: number | null;
    currency: string;
    lastFetched: number | null;
  } | null;
  /** For shopping list export (pipe-delimited). */
  mouserSku: string | null;
  tmeSku: string | null;
}

@Injectable()
export class OrderListService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(BOMLine)
    private readonly bomLineRepository: Repository<BOMLine>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(SupplierData)
    private readonly supplierDataRepository: Repository<SupplierData>,
  ) {}

  async list(): Promise<OrderListEntry[]> {
    const items = await this.itemRepository.find({ relations: ['container'] });
    const byId = new Map<number, Item>();
    for (const it of items) {
      byId.set(it.id, it);
    }

    const lowStockIds = new Set<number>();
    for (const it of items) {
      if (it.minQty != null && it.quantity < it.minQty) {
        lowStockIds.add(it.id);
      }
    }

    const gapProjectIds = await this.projectIdsForGaps();
    const bomLines =
      gapProjectIds.length === 0
        ? []
        : await this.bomLineRepository.find({
            where: { projectId: In(gapProjectIds) },
            relations: ['item', 'project'],
            order: { id: 'ASC' },
          });

    const gapByItem = new Map<number, OrderListProjectGap[]>();
    for (const line of bomLines) {
      if (!line.project || !GAP_STATUSES.includes(line.project.status as ProjectStatus)) {
        continue;
      }
      const stillNeeded = line.quantityRequired - line.quantityPulled - line.quantityInstalled;
      if (stillNeeded <= 0) {
        continue;
      }
      const arr = gapByItem.get(line.itemId) ?? [];
      arr.push({
        projectId: line.project.id,
        projectName: line.project.name,
        stillNeeded,
      });
      gapByItem.set(line.itemId, arr);
    }

    const unionIds = new Set<number>([...lowStockIds, ...gapByItem.keys()]);
    const supplierRows =
      unionIds.size === 0
        ? []
        : await this.supplierDataRepository.find({
            where: { itemId: In([...unionIds]) },
            order: { preferred: 'DESC', id: 'ASC' },
          });
    const suppliersByItem = new Map<number, SupplierData[]>();
    for (const s of supplierRows) {
      const arr = suppliersByItem.get(s.itemId) ?? [];
      arr.push(s);
      suppliersByItem.set(s.itemId, arr);
    }

    const out: OrderListEntry[] = [];

    for (const itemId of unionIds) {
      const item = byId.get(itemId);
      if (!item) {
        continue;
      }
      const reasons: OrderListReason[] = [];
      if (lowStockIds.has(itemId)) {
        reasons.push('low_stock');
      }
      if (gapByItem.has(itemId)) {
        reasons.push('project_gap');
      }

      const projectGaps = gapByItem.get(itemId) ?? [];
      const gapSum = projectGaps.reduce((s, g) => s + g.stillNeeded, 0);
      let lowShortage = 0;
      if (item.minQty != null && item.quantity < item.minQty) {
        lowShortage = item.minQty - item.quantity;
      }
      const base = Math.max(gapSum, lowShortage, item.reorderQty ?? 0);
      const suggestedQty = Math.max(1, base);

      const suppliers = suppliersByItem.get(itemId) ?? [];
      const preferred = suppliers.find((s) => s.preferred) ?? suppliers[0] ?? null;
      const mouserSku =
        suppliers.find((s) => s.supplier.trim().toLowerCase().includes('mouser'))?.supplierSku ??
        null;
      const tmeSku =
        suppliers.find((s) => s.supplier.trim().toLowerCase() === 'tme')?.supplierSku ?? null;

      out.push({
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        minQty: item.minQty,
        reorderQty: item.reorderQty,
        reasons,
        projectGaps,
        suggestedQty,
        preferredSupplier: preferred
          ? {
              supplier: preferred.supplier,
              supplierSku: preferred.supplierSku,
              url: preferred.url,
              unitPrice: preferred.unitPrice,
              currency: preferred.currency,
              lastFetched: preferred.lastFetched,
            }
          : null,
        mouserSku,
        tmeSku,
      });
    }

    out.sort((a, b) => a.itemName.localeCompare(b.itemName));
    return out;
  }

  private async projectIdsForGaps(): Promise<number[]> {
    const projects = await this.projectRepository.find({
      where: { status: In(GAP_STATUSES) },
      select: ['id'],
    });
    return projects.map((p) => p.id);
  }
}
