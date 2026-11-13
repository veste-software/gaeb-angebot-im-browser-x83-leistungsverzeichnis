import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { exportX84, x84FileName, type Bidder } from './export84';
import { parseGaeb } from './parse';
import { toCents } from './number';
import { computeTotals, type Prices } from './totals';

const dir = new URL('../../../tests/fixtures/gaeb/synthetic/', import.meta.url);
const bidder: Bidder = { firma: 'Maler Müller GmbH', strasse: 'Hauptstraße 1', plz: '12345', ort: 'Beispielstadt' };

describe.each(readdirSync(dir).filter((f) => f.endsWith('.expected.json')))('export %s', (file) => {
  const exp = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  const xml = readFileSync(new URL(file.replace('.expected.json', '.X83'), dir), 'utf8');
  const lv = parseGaeb(xml);
  const prices: Prices = {};
  for (const i of lv.items) prices[i.id] = toCents(exp.prices[i.oz]);
  const out = exportX84(xml, prices, bidder);
  const back = parseGaeb(out);

  it('is phase 84 in the DA84 namespace', () => {
    expect(back.phase).toBe(84);
    expect(back.namespace).toContain('DA84');
    expect(out).toContain('Maler Müller GmbH');
  });
  it('keeps the item list unchanged (K8)', () => {
    const key = (l: typeof lv) => l.items.map((i) => [i.id, i.oz, i.qty, i.qu, i.shortText, i.longText]);
    expect(key(back)).toEqual(key(lv));
  });
  it('re-imports with the same EPs, GPs and total (K9)', () => {
    const p2: Prices = {};
    for (const i of back.items) p2[i.id] = i.up;
    expect(p2).toEqual(prices);
    expect(computeTotals(back, p2).net).toBe(toCents(exp.netTotal));
  });
});

describe('x84FileName', () => {
  it('swaps the extension', () => {
    expect(x84FileName('LV Maler.X83')).toBe('LV Maler.X84');
    expect(x84FileName('a.xml')).toBe('a.X84');
  });
});
