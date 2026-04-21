import type { CommandState } from './commandStateMachine';

interface StatusBarProps {
  state: CommandState;
  onCancel: () => void;
  onConfirm: () => void;
  onDecQty: () => void;
  onIncQty: () => void;
}

export function StatusBar({ state, onCancel, onConfirm, onDecQty, onIncQty }: StatusBarProps) {
  if (state.mode === 'IDLE') {
    return null;
  }

  return (
    <header
      className="border-b border-stone-200 bg-stone-100/95 px-3 py-2.5 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95"
      role="status"
    >
      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
        <span className="font-semibold">{state.mode.replace(/_/g, ' ')}</span>
        {state.targetLabel ? (
          <span className="text-zinc-600 dark:text-zinc-400">• {state.targetLabel}</span>
        ) : null}
        <span className="text-zinc-600 dark:text-zinc-400">Qty: {state.qty}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 min-w-11 rounded-xl border border-stone-300 bg-white text-lg font-medium text-zinc-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          onClick={onDecQty}
        >
          −
        </button>
        <button
          type="button"
          className="min-h-11 min-w-11 rounded-xl border border-stone-300 bg-white text-lg font-medium text-zinc-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          onClick={onIncQty}
        >
          +
        </button>
        <button
          type="button"
          className="min-h-11 min-w-11 rounded-xl border border-red-300 bg-red-50 text-lg text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
          onClick={onCancel}
        >
          ✕
        </button>
        <button
          type="button"
          className="min-h-11 min-w-11 rounded-xl border border-violet-400 bg-violet-100 text-lg font-medium text-violet-900 dark:border-violet-600 dark:bg-violet-950/60 dark:text-violet-100"
          onClick={onConfirm}
        >
          ✓
        </button>
      </div>
    </header>
  );
}
