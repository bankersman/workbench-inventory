import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Container } from '../entities/container.entity';
import { Item } from '../entities/item.entity';
import { Project } from '../entities/project.entity';
import { StorageUnit } from '../entities/storage-unit.entity';

export type ScanResolveKind =
  | 'unknown'
  | 'storage_unit'
  | 'container'
  | 'project_bin'
  | 'project'
  | 'item'
  | 'command'
  | 'quantity';

export interface ScanResolveResult {
  kind: ScanResolveKind;
  raw: string;
  storageUnit?: StorageUnit;
  container?: Container;
  project?: Project;
  item?: Item;
  /** For `command` */
  command?: string;
  /** For `quantity` */
  quantity?: number;
}

@Injectable()
export class ScanResolveService {
  constructor(
    @InjectRepository(StorageUnit)
    private readonly storageUnitRepository: Repository<StorageUnit>,
    @InjectRepository(Container)
    private readonly containerRepository: Repository<Container>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async resolve(rawInput: string): Promise<ScanResolveResult> {
    const raw = rawInput.trim();
    if (raw.length === 0) {
      return { kind: 'unknown', raw };
    }

    const su = await this.storageUnitRepository.findOne({ where: { barcode: raw } });
    if (su) {
      return { kind: 'storage_unit', raw, storageUnit: su };
    }

    const c = await this.containerRepository.findOne({ where: { barcode: raw } });
    if (c) {
      const kind = raw.startsWith('PBIN:') ? 'project_bin' : 'container';
      return { kind, raw, container: c };
    }

    const item = await this.itemRepository.findOne({ where: { barcode: raw } });
    if (item) {
      return { kind: 'item', raw, item };
    }

    const prj = /^PRJ:(\d+)$/.exec(raw);
    if (prj) {
      const id = Number(prj[1]);
      const project = await this.projectRepository.findOne({ where: { id } });
      if (project) {
        return { kind: 'project', raw, project };
      }
    }

    const cmd = /^CMD:(.+)$/.exec(raw);
    if (cmd) {
      return { kind: 'command', raw, command: cmd[1] };
    }

    const qty = /^QTY:(\d+)$/.exec(raw);
    if (qty) {
      return { kind: 'quantity', raw, quantity: Number(qty[1]) };
    }

    return { kind: 'unknown', raw };
  }
}
