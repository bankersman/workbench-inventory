import { randomBytes } from 'node:crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Container } from '../entities/container.entity';
import { Project } from '../entities/project.entity';
import { StorageUnit } from '../entities/storage-unit.entity';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';

export interface StorageUnitSummary {
  id: number;
  barcode: string;
  name: string;
}

export interface ProjectSummary {
  id: number;
  name: string;
  status: string;
}

export interface ContainerDetail extends Omit<Container, 'storageUnit' | 'project'> {
  storageUnit: StorageUnitSummary | null;
  project: ProjectSummary | null;
}

function formatContainerBarcode(id: number): string {
  return `BIN:${String(id).padStart(5, '0')}`;
}

@Injectable()
export class ContainerService {
  constructor(
    @InjectRepository(Container)
    private readonly containerRepository: Repository<Container>,
    @InjectRepository(StorageUnit)
    private readonly storageUnitRepository: Repository<StorageUnit>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateContainerDto): Promise<ContainerDetail> {
    if (dto.storageUnitId != null) {
      await this.ensureStorageUnitExists(dto.storageUnitId);
    }
    if (dto.projectId != null) {
      await this.ensureProjectExists(dto.projectId);
    }

    const placeholder = `__BIN_PENDING_${Date.now()}_${randomBytes(4).toString('hex')}__`;
    let entity = this.containerRepository.create({
      name: dto.name,
      notes: dto.notes ?? null,
      storageUnitId: dto.storageUnitId ?? null,
      projectId: dto.projectId ?? null,
      barcode: placeholder,
    });
    entity = await this.containerRepository.save(entity);
    entity.barcode = formatContainerBarcode(entity.id);
    await this.containerRepository.save(entity);
    return this.findOne(entity.id);
  }

  async findAll(): Promise<Container[]> {
    return this.containerRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<ContainerDetail> {
    const container = await this.containerRepository.findOne({ where: { id } });
    if (!container) {
      throw new NotFoundException(`Container ${id} not found`);
    }
    return this.toDetail(container);
  }

  async update(id: number, dto: UpdateContainerDto): Promise<ContainerDetail> {
    const container = await this.containerRepository.findOne({ where: { id } });
    if (!container) {
      throw new NotFoundException(`Container ${id} not found`);
    }

    if (dto.storageUnitId !== undefined) {
      if (dto.storageUnitId !== null) {
        await this.ensureStorageUnitExists(dto.storageUnitId);
      }
      container.storageUnitId = dto.storageUnitId;
    }
    if (dto.projectId !== undefined) {
      if (dto.projectId !== null) {
        await this.ensureProjectExists(dto.projectId);
      }
      container.projectId = dto.projectId;
    }
    if (dto.name !== undefined) {
      container.name = dto.name;
    }
    if (dto.notes !== undefined) {
      container.notes = dto.notes;
    }
    await this.containerRepository.save(container);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.containerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Container ${id} not found`);
    }
  }

  private async toDetail(container: Container): Promise<ContainerDetail> {
    let storageUnit: StorageUnitSummary | null = null;
    if (container.storageUnitId != null) {
      const su = await this.storageUnitRepository.findOne({
        where: { id: container.storageUnitId },
        select: ['id', 'barcode', 'name'],
      });
      if (su) {
        storageUnit = { id: su.id, barcode: su.barcode, name: su.name };
      }
    }
    let project: ProjectSummary | null = null;
    if (container.projectId != null) {
      const p = await this.projectRepository.findOne({
        where: { id: container.projectId },
        select: ['id', 'name', 'status'],
      });
      if (p) {
        project = { id: p.id, name: p.name, status: p.status };
      }
    }
    return {
      id: container.id,
      barcode: container.barcode,
      name: container.name,
      storageUnitId: container.storageUnitId,
      projectId: container.projectId,
      notes: container.notes,
      storageUnit,
      project,
    };
  }

  private async ensureStorageUnitExists(storageUnitId: number): Promise<void> {
    const exists = await this.storageUnitRepository.exist({ where: { id: storageUnitId } });
    if (!exists) {
      throw new BadRequestException(`Storage unit ${storageUnitId} does not exist`);
    }
  }

  private async ensureProjectExists(projectId: number): Promise<void> {
    const exists = await this.projectRepository.exist({ where: { id: projectId } });
    if (!exists) {
      throw new BadRequestException(`Project ${projectId} does not exist`);
    }
  }
}
