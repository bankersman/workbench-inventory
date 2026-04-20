import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Container } from '../entities';
import { StorageUnit } from '../entities/storage-unit.entity';
import { StorageUnitService } from './storage-unit.service';

describe('StorageUnitService', () => {
  let service: StorageUnitService;
  let findOne: jest.Mock;
  let save: jest.Mock;
  let storageRepo: Record<string, jest.Mock>;
  let containerRepo: Record<string, jest.Mock>;

  const unit1: StorageUnit = {
    id: 1,
    name: 'A',
    barcode: 'SU:00001',
    parentId: null,
    notes: null,
  } as StorageUnit;

  beforeEach(async () => {
    findOne = jest.fn();
    save = jest.fn(async (x: StorageUnit) => x);
    storageRepo = {
      create: jest.fn((x: unknown) => ({ ...(x as object), id: 1 })),
      save,
      findOne,
      exist: jest.fn().mockResolvedValue(true),
      delete: jest.fn().mockResolvedValue({ affected: 1, raw: [] }),
    };
    containerRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        StorageUnitService,
        {
          provide: getRepositoryToken(StorageUnit),
          useValue: storageRepo as unknown as Repository<StorageUnit>,
        },
        {
          provide: getRepositoryToken(Container),
          useValue: containerRepo as unknown as Repository<Container>,
        },
      ],
    }).compile();

    service = moduleRef.get(StorageUnitService);
  });

  it('rejects update when new parent is an ancestor of the unit (cycle)', async () => {
    findOne
      .mockResolvedValueOnce({ ...unit1 })
      .mockResolvedValueOnce({ id: 3, parentId: 2 } as StorageUnit)
      .mockResolvedValueOnce({ id: 2, parentId: 1 } as StorageUnit);

    await expect(service.update(1, { parentId: 3 })).rejects.toThrow(BadRequestException);
  });

  it('allows update when new parent is not an ancestor', async () => {
    const updated = { ...unit1, parentId: 3 };
    findOne
      .mockResolvedValueOnce({ ...unit1 })
      .mockResolvedValueOnce({ id: 3, parentId: null } as StorageUnit)
      .mockResolvedValueOnce(updated);

    save.mockImplementation(async (u: StorageUnit) => u);

    const result = await service.update(1, { parentId: 3 });
    expect(result.parentId).toBe(3);
    expect(result.containers).toEqual([]);
  });
});
