import { signToken, SINGLE_MAX_SECONDS, YEAR_MAX_SECONDS, type TokenPayload } from '../lib/unlock/token';
import { json, NOT_CONFIGURED, type Env, type FetchLike } from './env';

export async function handleUnlock(request: Request, env: Env, fetchImpl: FetchLike = fetch, nowMs = Date.now()): Promise<Response> {
  const id = new URL(request.url).searchParams.get('session_id') ?? '';
  if (!/^cs_[A-Za-z0-9_]{8,200}$/.test(id)) return json({ error: 'Ungültige Sitzung.' }, 400);
  if (!env.STRIPE_SECRET_KEY || !env.UNLOCK_SIGNING_KEY) return json({ error: NOT_CONFIGURED }, 503);

  const res = await fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${id}`, {
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) return json({ error: 'Die Zahlung wurde nicht gefunden.' }, 402);
  const s = (await res.json()) as { payment_status?: string; metadata?: { fingerprint?: string; product?: string } };
  if (s.payment_status !== 'paid') return json({ error: 'Die Zahlung ist noch nicht abgeschlossen.' }, 402);

  const sec = Math.floor(nowMs / 1000);
  let payload: TokenPayload;
  if (s.metadata?.product === 'single' && s.metadata.fingerprint) {
    payload = { v: 1, kind: 'single', fp: s.metadata.fingerprint, exp: sec + SINGLE_MAX_SECONDS };
  } else if (s.metadata?.product === 'year') {
    payload = { v: 1, kind: 'year', exp: sec + YEAR_MAX_SECONDS };
  } else {
    return json({ error: 'Die Sitzung gehört zu keinem Produkt.' }, 402);
  }
  return json({ token: await signToken(payload, env.UNLOCK_SIGNING_KEY) });
}
