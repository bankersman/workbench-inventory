import { useCallback, useEffect, useRef, useState } from 'react';

import { type CommandState, initialCommandState, reduceCommandState } from './commandStateMachine';
import { SCAN_LINE_EVENT } from './scanBridge';

const IDLE_TIMEOUT_MS = 30_000;
const WARN_BEFORE_MS = 5_000;

export interface UseCommandStateResult {
  state: CommandState;
  dispatchLine: (raw: string) => void;
  /** Stepper for quantity while in *\_AWAITING_QTY modes (PLAN status bar). */
  adjustQty: (delta: number) => void;
  reset: () => void;
  /** True in the last few seconds before inactivity timeout resets command mode. */
  inactiveWarn: boolean;
}

/**
 * Command-mode state machine; listens for `workbench-scan-line` (touch palette).
 * Wire hardware scans separately: `useEffect(() => { if (line) dispatchLine(line); }, [line])`.
 */
export function useCommandState(): UseCommandStateResult {
  const [state, setState] = useState<CommandState>(initialCommandState);
  const [inactiveWarn, setInactiveWarn] = useState(false);
  const lastActivityRef = useRef(0);

  const bumpActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setInactiveWarn(false);
  }, []);

  const dispatchLine = useCallback(
    (raw: string) => {
      bumpActivity();
      setState((prev) => reduceCommandState(prev, raw).next);
    },
    [bumpActivity],
  );

  const reset = useCallback(() => {
    bumpActivity();
    setState(initialCommandState());
  }, [bumpActivity]);

  const adjustQty = useCallback(
    (delta: number) => {
      bumpActivity();
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
    },
    [bumpActivity],
  );

  useEffect(() => {
    if (state.mode === 'IDLE') {
      queueMicrotask(() => {
        setInactiveWarn(false);
      });
      return;
    }
    lastActivityRef.current = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_TIMEOUT_MS - WARN_BEFORE_MS && elapsed < IDLE_TIMEOUT_MS) {
        setInactiveWarn(true);
      } else if (elapsed < IDLE_TIMEOUT_MS - WARN_BEFORE_MS) {
        setInactiveWarn(false);
      }
      if (elapsed >= IDLE_TIMEOUT_MS) {
        setInactiveWarn(false);
        setState(initialCommandState());
      }
    }, 400);
    return () => clearInterval(id);
  }, [state.mode]);

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

  return { state, dispatchLine, adjustQty, reset, inactiveWarn };
}
