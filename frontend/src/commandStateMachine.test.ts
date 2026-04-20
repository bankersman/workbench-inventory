import { describe, expect, it } from 'vitest';

import { initialCommandState, reduceCommandState } from './commandStateMachine';

describe('reduceCommandState', () => {
  it('IDLE + CMD:TAKE → TAKE_AWAITING_BIN', () => {
    const r = reduceCommandState(initialCommandState(), 'CMD:TAKE');
    expect(r.next.mode).toBe('TAKE_AWAITING_BIN');
  });

  it('TAKE_AWAITING_BIN + BIN: → TAKE_AWAITING_QTY', () => {
    let s = reduceCommandState(initialCommandState(), 'CMD:TAKE').next;
    s = reduceCommandState(s, 'BIN:00123').next;
    expect(s.mode).toBe('TAKE_AWAITING_QTY');
    expect(s.qty).toBe(1);
  });

  it('accumulates QTY in TAKE_AWAITING_QTY', () => {
    let s = initialCommandState();
    s = reduceCommandState(s, 'CMD:TAKE').next;
    s = reduceCommandState(s, 'BIN:00123').next;
    s = reduceCommandState(s, 'QTY:10').next;
    s = reduceCommandState(s, 'QTY:5').next;
    expect(s.mode).toBe('TAKE_AWAITING_QTY');
    expect(s.qty).toBe(16);
  });

  it('CMD:CANCEL returns IDLE', () => {
    let s = reduceCommandState(initialCommandState(), 'CMD:TAKE').next;
    s = reduceCommandState(s, 'CMD:CANCEL').next;
    expect(s.mode).toBe('IDLE');
  });
});
