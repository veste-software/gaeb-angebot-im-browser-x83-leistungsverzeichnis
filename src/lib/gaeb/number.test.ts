import { describe, expect, it } from 'vitest';
import { centsToInput, formatEUR, gpCents, parseGermanNumber, toCents } from './number';

describe('parseGermanNumber', () => {
  it('reads German and plain decimals', () => {
    expect(parseGermanNumber('1.234,5')).toBe(1234.5);
    expect(parseGermanNumber('1234,50')).toBe(1234.5);
    expect(parseGermanNumber('1234.50')).toBe(1234.5);
    expect(parseGermanNumber('1.234.567')).toBe(1234567);
    expect(parseGermanNumber(' 12 € ')).toBe(12);
    expect(parseGermanNumber('0,005')).toBe(0.005);
  });
  it('rejects garbage', () => {
    for (const s of ['', 'abc', '1,2,3', '-5', '12,5x', '1..2']) expect(parseGermanNumber(s)).toBeNull();
  });
});

describe('money', () => {
  it('rounds half-up to cents', () => {
    expect(toCents(0.005)).toBe(1);
    expect(toCents(1.005)).toBe(101);
    expect(toCents(2.35)).toBe(235);
  });
  it('GP = half-up(qty × EP)', () => {
    expect(gpCents(125.5, 235)).toBe(29493);
    expect(gpCents(18.75, 999)).toBe(18731);
    expect(gpCents(0.5, 1)).toBe(1);
    expect(gpCents(0, 5000)).toBe(0);
  });
  it('formats', () => {
    expect(formatEUR(697194).replace(/ /g, ' ')).toBe('6.971,94 €');
    expect(centsToInput(235)).toBe('2,35');
  });
});
