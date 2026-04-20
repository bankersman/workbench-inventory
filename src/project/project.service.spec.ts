import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { BOMLine } from '../entities/bom-line.entity';
import { Item } from '../entities/item.entity';
import { Project } from '../entities/project.entity';
import { AvailabilityService } from '../availability/availability.service';
import { ProjectService } from './project.service';

describe('ProjectService export', () => {
  let service: ProjectService;
  let bomRepo: { find: jest.Mock };

  beforeEach(async () => {
    bomRepo = {
      find: jest.fn().mockResolvedValue([
        {
          id: 1,
          quantityRequired: 2,
          quantityPulled: 0,
          quantityInstalled: 0,
          notes: null,
          item: { name: 'R1' },
        },
      ]),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: { findOne: jest.fn().mockResolvedValue({ id: 1 }) },
        },
        {
          provide: getRepositoryToken(BOMLine),
          useValue: bomRepo as unknown as Repository<BOMLine>,
        },
        {
          provide: getRepositoryToken(Item),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
        {
          provide: AvailabilityService,
          useValue: {
            getItemAvailability: jest.fn().mockResolvedValue({
              inWarehouse: 5,
              totalReserved: 0,
              effectivelyFree: 5,
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(ProjectService);
  });

  it('exportBomCsv includes header and row', async () => {
    const csv = await service.exportBomCsv(1);
    expect(csv).toContain('item_name');
    expect(csv).toContain('R1');
    expect(csv).toContain('2');
  });
});
