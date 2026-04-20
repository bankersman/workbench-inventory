import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Container } from '../entities/container.entity';
import { Project } from '../entities/project.entity';
import { StorageUnit } from '../entities/storage-unit.entity';
import { ContainerService } from './container.service';

describe('ContainerService', () => {
  let service: ContainerService;
  let findOne: jest.Mock;
  let existSu: jest.Mock;
  let existProj: jest.Mock;
  let save: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();
    existSu = jest.fn();
    existProj = jest.fn();
    save = jest.fn(async (x: Container) => x);

    const containerRepo = {
      create: jest.fn((x: unknown) => ({ ...(x as object), id: 7 })),
      save,
      findOne,
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const storageRepo = {
      exist: existSu,
      findOne: jest.fn().mockResolvedValue({ id: 1, barcode: 'SU:00001', name: 'Cab' }),
    };
    const projectRepo = {
      exist: existProj,
      findOne: jest.fn().mockResolvedValue({ id: 2, name: 'P', status: 'active' }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ContainerService,
        {
          provide: getRepositoryToken(Container),
          useValue: containerRepo as unknown as Repository<Container>,
        },
        {
          provide: getRepositoryToken(StorageUnit),
          useValue: storageRepo as unknown as Repository<StorageUnit>,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: projectRepo as unknown as Repository<Project>,
        },
      ],
    }).compile();

    service = moduleRef.get(ContainerService);
  });

  it('rejects create when storage unit id is invalid', async () => {
    existSu.mockResolvedValue(false);
    await expect(service.create({ name: 'Bin', storageUnitId: 99, notes: null })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects create when project id is invalid', async () => {
    existSu.mockResolvedValue(true);
    existProj.mockResolvedValue(false);
    await expect(
      service.create({ name: 'Bin', storageUnitId: 1, projectId: 3, notes: null }),
    ).rejects.toThrow(BadRequestException);
  });
});
