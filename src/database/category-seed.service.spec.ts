import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../entities';
import { DEFAULT_CATEGORIES } from './default-categories';
import { CategorySeedService } from './category-seed.service';

describe('CategorySeedService', () => {
  let moduleRef: TestingModule;
  let repository: Repository<Category>;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Category],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Category]),
      ],
      providers: [CategorySeedService],
    }).compile();

    repository = moduleRef.get(getRepositoryToken(Category));
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('seeds all default categories when the table is empty', async () => {
    const service = moduleRef.get(CategorySeedService);
    await service.seedDefaultCategoriesIfEmpty();

    const rows = await repository.find({ order: { id: 'ASC' } });
    expect(rows).toHaveLength(DEFAULT_CATEGORIES.length);
    expect(rows.map((r) => r.name)).toEqual(DEFAULT_CATEGORIES.map((c) => c.name));
    expect(rows[0]?.attributes).toEqual(DEFAULT_CATEGORIES[0]?.attributes);
  });

  it('does not duplicate when categories already exist', async () => {
    await repository.save({
      name: 'Pre-existing',
      attributes: [],
    });

    const service = moduleRef.get(CategorySeedService);
    await service.seedDefaultCategoriesIfEmpty();

    const count = await repository.count();
    expect(count).toBe(1);
  });

  it('is idempotent when called twice on an empty table', async () => {
    const service = moduleRef.get(CategorySeedService);
    await service.seedDefaultCategoriesIfEmpty();
    await service.seedDefaultCategoriesIfEmpty();

    expect(await repository.count()).toBe(DEFAULT_CATEGORIES.length);
  });
});
