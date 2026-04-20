import { EventEmitter } from 'node:events';

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SerialPort } from 'serialport';

@Injectable()
export class ScannerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScannerService.name);
  private readonly events = new EventEmitter();
  private port: SerialPort | null = null;
  private buffer = '';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private destroyed = false;

  onModuleInit(): void {
    const path = process.env.SCANNER_PORT?.trim();
    if (!path) {
      this.logger.log('SCANNER_PORT not set — hardware scanner disabled');
      return;
    }
    const baud = process.env.SCANNER_BAUD ? Number(process.env.SCANNER_BAUD) : 9600;
    if (Number.isNaN(baud)) {
      this.logger.warn('SCANNER_BAUD invalid — using 9600');
    }
    void this.connect(path, Number.isNaN(baud) ? 9600 : baud);
  }

  onModuleDestroy(): void {
    this.destroyed = true;
    this.clearReconnect();
    this.closePort();
  }

  isEnabled(): boolean {
    const path = process.env.SCANNER_PORT?.trim();
    return Boolean(path && path.length > 0);
  }

  isConnected(): boolean {
    return this.port?.isOpen === true;
  }

  /** Subscribe to complete scan lines (without line terminators). */
  onLine(handler: (line: string) => void): () => void {
    this.events.on('line', handler);
    return () => this.events.off('line', handler);
  }

  /** Subscribe to scanner hardware connect/disconnect (serial open/close). */
  onHardwareStatus(handler: (connected: boolean) => void): () => void {
    this.events.on('hardware_status', handler);
    return () => this.events.off('hardware_status', handler);
  }

  private emitHardwareStatus(connected: boolean): void {
    this.events.emit('hardware_status', connected);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(path: string, baud: number): void {
    if (this.destroyed) {
      return;
    }
    this.clearReconnect();
    const delay = Math.min(30_000, 500 * 2 ** this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.logger.warn(
      `Scanner disconnected; reconnecting in ${delay}ms (attempt ${this.reconnectAttempt})`,
    );
    this.reconnectTimer = setTimeout(() => {
      void this.connect(path, baud);
    }, delay);
  }

  private closePort(): void {
    if (this.port) {
      try {
        this.port.removeAllListeners();
        if (this.port.isOpen) {
          this.port.close();
        }
      } catch {
        /* ignore */
      }
      this.port = null;
    }
    if (this.isEnabled()) {
      this.emitHardwareStatus(false);
    }
  }

  private async connect(path: string, baud: number): Promise<void> {
    if (this.destroyed) {
      return;
    }
    this.closePort();
    try {
      this.port = new SerialPort({ path, baudRate: baud, autoOpen: false });
    } catch (e) {
      this.logger.error(`Failed to create serial port: ${String(e)}`);
      this.scheduleReconnect(path, baud);
      return;
    }

    this.port.on('open', () => {
      this.reconnectAttempt = 0;
      this.logger.log(`Scanner serial opened: ${path} @ ${baud}`);
      this.emitHardwareStatus(true);
    });

    this.port.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString('utf8');
      let idx: number;
      while ((idx = this.buffer.search(/\r\n|\n|\r/)) !== -1) {
        const line = this.buffer.slice(0, idx).trimEnd();
        this.buffer = this.buffer.slice(idx + 1);
        if (line.length > 0) {
          this.events.emit('line', line);
        }
      }
    });

    this.port.on('error', (err) => {
      this.logger.warn(`Scanner serial error: ${String(err)}`);
    });

    this.port.on('close', () => {
      this.logger.warn('Scanner serial closed');
      this.emitHardwareStatus(false);
      this.scheduleReconnect(path, baud);
    });

    this.port.open((err) => {
      if (err) {
        this.logger.warn(`Scanner open failed: ${String(err)}`);
        this.port = null;
        this.scheduleReconnect(path, baud);
      }
    });
  }
}
