import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BrotherQlService {
  private readonly logger = new Logger(BrotherQlService.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = (process.env.LABEL_SIDECAR_URL ?? 'http://127.0.0.1:5050').replace(/\/$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async getStatus(): Promise<{ ok: boolean; body?: unknown }> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, { method: 'GET' });
      const body = (await res.json()) as unknown;
      return { ok: res.ok, body };
    } catch (e) {
      this.logger.warn(`Sidecar status failed: ${e instanceof Error ? e.message : String(e)}`);
      return { ok: false };
    }
  }

  async printPng(png: Buffer): Promise<void> {
    const res = await fetch(`${this.baseUrl}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        png_base64: png.toString('base64'),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Sidecar print failed: HTTP ${res.status} ${text}`);
    }
  }
}
