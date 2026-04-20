import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

export interface UseScannerResult {
  connected: boolean;
  lastError: string | null;
}

/**
 * WebSocket client for `/ws/scanner` with `role: kiosk`.
 */
export function useScanner(onLine?: (raw: string) => void): UseScannerResult {
  const [connected, setConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const onLineRef = useRef(onLine);

  useEffect(() => {
    onLineRef.current = onLine;
  }, [onLine]);

  useEffect(() => {
    let socket: Socket;
    try {
      socket = io('/ws/scanner', {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        auth: { role: 'kiosk' },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });
    } catch (e) {
      setTimeout(() => setLastError(String(e)), 0);
      return;
    }

    socket.on('connect', () => {
      setConnected(true);
      setLastError(null);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => setLastError(String(err)));
    socket.on('barcode', (payload: { raw?: string }) => {
      if (typeof payload?.raw === 'string') {
        onLineRef.current?.(payload.raw);
      }
    });

    const iv = setInterval(() => {
      socket.emit('ping');
    }, 25_000);

    return () => {
      clearInterval(iv);
      socket.removeAllListeners();
      socket.close();
    };
  }, []);

  return { connected, lastError };
}
