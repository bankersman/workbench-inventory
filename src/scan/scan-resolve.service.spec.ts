import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Container } from '../entities/container.entity';
import { Item } from '../entities/item.entity';
import { Project } from '../entities/project.entity';
import { StorageUnit } from '../entities/storage-unit.entity';
import { ScanResolveService } from './scan-resolve.service';

describe('ScanResolveService', () => {
  let service: ScanResolveService;
  let findOneSu: jest.Mock;
  let findOneCo: jest.Mock;
  let findOnePr: jest.Mock;
  let findOneIt: jest.Mock;

  beforeEach(async () => {
    findOneSu = jest.fn();
    findOneCo = jest.fn();
    findOnePr = jest.fn();
    findOneIt = jest.fn();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ScanResolveService,
        {
          provide: getRepositoryToken(StorageUnit),
          useValue: { findOne: findOneSu } as unknown as Repository<StorageUnit>,
        },
        {
          provide: getRepositoryToken(Container),
          useValue: { findOne: findOneCo } as unknown as Repository<Container>,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: { findOne: findOnePr } as unknown as Repository<Project>,
        },
        {
          provide: getRepositoryToken(Item),
          useValue: { findOne: findOneIt } as unknown as Repository<Item>,
        },
      ],
    }).compile();

    service = moduleRef.get(ScanResolveService);
  });

  it('resolves CMD:TAKE', async () => {
    findOneSu.mockResolvedValue(null);
    findOneCo.mockResolvedValue(null);
    findOneIt.mockResolvedValue(null);

    const r = await service.resolve('CMD:TAKE');
    expect(r.kind).toBe('command');
    expect(r.command).toBe('TAKE');
  });

  it('resolves QTY:10', async () => {
    findOneSu.mockResolvedValue(null);
    findOneCo.mockResolvedValue(null);
    findOneIt.mockResolvedValue(null);

    const r = await service.resolve('QTY:10');
    expect(r.kind).toBe('quantity');
    expect(r.quantity).toBe(10);
  });

  it('resolves PRJ: by id', async () => {
    findOneSu.mockResolvedValue(null);
    findOneCo.mockResolvedValue(null);
    findOneIt.mockResolvedValue(null);
    findOnePr.mockResolvedValue({ id: 7, name: 'P' });

    const r = await service.resolve('PRJ:00007');
    expect(r.kind).toBe('project');
    expect(r.project?.id).toBe(7);
  });
});
