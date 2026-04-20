import { Injectable, Logger } from '@nestjs/common';

import { SettingsService } from '../settings/settings.service';
import type { SupplierLookupResult } from './supplier-api.types';

@Injectable()
export class MouserService {
  private readonly logger = new Logger(MouserService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async lookupBySku(sku: string): Promise<SupplierLookupResult> {
    const apiKey = this.settingsService.getMouserApiKey();
    if (!apiKey) {
      throw new Error('Mouser API key not configured (MOUSER_API_KEY)');
    }
    const url = `https://api.mouser.com/api/v1/search/partnumber?apiKey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        SearchByPartRequest: {
          PartNumber: sku,
        },
      }),
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error(`Mouser response not JSON (${res.status})`);
    }
    if (!res.ok) {
      this.logger.warn(`Mouser HTTP ${res.status} for ${sku}`);
      throw new Error(`Mouser HTTP ${res.status}`);
    }
    const parts = (json as { SearchResults?: { Parts?: unknown[] } }).SearchResults?.Parts;
    const first =
      Array.isArray(parts) && parts.length > 0 ? (parts[0] as Record<string, unknown>) : null;
    const priceBreaks = first?.PriceBreaks as { Quantity?: number; Price?: string }[] | undefined;
    const firstBreak =
      Array.isArray(priceBreaks) && priceBreaks.length > 0 ? priceBreaks[0] : undefined;
    const priceStr = firstBreak?.Price;
    const unitPrice =
      typeof priceStr === 'string' ? Number.parseFloat(priceStr.replace(/[^0-9.-]/g, '')) : null;
    const availability = first?.AvailabilityInStock as number | string | undefined;
    let stock: number | null = null;
    if (typeof availability === 'number') {
      stock = availability;
    } else if (typeof availability === 'string') {
      const n = Number.parseInt(availability, 10);
      stock = Number.isFinite(n) ? n : null;
    }
    return {
      description: typeof first?.Description === 'string' ? first.Description : null,
      stock,
      unitPrice: Number.isFinite(unitPrice as number) ? (unitPrice as number) : null,
      currency: 'USD',
      productUrl: typeof first?.ProductDetailUrl === 'string' ? first.ProductDetailUrl : null,
      datasheetUrl: typeof first?.DataSheetUrl === 'string' ? first.DataSheetUrl : null,
      rawJson: JSON.stringify(json),
    };
  }
}
