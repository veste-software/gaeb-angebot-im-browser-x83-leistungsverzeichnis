import type { Lv } from './model';

/** SHA-256 hex over project name, BoQ ID, item IDs and OZ. Prices and texts do not change it. */
export async function fingerprint(lv: Lv): Promise<string> {
  const text = [lv.projectName, lv.boqId, ...lv.items.map((i) => `${i.id}|${i.oz}`)].join('\n');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
