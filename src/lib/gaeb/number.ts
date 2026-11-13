/** Parse a German or plain decimal ("1.234,5", "1234,50", "1234.50"). Garbage and negatives give null. */
export function parseGermanNumber(input: string): number | null {
  let s = input.replace(/[\s€ ]/g, '');
  if (!s) return null;
  if (s.includes(',')) {
    if (!/^\d{1,3}(\.\d{3})*,\d*$|^\d*,\d+$/.test(s)) return null;
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3}){2,}$/.test(s)) {
    s = s.replace(/\./g, '');
  } else if (!/^\d+\.?\d*$|^\.\d+$/.test(s)) {
    return null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Euro amount to integer cents, half-up (immune to 1.005 * 100 = 100.4999…). */
export function toCents(euro: number): number {
  return Math.round(Number((euro * 100).toPrecision(12)));
}

/** Total price of one item in cents: round half-up(qty × EP). Quantities carry up to 3 decimals. */
export function gpCents(qty: number, epCents: number): number {
  const milli = Math.round(qty * 1000);
  return Math.floor((milli * epCents + 500) / 1000);
}

const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
export function formatEUR(cents: number): string {
  return eur.format(cents / 100);
}

const qtyFmt = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
export function formatQty(qty: number): string {
  return qtyFmt.format(qty);
}

/** Cents as plain input text, "1234,50". */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

/** Cents as XML decimal, "1234.50". */
export function centsToXml(cents: number): string {
  return (cents / 100).toFixed(2);
}
