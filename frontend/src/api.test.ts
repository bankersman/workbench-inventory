import { describe, expect, it } from 'vitest';

import { parseApiErrorMessage } from './api';

describe('parseApiErrorMessage', () => {
  it('returns status text when body is empty', () => {
    expect(parseApiErrorMessage('', 502, 'Bad Gateway')).toBe('Bad Gateway (502)');
  });

  it('parses Nest message string', () => {
    expect(parseApiErrorMessage('{"message":"Not found"}', 404, 'Not Found')).toBe('Not found');
  });

  it('joins message array', () => {
    expect(parseApiErrorMessage('{"message":["a","b"]}', 400, 'Bad Request')).toBe('a; b');
  });

  it('falls back to error field', () => {
    expect(parseApiErrorMessage('{"error":"Conflict"}', 409, 'Conflict')).toBe('Conflict');
  });

  it('returns raw body when JSON has no message', () => {
    expect(parseApiErrorMessage('plain', 500, 'Error')).toBe('plain');
  });
});
