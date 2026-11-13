import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseGaeb } from './parse';
import { renderPrintTable } from './print';
import { computeTotals } from './totals';
import { formatEUR } from './number';

const lv = parseGaeb(readFileSync('tests/fixtures/gaeb/synthetic/v33-basic.X83', 'utf8'));
const prices = Object.fromEntries(lv.items.map((i) => [i.id, 1050]));

describe('renderPrintTable', () => {
  const html = renderPrintTable(lv, prices, { firma: 'Müller & Söhne', strasse: 'Weg 1', plz: '10115', ort: 'Berlin' }, '13.11.2026');
  it('has the six column heads', () => {
    for (const h of ['OZ', 'Kurztext', 'Menge', 'Einheit', 'EP', 'GP']) expect(html).toContain(`>${h}</th>`);
  });
  it('shows the net total, bidder (escaped) and date', () => {
    expect(html).toContain(formatEUR(computeTotals(lv, prices).net));
    expect(html).toContain('Müller &amp; Söhne');
    expect(html).toContain('13.11.2026');
  });
});
