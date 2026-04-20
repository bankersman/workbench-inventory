import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Category } from './category.entity';
import { Container } from './container.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'category_id', type: 'integer', nullable: true })
  categoryId!: number | null;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  /** Key/value pairs matching category attribute definitions (JSON object). */
  @Column({ type: 'simple-json' })
  attributes!: Record<string, string | number | null>;

  @Column({ type: 'integer', default: 0 })
  quantity!: number;

  @Column({ name: 'min_qty', type: 'integer', nullable: true })
  minQty!: number | null;

  @Column({ name: 'reorder_qty', type: 'integer', nullable: true })
  reorderQty!: number | null;

  @Column({ type: 'text' })
  unit!: string;

  @Column({ type: 'text', nullable: true, unique: true })
  barcode!: string | null;

  @Column({ name: 'container_id', type: 'integer' })
  containerId!: number;

  @ManyToOne(() => Container, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'container_id' })
  container!: Container;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
