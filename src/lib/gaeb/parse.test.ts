import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseGaeb } from './parse';
import { computeTotals, type Prices } from './totals';
import { toCents } from './number';

const dir = new URL('../../../tests/fixtures/gaeb/synthetic/', import.meta.url);
const names = readdirSync(dir).filter((f) => f.endsWith('.expected.json'));

describe.each(names)('fixture %s', (file) => {
  const exp = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  const xml = readFileSync(new URL(file.replace('.expected.json', '.X83'), dir), 'utf8');
  const lv = parseGaeb(xml);

  it('parses structure', () => {
    expect(lv.version).toBe(exp.version);
    expect(lv.phase).toBe(exp.phase);
    expect(lv.projectName).toBe(exp.projectName);
    expect(lv.items).toHaveLength(exp.itemCount);
    expect(lv.categories).toHaveLength(exp.categoryCount);
    expect(lv.items.map((i) => i.oz)).toEqual(exp.oz);
    expect(lv.items.map((i) => i.qty)).toEqual(exp.qty);
    expect(lv.items.map((i) => i.qu)).toEqual(exp.qu);
    expect(lv.items.map((i) => i.shortText)).toEqual(exp.shortText);
  });

  it('computes the net total to the cent', () => {
    const prices: Prices = {};
    for (const i of lv.items) prices[i.id] = toCents(exp.prices[i.oz]);
    const t = computeTotals(lv, prices);
    expect(t.net).toBe(toCents(exp.netTotal));
    for (const i of lv.items) expect(t.gp[i.id]).toBe(toCents(exp.gp[i.oz]));
  });
});

describe.each(['v32-full.X83', 'v33-full.X83'])('full fixture %s', (file) => {
  const lv = parseGaeb(readFileSync(new URL(file, dir), 'utf8'));
  const byOz = (oz: string) => lv.items.find((i) => i.oz === oz)!;
  it('flags Bedarf, alternative and zero-quantity items', () => {
    expect(byOz('01.02.0010').withoutTotal).toBe(true);
    expect(byOz('01.02.0020').withoutTotal).toBe(false);
    expect(byOz('02.0010').alternative).toBe(false);
    expect(byOz('02.0020').alternative).toBe(true);
    expect(byOz('02.0040').qty).toBe(0);
    expect(byOz('01.01.0020').qty).toBe(3.125);
  });
});

describe('parse errors', () => {
  it('rejects non-GAEB input with a German message', () => {
    expect(() => parseGaeb('<html/>')).toThrow(/GAEB/);
  });
});
