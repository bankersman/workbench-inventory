import { useCallback, useEffect, useState } from 'react';

import { type CommandState, initialCommandState, reduceCommandState } from './commandStateMachine';
import { SCAN_LINE_EVENT } from './scanBridge';

export interface UseCommandStateResult {
  state: CommandState;
  dispatchLine: (raw: string) => void;
  /** Stepper for quantity while in *\_AWAITING_QTY modes (PLAN status bar). */
  adjustQty: (delta: number) => void;
  reset: () => void;
}

/**
 * Command-mode state machine; listens for `workbench-scan-line` (touch palette).
 * Wire hardware scans separately: `useEffect(() => { if (line) dispatchLine(line); }, [line])`.
 */
export function useCommandState(): UseCommandStateResult {
  const [state, setState] = useState<CommandState>(initialCommandState);

  const dispatchLine = useCallback((raw: string) => {
    setState((prev) => reduceCommandState(prev, raw).next);
  }, []);

  const reset = useCallback(() => setState(initialCommandState()), []);

  const adjustQty = useCallback((delta: number) => {
    setState((prev) => {
      if (
        prev.mode !== 'TAKE_AWAITING_QTY' &&
        prev.mode !== 'ADD_AWAITING_QTY' &&
        prev.mode !== 'PULL_AWAITING_QTY'
      ) {
        return prev;
      }
      const nextQty = Math.max(1, prev.qty + delta);
      return { ...prev, qty: nextQty };
    });
  }, []);

  useEffect(() => {
    const handler = (ev: Event) => {
      const ce = ev as CustomEvent<{ raw?: string }>;
      const raw = ce.detail?.raw;
      if (typeof raw === 'string') {
        dispatchLine(raw);
      }
    };
    window.addEventListener(SCAN_LINE_EVENT, handler);
    return () => window.removeEventListener(SCAN_LINE_EVENT, handler);
  }, [dispatchLine]);

  return { state, dispatchLine, adjustQty, reset };
}
