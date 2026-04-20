import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';

import { BOMLine } from '../entities/bom-line.entity';
import { Item } from '../entities/item.entity';
import { Project, ProjectStatus } from '../entities/project.entity';
import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let itemRepo: { findOne: jest.Mock };
  let bomRepo: { createQueryBuilder: jest.Mock; find: jest.Mock };
  let projectRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    itemRepo = { findOne: jest.fn() };
    projectRepo = { findOne: jest.fn() };

    const chain = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ sum: '0' }),
    };
    bomRepo = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValue(chain as unknown as SelectQueryBuilder<BOMLine>),
      find: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(Item),
          useValue: itemRepo as unknown as Repository<Item>,
        },
        {
          provide: getRepositoryToken(BOMLine),
          useValue: bomRepo as unknown as Repository<BOMLine>,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: projectRepo as unknown as Repository<Project>,
        },
      ],
    }).compile();

    service = moduleRef.get(AvailabilityService);
  });

  it('computes inWarehouse and effectivelyFree from aggregates', async () => {
    itemRepo.findOne.mockResolvedValue({ id: 1, quantity: 100 });
    let call = 0;
    bomRepo.createQueryBuilder.mockImplementation(() => {
      call += 1;
      const getRawOne =
        call === 1
          ? jest.fn().mockResolvedValue({ sum: '15' })
          : jest.fn().mockResolvedValue({ sum: '40' });
      return {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne,
      };
    });

    const r = await service.getItemAvailability(1);
    expect(r.quantity).toBe(100);
    expect(r.inWarehouse).toBe(85);
    expect(r.totalReserved).toBe(40);
    expect(r.effectivelyFree).toBe(45);
  });

  it('returns per-line data for getProjectAvailability', async () => {
    projectRepo.findOne.mockResolvedValue({ id: 2, status: ProjectStatus.Active });
    bomRepo.find.mockResolvedValue([
      {
        id: 10,
        itemId: 1,
        quantityRequired: 5,
        quantityPulled: 1,
        quantityInstalled: 0,
      },
    ] as BOMLine[]);

    itemRepo.findOne.mockResolvedValue({ id: 1, quantity: 10 });
    bomRepo.createQueryBuilder.mockImplementation(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ sum: '0' }),
    }));

    const rows = await service.getProjectAvailability(2);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.stillNeeded).toBe(4);
    expect(rows[0]?.bomLineId).toBe(10);
  });
});
