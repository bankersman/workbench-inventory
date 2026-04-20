/** Dispatches the same payload the WebSocket `barcode` event would carry — used by touch command palette and (later) `useScanner`. */
export const SCAN_LINE_EVENT = 'workbench-scan-line';

export function emitScanLine(raw: string): void {
  window.dispatchEvent(new CustomEvent(SCAN_LINE_EVENT, { detail: { raw } }));
}
