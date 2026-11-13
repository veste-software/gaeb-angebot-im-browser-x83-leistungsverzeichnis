import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkBid } from './check';
import { emptyBidder } from './export84';
import { parseGaeb } from './parse';

const xml = readFileSync(new URL('../../../tests/fixtures/gaeb/synthetic/v33-basic.X83', import.meta.url), 'utf8');
const lv = parseGaeb(xml);
const bidder = { firma: 'A', strasse: 'B', plz: '1', ort: 'C' };

describe('checkBid', () => {
  it('blocks while items are unpriced and the bidder is empty', () => {
    const r = checkBid(lv, {}, emptyBidder);
    expect(r.canExport).toBe(false);
    expect(r.unpriced).toBe(5);
    expect(r.entries.some((e) => e.key === 'bidder')).toBe(true);
  });
  it('warns on 0,00 but does not block', () => {
    const prices = Object.fromEntries(lv.items.map((i) => [i.id, 0]));
    const r = checkBid(lv, prices, bidder);
    expect(r.canExport).toBe(true);
    expect(r.entries.filter((e) => e.status === 'warning')).toHaveLength(5);
  });
  it('is clear when all is priced', () => {
    const prices = Object.fromEntries(lv.items.map((i) => [i.id, 100]));
    const r = checkBid(lv, prices, bidder);
    expect(r.canExport).toBe(true);
    expect(r.entries[0].status).toBe('done');
  });
});
