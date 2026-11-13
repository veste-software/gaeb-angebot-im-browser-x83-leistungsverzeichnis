import { describe, expect, it } from 'vitest';
import { deserialise, restoredMessage, serialise } from './saved';
import { emptyBidder } from './gaeb/export84';

describe('saved state', () => {
  it('round-trips and drops empty inputs', () => {
    const raw = serialise({ a: '12,50', b: ' ' }, emptyBidder, 1000);
    const s = deserialise(raw);
    expect(s?.inputs).toEqual({ a: '12,50' });
    expect(s?.savedAt).toBe(1000);
  });
  it('rejects garbage', () => {
    expect(deserialise('nope')).toBeNull();
    expect(deserialise(undefined)).toBeNull();
    expect(deserialise('{"v":2}')).toBeNull();
    expect(deserialise('{"v":1,"savedAt":1,"inputs":{"a":3},"bidder":{}}')).toBeNull();
  });
  it('formats the restore message', () => {
    expect(restoredMessage(new Date(2026, 10, 12).getTime())).toBe('Preise vom 12.11.2026 wiederhergestellt');
  });
});
