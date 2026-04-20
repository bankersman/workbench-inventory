import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import type { CategoryAttributeDefinition } from './category-attribute.types';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  /** Array of attribute definitions (JSON). */
  @Column({ type: 'simple-json' })
  attributes!: CategoryAttributeDefinition[];
}
