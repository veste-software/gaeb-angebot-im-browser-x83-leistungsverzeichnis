import * as ed from '@noble/ed25519';
import { describe, expect, it } from 'vitest';
import { b64urlDecode, b64urlEncode, signToken, verifyToken } from './token';

const priv = ed.etc.bytesToHex(ed.utils.randomPrivateKey());
const otherPriv = ed.etc.bytesToHex(ed.utils.randomPrivateKey());
const FP = 'a'.repeat(64);
const NOW = 1_800_000_000;
const DAY = 86400;

async function pub(k: string) {
  return ed.etc.bytesToHex(await ed.getPublicKeyAsync(k));
}

describe('unlock tokens', () => {
  it('base64url round-trips', () => {
    const b = new Uint8Array([251, 255, 0, 1, 62, 63]);
    expect(Array.from(b64urlDecode(b64urlEncode(b)))).toEqual(Array.from(b));
  });

  it('single token is valid for its fingerprint only', async () => {
    const t = await signToken({ v: 1, kind: 'single', fp: FP, exp: NOW + 30 * DAY }, priv);
    const pk = await pub(priv);
    expect(await verifyToken(t, pk, { fingerprint: FP, now: NOW })).not.toBeNull();
    expect(await verifyToken(t, pk, { fingerprint: 'b'.repeat(64), now: NOW })).toBeNull();
  });

  it('single token longer than 60 days is rejected', async () => {
    const t = await signToken({ v: 1, kind: 'single', fp: FP, exp: NOW + 61 * DAY }, priv);
    expect(await verifyToken(t, await pub(priv), { fingerprint: FP, now: NOW })).toBeNull();
  });

  it('year token works for any LV, up to 365 days', async () => {
    const pk = await pub(priv);
    const ok = await signToken({ v: 1, kind: 'year', exp: NOW + 365 * DAY }, priv);
    const long = await signToken({ v: 1, kind: 'year', exp: NOW + 366 * DAY }, priv);
    expect(await verifyToken(ok, pk, { fingerprint: 'c'.repeat(64), now: NOW })).not.toBeNull();
    expect(await verifyToken(long, pk, { fingerprint: FP, now: NOW })).toBeNull();
  });

  it('rejects expired, flipped, wrong-key and malformed tokens', async () => {
    const pk = await pub(priv);
    const ctx = { fingerprint: FP, now: NOW };
    const expired = await signToken({ v: 1, kind: 'year', exp: NOW - 1 }, priv);
    expect(await verifyToken(expired, pk, ctx)).toBeNull();

    const t = await signToken({ v: 1, kind: 'year', exp: NOW + DAY }, priv);
    const [body, sig] = t.split('.');
    const bytes = b64urlDecode(sig);
    bytes[0] ^= 1;
    expect(await verifyToken(`${body}.${b64urlEncode(bytes)}`, pk, ctx)).toBeNull();
    expect(await verifyToken(t, await pub(otherPriv), ctx)).toBeNull();
    expect(await verifyToken('nonsense', pk, ctx)).toBeNull();
    expect(await verifyToken('', pk, ctx)).toBeNull();
  });
});
