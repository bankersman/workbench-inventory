import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Item } from './item.entity';
import { Project } from './project.entity';

@Entity('bom_lines')
export class BOMLine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'project_id', type: 'integer' })
  projectId!: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ name: 'item_id', type: 'integer' })
  itemId!: number;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ name: 'quantity_required', type: 'integer' })
  quantityRequired!: number;

  @Column({ name: 'quantity_pulled', type: 'integer', default: 0 })
  quantityPulled!: number;

  @Column({ name: 'quantity_installed', type: 'integer', default: 0 })
  quantityInstalled!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
