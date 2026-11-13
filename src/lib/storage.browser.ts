import { del, get, keys, set } from 'idb-keyval';
import type { Bidder } from './gaeb/export84';
import { deserialise, serialise, type SavedState } from './saved';

const PREFIX = 'lv:';
export const TOKEN_KEY = 'lv-unlock-token';

export async function saveState(fp: string, inputs: Record<string, string>, bidder: Bidder): Promise<void> {
  try {
    await set(PREFIX + fp, serialise(inputs, bidder, Date.now()));
  } catch {
    /* storage unavailable (private mode): working without autosave */
  }
}

export async function loadState(fp: string): Promise<SavedState | null> {
  try {
    return deserialise(await get(PREFIX + fp));
  } catch {
    return null;
  }
}

/** Clears every stored LV and the unlock token. The caller asks for confirmation first. */
export async function clearAll(): Promise<void> {
  try {
    for (const k of await keys()) if (typeof k === 'string' && k.startsWith(PREFIX)) await del(k);
  } catch {
    /* nothing to clear */
  }
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
