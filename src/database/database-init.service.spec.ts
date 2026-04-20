import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DatabaseInitService } from './database-init.service';

describe('DatabaseInitService', () => {
  it('runs WAL pragma on init', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const mockDataSource = { query } as unknown as DataSource;

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseInitService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    const service = moduleRef.get(DatabaseInitService);
    await service.onModuleInit();

    expect(query).toHaveBeenCalledWith('PRAGMA journal_mode=WAL;');
  });
});
