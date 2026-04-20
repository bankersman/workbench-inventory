import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Category } from '../entities/category.entity';
import { Container } from '../entities/container.entity';
import { Item } from '../entities/item.entity';
import { AdjustQuantityDto } from './dto/adjust-quantity.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

export interface ItemListQuery {
  q?: string;
  categoryId?: number;
  containerId?: number;
  storageUnitId?: number;
  /** Parsed from `attr[key]=value` query pairs. */
  attr: Record<string, string>;
}

export interface QuantityAdjustmentResult {
  item: Item;
  previousQuantity: number;
  newQuantity: number;
  delta: number;
  reason: string;
}

function assertSafeAttrKey(key: string): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    throw new BadRequestException(`Invalid attribute key: ${key}`);
  }
}

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Container)
    private readonly containerRepository: Repository<Container>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /** Parse `attr[foo]=bar` and nested `attr` object from query. */
  static parseAttrFromQuery(query: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    const nested = query.attr;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      for (const [k, v] of Object.entries(nested as Record<string, unknown>)) {
        if (v !== undefined && v !== null && String(v).length > 0) {
          out[k] = String(v);
        }
      }
    }
    for (const [k, v] of Object.entries(query)) {
      const m = /^attr\[(.+)\]$/.exec(k);
      if (m && v !== undefined && v !== null && String(v).length > 0) {
        out[m[1]] = String(v);
      }
    }
    return out;
  }

  async create(dto: CreateItemDto): Promise<Item> {
    await this.ensureContainerExists(dto.containerId);
    if (dto.categoryId != null) {
      await this.ensureCategoryExists(dto.categoryId);
    }
    if (dto.barcode != null && dto.barcode.length > 0) {
      await this.ensureBarcodeUnique(dto.barcode);
    }

    const entity = this.itemRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      categoryId: dto.categoryId ?? null,
      attributes: dto.attributes ?? {},
      quantity: dto.quantity ?? 0,
      minQty: dto.minQty ?? null,
      reorderQty: dto.reorderQty ?? null,
      unit: dto.unit,
      barcode: dto.barcode?.length ? dto.barcode : null,
      containerId: dto.containerId,
      notes: dto.notes ?? null,
    });
    return this.itemRepository.save(entity);
  }

  async findMany(query: ItemListQuery): Promise<Item[]> {
    const qb = this.buildFilteredQuery(query);
    qb.orderBy('item.id', 'ASC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['category', 'container'],
    });
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return item;
  }

  async update(id: number, dto: UpdateItemDto): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    if (dto.containerId !== undefined) {
      await this.ensureContainerExists(dto.containerId);
      item.containerId = dto.containerId;
    }
    if (dto.categoryId !== undefined) {
      if (dto.categoryId !== null) {
        await this.ensureCategoryExists(dto.categoryId);
      }
      item.categoryId = dto.categoryId;
    }
    if (dto.barcode !== undefined) {
      const next = dto.barcode?.length ? dto.barcode : null;
      if (next !== null && next !== item.barcode) {
        await this.ensureBarcodeUnique(next, id);
      }
      item.barcode = next;
    }
    if (dto.name !== undefined) {
      item.name = dto.name;
    }
    if (dto.description !== undefined) {
      item.description = dto.description;
    }
    if (dto.attributes !== undefined) {
      item.attributes = dto.attributes;
    }
    if (dto.quantity !== undefined) {
      item.quantity = dto.quantity;
    }
    if (dto.minQty !== undefined) {
      item.minQty = dto.minQty;
    }
    if (dto.reorderQty !== undefined) {
      item.reorderQty = dto.reorderQty;
    }
    if (dto.unit !== undefined) {
      item.unit = dto.unit;
    }
    if (dto.notes !== undefined) {
      item.notes = dto.notes;
    }
    return this.itemRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const result = await this.itemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Item ${id} not found`);
    }
  }

  async adjustQuantity(id: number, dto: AdjustQuantityDto): Promise<QuantityAdjustmentResult> {
    const item = await this.itemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    const previousQuantity = item.quantity;
    const newQuantity = previousQuantity + dto.delta;
    if (newQuantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }
    item.quantity = newQuantity;
    await this.itemRepository.save(item);
    return {
      item,
      previousQuantity,
      newQuantity,
      delta: dto.delta,
      reason: dto.reason,
    };
  }

  private buildFilteredQuery(query: ItemListQuery): SelectQueryBuilder<Item> {
    const qb = this.itemRepository
      .createQueryBuilder('item')
      .leftJoin('item.container', 'container');

    if (query.q != null && query.q.trim().length > 0) {
      const safe = query.q.trim().replace(/[%_]/g, '');
      const like = `%${safe}%`;
      qb.andWhere("(item.name LIKE :like OR COALESCE(item.description, '') LIKE :like)", { like });
    }
    if (query.categoryId != null) {
      qb.andWhere('item.category_id = :categoryId', { categoryId: query.categoryId });
    }
    if (query.containerId != null) {
      qb.andWhere('item.container_id = :containerId', { containerId: query.containerId });
    }
    if (query.storageUnitId != null) {
      qb.andWhere('container.storage_unit_id = :storageUnitId', {
        storageUnitId: query.storageUnitId,
      });
    }
    let i = 0;
    for (const [key, val] of Object.entries(query.attr)) {
      assertSafeAttrKey(key);
      const path = `$.${key}`;
      const pKey = `attrPath${i}`;
      const pVal = `attrVal${i}`;
      qb.andWhere(
        `COALESCE(CAST(json_extract(item.attributes, :${pKey}) AS TEXT), '') = :${pVal}`,
        {
          [pKey]: path,
          [pVal]: val,
        },
      );
      i += 1;
    }
    return qb;
  }

  private async ensureContainerExists(containerId: number): Promise<void> {
    const exists = await this.containerRepository.exist({ where: { id: containerId } });
    if (!exists) {
      throw new BadRequestException(`Container ${containerId} does not exist`);
    }
  }

  private async ensureCategoryExists(categoryId: number): Promise<void> {
    const exists = await this.categoryRepository.exist({ where: { id: categoryId } });
    if (!exists) {
      throw new BadRequestException(`Category ${categoryId} does not exist`);
    }
  }

  private async ensureBarcodeUnique(barcode: string, excludeItemId?: number): Promise<void> {
    const existing = await this.itemRepository.findOne({
      where: { barcode },
      select: ['id'],
    });
    if (existing && existing.id !== excludeItemId) {
      throw new BadRequestException(`Barcode ${barcode} is already in use`);
    }
  }
}
