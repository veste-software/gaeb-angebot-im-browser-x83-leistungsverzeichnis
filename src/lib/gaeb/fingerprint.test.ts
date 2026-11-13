import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fingerprint } from './fingerprint';
import { parseGaeb } from './parse';

const xml = readFileSync(new URL('../../../tests/fixtures/gaeb/synthetic/v33-basic.X83', import.meta.url), 'utf8');

describe('fingerprint', () => {
  it('is 64 hex chars and stable when only texts or prices change', async () => {
    const a = await fingerprint(parseGaeb(xml));
    const b = await fingerprint(parseGaeb(xml.replace('Untergrund reinigen', 'Untergrund säubern')));
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(b).toBe(a);
  });
  it('changes when the item structure changes', async () => {
    const a = await fingerprint(parseGaeb(xml));
    const c = await fingerprint(parseGaeb(xml.replace('RNoPart="0030"', 'RNoPart="0040"')));
    expect(c).not.toBe(a);
  });
});
