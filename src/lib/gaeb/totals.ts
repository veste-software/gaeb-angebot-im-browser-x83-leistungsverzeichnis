import type { Category, Item, Lv } from './model';
import { gpCents } from './number';

/** EP per item id in cents; missing or null means unpriced. */
export type Prices = Record<string, number | null | undefined>;

export interface Totals {
  gp: Record<string, number | null>;
  /** Reason why an item does not count into the sums. */
  excluded: Record<string, string>;
  categories: Record<string, number>;
  net: number;
}

export function excludedReason(item: Item): string | null {
  if (item.notAppl) return 'entfällt';
  if (item.withoutTotal) return 'Bedarfsposition ohne Gesamtbetrag';
  if (item.alternative) return 'Wahlposition';
  return null;
}

export function computeTotals(lv: Lv, prices: Prices): Totals {
  const gp: Record<string, number | null> = {};
  const excluded: Record<string, string> = {};
  const categories: Record<string, number> = {};

  const sum = (nodes: Array<Category | Item>): number => {
    let total = 0;
    for (const n of nodes) {
      if (n.kind === 'item') {
        const ep = prices[n.id];
        const g = ep == null ? null : gpCents(n.qty, ep);
        gp[n.id] = g;
        const why = excludedReason(n);
        if (why) excluded[n.id] = why;
        else if (g != null) total += g;
      } else {
        const sub = sum(n.children);
        categories[n.id] = sub;
        total += sub;
      }
    }
    return total;
  };
  const net = sum(lv.nodes);
  return { gp, excluded, categories, net };
}
