import { randomBytes } from 'node:crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Container } from '../entities';
import { StorageUnit } from '../entities/storage-unit.entity';
import { CreateStorageUnitDto } from './dto/create-storage-unit.dto';
import { UpdateStorageUnitDto } from './dto/update-storage-unit.dto';

export interface StorageUnitContainerSummary {
  id: number;
  barcode: string;
  name: string;
}

export interface StorageUnitDetail extends Omit<StorageUnit, 'parent' | 'children'> {
  containers: StorageUnitContainerSummary[];
}

function formatStorageUnitBarcode(id: number): string {
  return `SU:${String(id).padStart(5, '0')}`;
}

@Injectable()
export class StorageUnitService {
  constructor(
    @InjectRepository(StorageUnit)
    private readonly storageUnitRepository: Repository<StorageUnit>,
    @InjectRepository(Container)
    private readonly containerRepository: Repository<Container>,
  ) {}

  async create(dto: CreateStorageUnitDto): Promise<StorageUnit> {
    if (dto.parentId != null) {
      await this.ensureParentExists(dto.parentId);
      await this.assertNoParentCycleOnCreate(dto.parentId);
    }

    const placeholder = `__SU_PENDING_${Date.now()}_${randomBytes(4).toString('hex')}__`;
    let entity = this.storageUnitRepository.create({
      name: dto.name,
      notes: dto.notes ?? null,
      parentId: dto.parentId ?? null,
      barcode: placeholder,
    });
    entity = await this.storageUnitRepository.save(entity);
    entity.barcode = formatStorageUnitBarcode(entity.id);
    return this.storageUnitRepository.save(entity);
  }

  async findAll(): Promise<StorageUnit[]> {
    return this.storageUnitRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<StorageUnitDetail> {
    const unit = await this.storageUnitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Storage unit ${id} not found`);
    }
    const containers = await this.containerRepository.find({
      where: { storageUnitId: id },
      order: { id: 'ASC' },
      select: ['id', 'barcode', 'name'],
    });
    return {
      ...unit,
      containers: containers.map((c) => ({
        id: c.id,
        barcode: c.barcode,
        name: c.name,
      })),
    };
  }

  async update(id: number, dto: UpdateStorageUnitDto): Promise<StorageUnitDetail> {
    const unit = await this.storageUnitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Storage unit ${id} not found`);
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId !== null) {
        await this.ensureParentExists(dto.parentId);
        if (dto.parentId === id) {
          throw new BadRequestException('Storage unit cannot be its own parent');
        }
        await this.assertNoAncestorIs(id, dto.parentId);
      }
      unit.parentId = dto.parentId;
    }
    if (dto.name !== undefined) {
      unit.name = dto.name;
    }
    if (dto.notes !== undefined) {
      unit.notes = dto.notes;
    }
    await this.storageUnitRepository.save(unit);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.storageUnitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Storage unit ${id} not found`);
    }
  }

  private async ensureParentExists(parentId: number): Promise<void> {
    const exists = await this.storageUnitRepository.exist({ where: { id: parentId } });
    if (!exists) {
      throw new BadRequestException(`Parent storage unit ${parentId} does not exist`);
    }
  }

  /** Walk ancestors of `startId`; if `forbiddenId` is reached, it would create a cycle. */
  private async assertNoAncestorIs(forbiddenId: number, startId: number): Promise<void> {
    let current: number | null = startId;
    while (current !== null) {
      if (current === forbiddenId) {
        throw new BadRequestException('Circular parent reference');
      }
      const row = await this.storageUnitRepository.findOne({
        where: { id: current },
        select: ['id', 'parentId'],
      });
      current = row?.parentId ?? null;
    }
  }

  private async assertNoParentCycleOnCreate(parentId: number): Promise<void> {
    const row = await this.storageUnitRepository.findOne({
      where: { id: parentId },
      select: ['id', 'parentId'],
    });
    if (!row) {
      return;
    }
    const visited = new Set<number>();
    let current: number | null = parentId;
    while (current !== null) {
      if (visited.has(current)) {
        throw new BadRequestException('Circular parent reference in existing data');
      }
      visited.add(current);
      const next = await this.storageUnitRepository.findOne({
        where: { id: current },
        select: ['parentId'],
      });
      current = next?.parentId ?? null;
    }
  }
}
