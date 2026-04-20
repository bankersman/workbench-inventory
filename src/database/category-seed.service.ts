import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../entities';
import { DEFAULT_CATEGORIES } from './default-categories';

@Injectable()
export class CategorySeedService implements OnModuleInit {
  private readonly logger = new Logger(CategorySeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultCategoriesIfEmpty();
  }

  /** Inserts PLAN.md default categories when the table has no rows (idempotent). */
  async seedDefaultCategoriesIfEmpty(): Promise<void> {
    const count = await this.categoryRepository.count();
    if (count > 0) {
      return;
    }
    await this.categoryRepository.insert(
      DEFAULT_CATEGORIES.map((c) => ({
        name: c.name,
        attributes: c.attributes,
      })),
    );
    this.logger.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
  }
}
