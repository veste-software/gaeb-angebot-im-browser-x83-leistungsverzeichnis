/**
 * Every internal link and asset path goes through `url()`, so the site works both at "/" and
 * under the GitHub Pages sub-path (SITE_BASE, e.g. "/repo/").
 */
export function joinBase(base: string, path = ''): string {
  const b = base.endsWith('/') ? base : `${base}/`;
  const p = path.replace(/^\/+/, '');
  return `${b}${p}`;
}

export function url(path = ''): string {
  return joinBase(import.meta.env.BASE_URL ?? '/', path);
}
