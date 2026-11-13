export interface Env {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_SINGLE?: string;
  STRIPE_PRICE_YEAR?: string;
  UNLOCK_SIGNING_KEY?: string;
  SITE_URL?: string;
}
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
export const NOT_CONFIGURED = 'Die Bezahlung ist noch nicht eingerichtet. Bitte versuchen Sie es später erneut.';
