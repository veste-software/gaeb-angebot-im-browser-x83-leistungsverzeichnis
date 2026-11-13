import type { Bidder } from './gaeb/export84';

export interface SavedState {
  v: 1;
  savedAt: number;
  inputs: Record<string, string>;
  bidder: Bidder;
}

export function serialise(inputs: Record<string, string>, bidder: Bidder, savedAt: number): string {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(inputs)) if (v.trim() !== '') clean[k] = v;
  const s: SavedState = { v: 1, savedAt, inputs: clean, bidder };
  return JSON.stringify(s);
}

export function deserialise(raw: unknown): SavedState | null {
  try {
    if (typeof raw !== 'string') return null;
    const s = JSON.parse(raw) as SavedState;
    if (s.v !== 1 || typeof s.savedAt !== 'number' || typeof s.inputs !== 'object' || !s.inputs || typeof s.bidder !== 'object' || !s.bidder) return null;
    for (const v of Object.values(s.inputs)) if (typeof v !== 'string') return null;
    return s;
  } catch {
    return null;
  }
}

export function restoredMessage(savedAt: number): string {
  const d = new Date(savedAt);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `Preise vom ${dd}.${mm}.${d.getFullYear()} wiederhergestellt`;
}
