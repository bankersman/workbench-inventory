import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('storage_units')
export class StorageUnit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  barcode!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'parent_id', type: 'integer', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => StorageUnit, (su) => su.children, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent!: StorageUnit | null;

  @OneToMany(() => StorageUnit, (su) => su.parent)
  children!: StorageUnit[];

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
