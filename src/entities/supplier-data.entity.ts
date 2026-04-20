import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Item } from './item.entity';

@Entity('supplier_data')
export class SupplierData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'item_id', type: 'integer' })
  itemId!: number;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ type: 'text' })
  supplier!: string;

  @Column({ name: 'supplier_sku', type: 'text', nullable: true })
  supplierSku!: string | null;

  @Column({ type: 'text', nullable: true })
  url!: string | null;

  @Column({ name: 'unit_price', type: 'real', nullable: true })
  unitPrice!: number | null;

  @Column({ type: 'text', default: 'EUR' })
  currency!: string;

  @Column({ name: 'min_order_qty', type: 'integer', nullable: true })
  minOrderQty!: number | null;

  @Column({ type: 'integer', default: 0 })
  preferred!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'last_fetched', type: 'integer', nullable: true })
  lastFetched!: number | null;

  @Column({ name: 'raw_data', type: 'text', nullable: true })
  rawData!: string | null;
}
