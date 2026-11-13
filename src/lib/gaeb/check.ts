import { bidderComplete, type Bidder } from './export84';
import type { Lv } from './model';
import { computeTotals, type Prices } from './totals';

export interface CheckEntry {
  key: string;
  status: 'done' | 'blocking' | 'warning';
  text: string;
  /** Item id a link should jump to. */
  itemId?: string;
}

export interface CheckResult {
  entries: CheckEntry[];
  canExport: boolean;
  unpriced: number;
}

export function checkBid(lv: Lv, prices: Prices, bidder: Bidder): CheckResult {
  const entries: CheckEntry[] = [];
  let unpriced = 0;
  for (const i of lv.items) {
    if (i.notAppl || i.alternative) continue;
    if (prices[i.id] == null) {
      unpriced++;
      entries.push({ key: `u-${i.id}`, status: 'blocking', text: `Position ${i.oz} hat keinen Einheitspreis`, itemId: i.id });
    }
  }
  for (const i of lv.items) {
    if (prices[i.id] === 0 && !i.notAppl) {
      entries.push({ key: `z-${i.id}`, status: 'warning', text: `Position ${i.oz} ist mit 0,00 € bepreist`, itemId: i.id });
    }
  }
  for (const i of lv.items) {
    if (i.complements.length > 0 && !i.notAppl) {
      entries.push({ key: `c-${i.id}`, status: 'warning', text: `Position ${i.oz} enthält eine Bieterergänzung (Textergänzung); sie bleibt unverändert in der X84`, itemId: i.id });
    }
  }
  if (!bidderComplete(bidder)) {
    entries.push({ key: 'bidder', status: 'blocking', text: 'Firma und Anschrift fehlen' });
  }
  const t = computeTotals(lv, prices);
  const gpSum = lv.items.reduce((s, i) => (t.excluded[i.id] ? s : s + (t.gp[i.id] ?? 0)), 0);
  if (gpSum !== t.net) {
    entries.push({ key: 'guard', status: 'blocking', text: 'Interne Summenprüfung fehlgeschlagen' });
  }
  const blocking = entries.some((e) => e.status === 'blocking');
  if (!blocking) entries.unshift({ key: 'ok', status: 'done', text: 'Alle Pflichtpositionen bepreist, Firma eingetragen' });
  return { entries, canExport: !blocking, unpriced };
}
