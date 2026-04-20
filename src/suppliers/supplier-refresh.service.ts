import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SupplierData } from '../entities/supplier-data.entity';
import { MouserService } from './mouser.service';
import { TmeService } from './tme.service';

const BATCH_DELAY_MS = 200;

function normalizeSupplier(name: string): 'mouser' | 'tme' | null {
  const l = name.trim().toLowerCase();
  if (l === 'mouser' || l.includes('mouser')) {
    return 'mouser';
  }
  if (l === 'tme') {
    return 'tme';
  }
  return null;
}

@Injectable()
export class SupplierRefreshService {
  private readonly logger = new Logger(SupplierRefreshService.name);

  constructor(
    @InjectRepository(SupplierData)
    private readonly supplierDataRepository: Repository<SupplierData>,
    private readonly mouserService: MouserService,
    private readonly tmeService: TmeService,
  ) {}

  /** Sequential refresh for all rows with Mouser/TME SKUs. */
  async refreshAll(): Promise<{ updated: number; errors: string[] }> {
    const rows = await this.supplierDataRepository.find({
      where: {},
      order: { id: 'ASC' },
    });
    const withSku = rows.filter((r) => r.supplierSku && normalizeSupplier(r.supplier));
    let updated = 0;
    const errors: string[] = [];
    for (const row of withSku) {
      const kind = normalizeSupplier(row.supplier);
      if (!kind || !row.supplierSku) {
        continue;
      }
      try {
        const result =
          kind === 'mouser'
            ? await this.mouserService.lookupBySku(row.supplierSku)
            : await this.tmeService.lookupBySku(row.supplierSku);
        row.rawData = result.rawJson;
        row.lastFetched = Math.floor(Date.now() / 1000);
        if (result.unitPrice != null) {
          row.unitPrice = result.unitPrice;
        }
        if (result.currency) {
          row.currency = result.currency;
        }
        if (result.productUrl) {
          row.url = result.productUrl;
        }
        await this.supplierDataRepository.save(row);
        updated += 1;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`#${row.id} ${row.supplier} ${row.supplierSku}: ${msg}`);
        this.logger.warn(`Refresh failed for supplier_data ${row.id}: ${msg}`);
      }
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
    return { updated, errors };
  }
}
