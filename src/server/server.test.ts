import { describe, expect, it } from 'vitest';
import * as ed from '@noble/ed25519';
import { handleCheckout } from './checkout';
import { handleUnlock } from './unlock';
import { buildCheckoutRequest } from '../lib/unlock/checkout';
import { verifyToken } from '../lib/unlock/token';

const fp = 'a'.repeat(64);
const env = { STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_PRICE_SINGLE: 'price_1', STRIPE_PRICE_YEAR: 'price_2', SITE_URL: 'https://x.test', UNLOCK_SIGNING_KEY: '' };
const post = (b: unknown) => new Request('https://x.test/api/checkout', { method: 'POST', body: JSON.stringify(b) });

describe('checkout', () => {
  it('client sends exactly product and fingerprint', () => {
    expect(Object.keys(buildCheckoutRequest('single', fp)).sort()).toEqual(['fingerprint', 'product']);
  });
  it('rejects bad input', async () => {
    const f = async () => new Response('{}');
    expect((await handleCheckout(post({ product: 'x', fingerprint: fp }), env, f)).status).toBe(400);
    expect((await handleCheckout(post({ product: 'single', fingerprint: 'abc' }), env, f)).status).toBe(400);
    expect((await handleCheckout(post({ product: 'single', fingerprint: fp, name: 'Projekt' }), env, f)).status).toBe(400);
  });
  it('503 without env', async () => {
    expect((await handleCheckout(post({ product: 'single', fingerprint: fp }), {})).status).toBe(503);
  });
  it('creates a Stripe session', async () => {
    let sent = '';
    const f = async (_u: string, init?: RequestInit) => {
      sent = String(init?.body);
      return new Response(JSON.stringify({ url: 'https://stripe.test/pay' }));
    };
    const res = await handleCheckout(post({ product: 'single', fingerprint: fp }), env, f);
    expect(await res.json()).toEqual({ url: 'https://stripe.test/pay' });
    const p = new URLSearchParams(sent);
    expect(p.get('mode')).toBe('payment');
    expect(p.get('line_items[0][price]')).toBe('price_1');
    expect(p.get('metadata[fingerprint]')).toBe(fp);
    expect(p.get('invoice_creation[enabled]')).toBe('true');
  });
});

describe('unlock', () => {
  const get = (id: string) => new Request(`https://x.test/api/unlock?session_id=${id}`);
  it('returns a verifiable token only when paid', async () => {
    const privBytes = ed.utils.randomPrivateKey();
    const priv = ed.etc.bytesToHex(privBytes);
    const pub = ed.etc.bytesToHex(await ed.getPublicKeyAsync(privBytes));
    const e = { ...env, UNLOCK_SIGNING_KEY: priv };
    const nowMs = Date.now();
    const paid = async () => new Response(JSON.stringify({ payment_status: 'paid', metadata: { product: 'single', fingerprint: fp } }));
    const { token } = (await (await handleUnlock(get('cs_test_12345678'), e, paid, nowMs)).json()) as { token: string };
    expect(await verifyToken(token, pub, { fingerprint: fp, now: Math.floor(nowMs / 1000) })).not.toBeNull();
    expect(await verifyToken(token, pub, { fingerprint: 'b'.repeat(64), now: Math.floor(nowMs / 1000) })).toBeNull();
    const unpaid = async () => new Response(JSON.stringify({ payment_status: 'unpaid' }));
    expect((await handleUnlock(get('cs_test_12345678'), e, unpaid, nowMs)).status).toBe(402);
    expect((await handleUnlock(get('bad'), e, paid, nowMs)).status).toBe(400);
    expect((await handleUnlock(get('cs_test_12345678'), {}, paid, nowMs)).status).toBe(503);
  });
});
