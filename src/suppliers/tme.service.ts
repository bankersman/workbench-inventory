import { createHmac } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';

import { SettingsService } from '../settings/settings.service';
import type { SupplierLookupResult } from './supplier-api.types';

const TME_SEARCH_URL = 'https://api.tme.eu/Products/Search';

/** Same ordering as Go `url.Values.Encode()` (keys sorted). */
function sortedFormEncode(pairs: Record<string, string>): string {
  return Object.keys(pairs)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(pairs[k])}`)
    .join('&');
}

@Injectable()
export class TmeService {
  private readonly logger = new Logger(TmeService.name);

  constructor(private readonly settingsService: SettingsService) {}

  /** TME API v1 signature: POST&urlEncoded(url)&urlEncoded(sorted form body without ApiSignature). */
  private signRequest(
    requestUrl: string,
    pairsWithoutSig: Record<string, string>,
    secret: string,
  ): string {
    const encodedBody = sortedFormEncode(pairsWithoutSig);
    const basis = ['POST', encodeURIComponent(requestUrl), encodeURIComponent(encodedBody)].join(
      '&',
    );
    const mac = createHmac('sha1', secret);
    mac.update(basis);
    return mac.digest('base64');
  }

  async lookupBySku(sku: string): Promise<SupplierLookupResult> {
    const creds = this.settingsService.getTmeCredentials();
    if (!creds) {
      throw new Error('TME credentials not configured (TME_APP_KEY / TME_APP_SECRET)');
    }
    const pairs: Record<string, string> = {
      Country: 'US',
      Language: 'EN',
      SearchPlain: sku,
      Token: creds.token,
    };
    const sig = this.signRequest(TME_SEARCH_URL, pairs, creds.secret);
    const body = sortedFormEncode({ ...pairs, ApiSignature: sig });

    const res = await fetch(TME_SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body,
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error(`TME response not JSON (${res.status})`);
    }
    if (!res.ok) {
      this.logger.warn(`TME HTTP ${res.status} for ${sku}`);
      throw new Error(`TME HTTP ${res.status}`);
    }
    const status = (json as { Status?: string }).Status;
    if (status && status !== 'OK') {
      this.logger.warn(`TME status ${status} for ${sku}`);
    }
    const list = (json as { Data?: { ProductList?: unknown[] } }).Data?.ProductList;
    const first =
      Array.isArray(list) && list.length > 0 ? (list[0] as Record<string, unknown>) : null;
    const priceBreaks = first?.PriceBreaks as { Price?: { Value?: number } }[] | undefined;
    const unitPrice =
      Array.isArray(priceBreaks) && priceBreaks.length > 0
        ? (priceBreaks[0].Price?.Value ?? null)
        : null;
    const quantity = first?.Quantity as number | undefined;
    return {
      description: typeof first?.EnglishProductName === 'string' ? first.EnglishProductName : null,
      stock: typeof quantity === 'number' ? quantity : null,
      unitPrice: typeof unitPrice === 'number' ? unitPrice : null,
      currency: 'EUR',
      productUrl:
        typeof first?.ProductInformationPage === 'string' ? first.ProductInformationPage : null,
      datasheetUrl: typeof first?.DataSheetUrl === 'string' ? first.DataSheetUrl : null,
      rawJson: JSON.stringify(json),
    };
  }
}
