import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../entities/category.entity';
import type { CategoryAttributeDefinition } from '../entities/category-attribute.types';
import { assertValidCategoryAttributes } from './category-attributes.validator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const attrs = this.normalizeAttributes(dto.attributes);
    const entity = this.categoryRepository.create({
      name: dto.name,
      attributes: attrs,
    });
    return this.categoryRepository.save(entity);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Category> {
    const row = await this.categoryRepository.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return row;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const row = await this.categoryRepository.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    if (dto.name !== undefined) {
      row.name = dto.name;
    }
    if (dto.attributes !== undefined) {
      row.attributes = this.normalizeAttributes(dto.attributes);
    }
    return this.categoryRepository.save(row);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category ${id} not found`);
    }
  }

  private normalizeAttributes(raw: unknown[] | undefined | null): CategoryAttributeDefinition[] {
    if (raw === undefined || raw === null) {
      return [];
    }
    return assertValidCategoryAttributes(raw);
  }
}
