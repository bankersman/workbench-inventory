import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as net from 'node:net';

export type PrinterStatus = {
  ok: boolean;
  configured?: boolean;
  backend?: 'tcp' | 'usb';
  detail?: string;
};

@Injectable()
export class BrotherQlService {
  private readonly logger = new Logger(BrotherQlService.name);

  private isConfigured(): boolean {
    const b = process.env.BROTHER_QL_BACKEND?.toLowerCase();
    if (b !== 'tcp' && b !== 'usb') {
      return false;
    }
    const model = process.env.BROTHER_QL_MODEL?.trim();
    const label = process.env.BROTHER_QL_LABEL?.trim();
    return Boolean(model && label);
  }

  private backend(): 'tcp' | 'usb' | undefined {
    const b = process.env.BROTHER_QL_BACKEND?.toLowerCase();
    if (b === 'tcp' || b === 'usb') {
      return b;
    }
    return undefined;
  }

  async getStatus(): Promise<PrinterStatus> {
    if (!this.isConfigured()) {
      return { ok: false, configured: false, detail: 'Set BROTHER_QL_BACKEND, BROTHER_QL_MODEL, and BROTHER_QL_LABEL' };
    }
    const backend = this.backend()!;
    if (backend === 'usb') {
      return {
        ok: true,
        configured: true,
        backend: 'usb',
        detail: 'USB readiness is verified when printing',
      };
    }
    const host = process.env.BROTHER_QL_HOST?.trim() || '127.0.0.1';
    const port = Number.parseInt(process.env.BROTHER_QL_PORT ?? '9100', 10);
    if (Number.isNaN(port)) {
      return { ok: false, configured: true, backend: 'tcp', detail: 'Invalid BROTHER_QL_PORT' };
    }
    const reachable = await this.probeTcp(host, port, 2000);
    return {
      ok: reachable,
      configured: true,
      backend: 'tcp',
      detail: reachable ? undefined : `No TCP connection to ${host}:${port}`,
    };
  }

  private probeTcp(host: string, port: number, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = net.createConnection({ host, port }, () => {
        socket.destroy();
        resolve(true);
      });
      socket.setTimeout(timeoutMs);
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        resolve(false);
      });
    });
  }

  async printPng(png: Buffer): Promise<void> {
    if (!this.isConfigured()) {
      throw new BadRequestException(
        'Brother QL is not configured. Set BROTHER_QL_BACKEND, BROTHER_QL_MODEL, and BROTHER_QL_LABEL.',
      );
    }
    const backend = this.backend()!;
    const model = process.env.BROTHER_QL_MODEL!.trim();
    const label = process.env.BROTHER_QL_LABEL!.trim();
    const timeoutMs = Number.parseInt(process.env.BROTHER_QL_TIMEOUT_MS ?? '10000', 10);
    const timeout = Number.isNaN(timeoutMs) ? 10000 : timeoutMs;

    const { BrotherQlNodeClient } = await import('@brother-ql/node');
    const client =
      backend === 'tcp'
        ? new BrotherQlNodeClient({
            backend: 'tcp',
            host: process.env.BROTHER_QL_HOST?.trim() || '127.0.0.1',
            port: Number.parseInt(process.env.BROTHER_QL_PORT ?? '9100', 10) || 9100,
          })
        : new BrotherQlNodeClient({ backend: 'usb' });

    const imageBytes = new Uint8Array(png.buffer, png.byteOffset, png.byteLength);
    try {
      const result = await client.print({
        model,
        label,
        imageBytes,
        timeoutMs: backend === 'tcp' ? timeout : undefined,
      });
      if (result.backend === 'tcp' && !result.ok) {
        throw new HttpException(
          'Brother QL TCP print did not complete successfully',
          HttpStatus.BAD_GATEWAY,
        );
      }
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof HttpException) {
        throw e;
      }
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Brother QL print failed: ${msg}`);
      throw new HttpException(`Brother QL print failed: ${msg}`, HttpStatus.BAD_GATEWAY);
    }
  }
}
