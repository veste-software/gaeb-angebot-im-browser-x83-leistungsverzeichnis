import { XMLSerializer } from '@xmldom/xmldom';
import { centsToXml } from './number';
import { kids, parseGaeb, parseXml } from './parse';
import { computeTotals, type Prices } from './totals';

// XSD-TODO: element order and names for UP, IT, Totals and CTR are unchecked against the X84 XSD.

export interface Bidder {
  firma: string;
  strasse: string;
  plz: string;
  ort: string;
}

export const emptyBidder: Bidder = { firma: '', strasse: '', plz: '', ort: '' };

export function bidderComplete(b: Bidder): boolean {
  return [b.firma, b.strasse, b.plz, b.ort].every((s) => s.trim() !== '');
}

/** Turn an X83 into an X84: same structure, same IDs, plus UP/IT per item, totals and bidder. */
export function exportX84(xmlText: string, prices: Prices, bidder: Bidder): string {
  const lv = parseGaeb(xmlText);
  const totals = computeTotals(lv, prices);
  const doc = parseXml(xmlText);
  const root = doc.documentElement;
  const ns = root.namespaceURI ?? '';
  const mk = (name: string, txt?: string) => {
    const e = doc.createElementNS(ns, name);
    if (txt !== undefined) e.appendChild(doc.createTextNode(txt));
    return e;
  };
  const award = kids(root, 'Award')[0];

  const dp = kids(award, 'DP')[0];
  if (dp) dp.textContent = '84';

  // bidder
  for (const old of kids(award, 'CTR')) award.removeChild(old);
  const ctr = mk('CTR');
  const addr = mk('Address');
  addr.appendChild(mk('Name1', bidder.firma.trim()));
  addr.appendChild(mk('Street', bidder.strasse.trim()));
  addr.appendChild(mk('PCode', bidder.plz.trim()));
  addr.appendChild(mk('City', bidder.ort.trim()));
  ctr.appendChild(addr);
  const own = kids(award, 'OWN')[0] ?? dp;
  award.insertBefore(ctr, own ? own.nextSibling : award.firstChild);

  const byId = new Map(lv.items.map((i) => [i.id, i]));
  const all = doc.getElementsByTagName('*');
  const itemEls: Element[] = [];
  const ctgyEls: Element[] = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].localName === 'Item') itemEls.push(all[i]);
    if (all[i].localName === 'BoQCtgy') ctgyEls.push(all[i]);
  }
  for (const el of itemEls) {
    const id = el.getAttribute('ID') ?? '';
    for (const tag of ['UP', 'IT']) for (const old of kids(el, tag)) el.removeChild(old);
    const ep = prices[id];
    if (ep == null || !byId.has(id)) continue;
    const anchor = kids(el, 'QU')[0] ?? kids(el, 'Qty')[0];
    const up = mk('UP', centsToXml(ep));
    const it = mk('IT', centsToXml(totals.gp[id] ?? 0));
    el.insertBefore(up, anchor ? anchor.nextSibling : el.firstChild);
    el.insertBefore(it, up.nextSibling);
  }
  const totalsEl = (v: number) => {
    const t = mk('Totals');
    t.appendChild(mk('Total', centsToXml(v)));
    return t;
  };
  for (const el of ctgyEls) {
    for (const old of kids(el, 'Totals')) el.removeChild(old);
    el.appendChild(totalsEl(totals.categories[el.getAttribute('ID') ?? ''] ?? 0));
  }
  const boq = kids(award, 'BoQ')[0];
  for (const old of kids(boq, 'Totals')) boq.removeChild(old);
  boq.appendChild(totalsEl(totals.net));

  let out = new XMLSerializer().serializeToString(doc as never);
  out = out.replace(/(<GAEB\b[^>]*GAEB_DA_XML\/)DA83/, '$1DA84');
  if (!out.startsWith('<?xml')) out = `<?xml version="1.0" encoding="UTF-8"?>\n${out}`;
  return out;
}

/** "Leistungsverzeichnis.X83" → "Leistungsverzeichnis.X84" */
export function x84FileName(original: string): string {
  const base = original.replace(/\.(x83|x84|xml)$/i, '');
  return `${base || 'Angebot'}.X84`;
}
