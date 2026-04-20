/**
 * Client command-mode state machine (PLAN.md — Scanner Command Flow).
 * Scanner lines and touch use the same `dispatchLine` entry point.
 */

export type CommandMode =
  | 'IDLE'
  | 'TAKE_AWAITING_BIN'
  | 'TAKE_AWAITING_QTY'
  | 'ADD_AWAITING_BIN'
  | 'ADD_AWAITING_QTY'
  | 'PULL_AWAITING_PROJECT'
  | 'PULL_AWAITING_BIN'
  | 'PULL_AWAITING_QTY'
  | 'MOVE_AWAITING_CONTAINER'
  | 'MOVE_AWAITING_DEST'
  | 'NEW_AWAITING_SCAN';

export interface CommandState {
  mode: CommandMode;
  /** Accumulated quantity for QTY codes (additive). */
  qty: number;
  /** Human label for UI (bin name, project name, etc.). */
  targetLabel?: string;
}

export interface CommandDispatchResult {
  next: CommandState;
  /** Non-command barcode to treat as navigation (entity resolution done elsewhere). */
  navigationRaw?: string;
}

const CMD = (s: string) => `CMD:${s}`;

export function initialCommandState(): CommandState {
  return { mode: 'IDLE', qty: 1 };
}

function isQtyLine(line: string): number | null {
  const m = /^QTY:(\d+)$/.exec(line.trim());
  return m ? Number(m[1]) : null;
}

export function reduceCommandState(prev: CommandState, line: string): CommandDispatchResult {
  const raw = line.trim();
  if (raw.length === 0) {
    return { next: prev };
  }

  const qtyAdd = isQtyLine(raw);
  if (qtyAdd !== null) {
    if (
      prev.mode === 'TAKE_AWAITING_QTY' ||
      prev.mode === 'ADD_AWAITING_QTY' ||
      prev.mode === 'PULL_AWAITING_QTY'
    ) {
      return { next: { ...prev, qty: prev.qty + qtyAdd } };
    }
    return { next: prev };
  }

  if (raw === CMD('CANCEL')) {
    if (prev.mode === 'IDLE') {
      return { next: prev };
    }
    return { next: initialCommandState() };
  }

  if (raw === CMD('CONFIRM')) {
    if (
      prev.mode === 'TAKE_AWAITING_QTY' ||
      prev.mode === 'ADD_AWAITING_QTY' ||
      prev.mode === 'PULL_AWAITING_QTY'
    ) {
      const mode =
        prev.mode === 'TAKE_AWAITING_QTY'
          ? 'TAKE_AWAITING_BIN'
          : prev.mode === 'ADD_AWAITING_QTY'
            ? 'ADD_AWAITING_BIN'
            : 'PULL_AWAITING_BIN';
      return { next: { mode, qty: 1, targetLabel: prev.targetLabel } };
    }
    return { next: prev };
  }

  switch (prev.mode) {
    case 'IDLE': {
      if (raw === CMD('TAKE')) {
        return { next: { mode: 'TAKE_AWAITING_BIN', qty: 1 } };
      }
      if (raw === CMD('ADD')) {
        return { next: { mode: 'ADD_AWAITING_BIN', qty: 1 } };
      }
      if (raw === CMD('PULL')) {
        return { next: { mode: 'PULL_AWAITING_PROJECT', qty: 1 } };
      }
      if (raw === CMD('MOVE')) {
        return { next: { mode: 'MOVE_AWAITING_CONTAINER', qty: 1 } };
      }
      if (raw === CMD('NEW')) {
        return { next: { mode: 'NEW_AWAITING_SCAN', qty: 1 } };
      }
      if (raw.startsWith('CMD:') || raw.startsWith('QTY:')) {
        return { next: prev };
      }
      return { next: prev, navigationRaw: raw };
    }
    case 'TAKE_AWAITING_BIN': {
      if (raw.startsWith('BIN:')) {
        return {
          next: { mode: 'TAKE_AWAITING_QTY', qty: 1, targetLabel: raw },
        };
      }
      return { next: prev };
    }
    case 'TAKE_AWAITING_QTY':
      return { next: prev };
    case 'ADD_AWAITING_BIN': {
      if (raw.startsWith('BIN:')) {
        return { next: { mode: 'ADD_AWAITING_QTY', qty: 1, targetLabel: raw } };
      }
      return { next: prev };
    }
    case 'ADD_AWAITING_QTY':
      return { next: prev };
    case 'PULL_AWAITING_PROJECT': {
      if (raw.startsWith('PRJ:')) {
        return { next: { mode: 'PULL_AWAITING_BIN', qty: 1, targetLabel: raw } };
      }
      return { next: prev };
    }
    case 'PULL_AWAITING_BIN': {
      if (raw.startsWith('BIN:') || raw.startsWith('PBIN:')) {
        return {
          next: { mode: 'PULL_AWAITING_QTY', qty: 1, targetLabel: raw },
        };
      }
      return { next: prev };
    }
    case 'PULL_AWAITING_QTY':
      return { next: prev };
    case 'MOVE_AWAITING_CONTAINER': {
      if (raw.startsWith('BIN:') || raw.startsWith('PBIN:')) {
        return { next: { mode: 'MOVE_AWAITING_DEST', qty: 1, targetLabel: raw } };
      }
      return { next: prev };
    }
    case 'MOVE_AWAITING_DEST':
      return { next: prev };
    case 'NEW_AWAITING_SCAN': {
      return { next: prev, navigationRaw: raw };
    }
    default:
      return { next: prev };
  }
}
