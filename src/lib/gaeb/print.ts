import type { Category, Item, Lv } from './model';
import { computeTotals, excludedReason, type Prices } from './totals';
import { formatEUR, formatQty } from './number';
import type { Bidder } from './export84';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Printable price list (A4): OZ, Kurztext, Menge, Einheit, EP, GP, subtotals, net total, bidder and date. */
export function renderPrintTable(lv: Lv, prices: Prices, bidder: Bidder, date: string): string {
  const totals = computeTotals(lv, prices);
  const rows: string[] = [];
  const walk = (nodes: Array<Category | Item>): void => {
    for (const n of nodes) {
      if (n.kind === 'cat') {
        rows.push(`<tr class="p-cat"><th colspan="6" scope="colgroup">${esc(n.oz)} ${esc(n.label)}</th></tr>`);
        walk(n.children);
        rows.push(`<tr class="p-sum"><td colspan="5">Summe ${esc(n.oz)}</td><td class="num">${formatEUR(totals.categories[n.id] ?? 0)}</td></tr>`);
      } else {
        const ep = prices[n.id];
        const gp = totals.gp[n.id];
        const why = excludedReason(n);
        rows.push(
          `<tr><td>${esc(n.oz)}</td><td>${esc(n.shortText)}${why ? ` <em>(${esc(why)})</em>` : ''}</td>` +
            `<td class="num">${formatQty(n.qty)}</td><td>${esc(n.qu)}</td>` +
            `<td class="num">${ep == null ? '' : formatEUR(ep)}</td><td class="num">${gp == null ? '' : formatEUR(gp)}</td></tr>`,
        );
      }
    }
  };
  walk(lv.nodes);
  const who = [bidder.firma, bidder.strasse, [bidder.plz, bidder.ort].filter(Boolean).join(' ')].filter((s) => s.trim()).join(', ');
  return (
    `<h1>${esc(lv.projectName || 'Leistungsverzeichnis')}</h1>` +
    `<p>${esc(who)}${who ? ' · ' : ''}${esc(date)}</p>` +
    `<table><thead><tr><th>OZ</th><th>Kurztext</th><th class="num">Menge</th><th>Einheit</th><th class="num">EP</th><th class="num">GP</th></tr></thead>` +
    `<tbody>${rows.join('')}</tbody>` +
    `<tfoot><tr><td colspan="5">Angebotssumme netto</td><td class="num">${formatEUR(totals.net)}</td></tr></tfoot></table>`
  );
}
