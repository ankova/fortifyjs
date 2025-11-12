import { describe, it, expect } from 'vitest';

import { ok, err, isOk, isErr, type Result } from '../src';

describe('Result', () => {
  it('ok/err helpers', () => {
    const a: Result<number> = ok(1);
    const b: Result<number> = err(new Error('x'));
    expect(isOk(a)).toBe(true);
    expect(isErr(b)).toBe(true);
  });
});
