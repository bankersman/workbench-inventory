import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'csv-parse/sync';
import { Repository } from 'typeorm';

import { Item } from '../entities/item.entity';

export interface BomPreviewRow {
  name: string;
  quantity: number;
  ref?: string;
  notes?: string;
}

export interface BomPreviewMatched extends BomPreviewRow {
  itemId: number;
}

export interface BomPreviewResult {
  matched: BomPreviewMatched[];
  unmatched: BomPreviewRow[];
}

@Injectable()
export class BomImportService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async previewCsv(csvText: string): Promise<BomPreviewResult> {
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as Record<string, string>[];

    const items = await this.itemRepository.find();
    const byName = new Map(items.map((i) => [i.name.toLowerCase(), i]));

    const matched: BomPreviewMatched[] = [];
    const unmatched: BomPreviewRow[] = [];

    for (const row of records) {
      const keys = Object.keys(row);
      const lower = Object.fromEntries(keys.map((k) => [k.toLowerCase(), row[k]])) as Record<
        string,
        string
      >;
      const name = lower.name ?? lower.item ?? lower.description ?? lower.part ?? '';
      const qtyRaw = lower.qty ?? lower.quantity ?? lower.count ?? lower.q ?? '1';
      const quantity = Math.max(1, Math.floor(Number(qtyRaw) || 1));
      const ref = lower.ref ?? lower.reference ?? lower.refs;
      const notes = lower.notes ?? lower.comment;
      if (!name) {
        continue;
      }
      const item = byName.get(name.toLowerCase());
      const base: BomPreviewRow = {
        name,
        quantity,
        ref: ref || undefined,
        notes: notes || undefined,
      };
      if (item) {
        matched.push({ ...base, itemId: item.id });
      } else {
        unmatched.push(base);
      }
    }

    return { matched, unmatched };
  }
}
