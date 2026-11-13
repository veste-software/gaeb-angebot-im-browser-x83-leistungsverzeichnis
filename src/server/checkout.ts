import { json, NOT_CONFIGURED, type Env, type FetchLike } from './env';

export async function handleCheckout(request: Request, env: Env, fetchImpl: FetchLike = fetch): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ungültige Anfrage.' }, 400);
  }
  const b = body as Record<string, unknown> | null;
  const keys = b && typeof b === 'object' ? Object.keys(b).sort().join(',') : '';
  if (
    !b ||
    keys !== 'fingerprint,product' ||
    (b.product !== 'single' && b.product !== 'year') ||
    typeof b.fingerprint !== 'string' ||
    !/^[0-9a-f]{64}$/.test(b.fingerprint)
  ) {
    return json({ error: 'Ungültige Anfrage.' }, 400);
  }
  const price = b.product === 'single' ? env.STRIPE_PRICE_SINGLE : env.STRIPE_PRICE_YEAR;
  if (!env.STRIPE_SECRET_KEY || !price || !env.SITE_URL) return json({ error: NOT_CONFIGURED }, 503);

  const site = env.SITE_URL.replace(/\/$/, '');
  const form = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
    'invoice_creation[enabled]': 'true',
    success_url: `${site}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/`,
    'metadata[fingerprint]': b.fingerprint,
    'metadata[product]': b.product,
  });
  const res = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  if (!res.ok) return json({ error: 'Die Bezahlseite konnte nicht geöffnet werden.' }, 502);
  const session = (await res.json()) as { url?: string };
  if (!session.url) return json({ error: 'Die Bezahlseite konnte nicht geöffnet werden.' }, 502);
  return json({ url: session.url });
}
