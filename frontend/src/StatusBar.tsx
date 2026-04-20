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
    <header className="status-bar" role="status">
      <div className="status-bar-row">
        <span className="status-mode">{state.mode.replace(/_/g, ' ')}</span>
        {state.targetLabel ? <span className="status-target">• {state.targetLabel}</span> : null}
        <span className="status-qty">Qty: {state.qty}</span>
      </div>
      <div className="status-actions">
        <button type="button" className="status-btn" onClick={onDecQty}>
          −
        </button>
        <button type="button" className="status-btn" onClick={onIncQty}>
          +
        </button>
        <button type="button" className="status-btn status-btn-danger" onClick={onCancel}>
          ✕
        </button>
        <button type="button" className="status-btn status-btn-primary" onClick={onConfirm}>
          ✓
        </button>
      </div>
    </header>
  );
}
