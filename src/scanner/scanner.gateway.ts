import { Logger, OnModuleDestroy } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ScannerService } from './scanner.service';

@WebSocketGateway({
  namespace: '/ws/scanner',
  cors: { origin: '*' },
})
export class ScannerGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, OnModuleDestroy
{
  private readonly logger = new Logger(ScannerGateway.name);
  private unsubscribeLine: (() => void) | null = null;
  private unsubscribeHw: (() => void) | null = null;

  @WebSocketServer()
  server!: Server;

  constructor(private readonly scannerService: ScannerService) {}

  afterInit(): void {
    this.unsubscribeLine = this.scannerService.onLine((line) => {
      this.server.to('kiosk').emit('barcode', { raw: line });
    });
    this.unsubscribeHw = this.scannerService.onHardwareStatus((connected) => {
      this.server.to('kiosk').emit('scanner_status', { connected });
      this.server.to('secondary').emit('scanner_status', { connected });
    });
  }

  onModuleDestroy(): void {
    this.unsubscribeLine?.();
    this.unsubscribeHw?.();
  }

  handleConnection(client: Socket): void {
    const role = this.readRole(client);
    client.data.role = role;
    if (role === 'kiosk') {
      void client.join('kiosk');
    } else {
      void client.join('secondary');
    }
    this.logger.debug(`WS client ${client.id} role=${role}`);
    client.emit('scanner_status', { connected: this.scannerService.isConnected() });
    client.emit('pong', { t: Date.now() });
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`WS disconnect ${client.id} role=${String(client.data?.role)}`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', { t: Date.now() });
  }

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket, @MessageBody() body: { role?: string }): void {
    const role = body?.role === 'kiosk' ? 'kiosk' : 'secondary';
    void client.leave('kiosk');
    void client.leave('secondary');
    client.data.role = role;
    if (role === 'kiosk') {
      void client.join('kiosk');
    } else {
      void client.join('secondary');
    }
    client.emit('scanner_status', { connected: this.scannerService.isConnected() });
  }

  private readRole(client: Socket): 'kiosk' | 'secondary' {
    const auth = client.handshake.auth as { role?: string } | undefined;
    const q = client.handshake.query?.role;
    const raw = auth?.role ?? (typeof q === 'string' ? q : Array.isArray(q) ? q[0] : undefined);
    return raw === 'kiosk' ? 'kiosk' : 'secondary';
  }
}
