export type Product = 'single' | 'year';

/** The only data that ever leaves the device for checkout: product and fingerprint. */
export function buildCheckoutRequest(product: Product, fingerprint: string): { product: Product; fingerprint: string } {
  return { product, fingerprint };
}

export async function startCheckout(product: Product, fingerprint: string, base = ''): Promise<string> {
  const res = await fetch(`${base}/api/checkout`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(buildCheckoutRequest(product, fingerprint)),
  });
  if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Bezahlung nicht erreichbar.');
  return ((await res.json()) as { url: string }).url;
}
