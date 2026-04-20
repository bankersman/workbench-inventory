import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Project } from './project.entity';
import { StorageUnit } from './storage-unit.entity';

@Entity('containers')
export class Container {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  barcode!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'storage_unit_id', type: 'integer', nullable: true })
  storageUnitId!: number | null;

  @ManyToOne(() => StorageUnit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'storage_unit_id' })
  storageUnit!: StorageUnit | null;

  @Column({ name: 'project_id', type: 'integer', nullable: true })
  projectId!: number | null;

  @ManyToOne(() => Project, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project!: Project | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
