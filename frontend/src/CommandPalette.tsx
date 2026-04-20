import { useState } from 'react';

import { emitScanLine } from './scanBridge';

const COMMAND_CODES = [
  'CMD:TAKE',
  'CMD:ADD',
  'CMD:PULL',
  'CMD:MOVE',
  'CMD:NEW',
  'CMD:CONFIRM',
  'CMD:CANCEL',
] as const;

const QTY_CODES = [
  'QTY:1',
  'QTY:2',
  'QTY:3',
  'QTY:4',
  'QTY:5',
  'QTY:10',
  'QTY:20',
  'QTY:50',
  'QTY:100',
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  function send(raw: string) {
    emitScanLine(raw);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="command-fab"
        aria-label="Open command palette"
        onClick={() => setOpen(true)}
      >
        ⌘
      </button>
      {open ? (
        <div className="command-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="command-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Scanner commands"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="command-sheet-title">Commands</h2>
            <div className="command-grid">
              {COMMAND_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  className="command-tile"
                  onClick={() => send(code)}
                >
                  {code.replace('CMD:', '')}
                </button>
              ))}
            </div>
            <h3 className="command-sheet-sub">Quantity</h3>
            <div className="command-grid command-grid-qty">
              {QTY_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  className="command-tile"
                  onClick={() => send(code)}
                >
                  {code.replace('QTY:', '')}
                </button>
              ))}
            </div>
            <button type="button" className="command-close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
