import * as ed from '@noble/ed25519';

// Only the async API is used: it relies on Web Crypto SHA-512, so no extra hash package is needed.

export interface TokenPayload {
  v: 1;
  kind: 'single' | 'year';
  /** LV fingerprint, set for 'single' only. */
  fp?: string;
  /** Expiry, seconds since epoch. */
  exp: number;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

export const SINGLE_MAX_SECONDS = 60 * 86400;
export const YEAR_MAX_SECONDS = 365 * 86400;

export function b64urlEncode(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(s: string): Uint8Array {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Server side: sign a payload with the private key (hex, 32 bytes). */
export async function signToken(payload: TokenPayload, privateKeyHex: string): Promise<string> {
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const sig = await ed.signAsync(enc.encode(body), ed.etc.hexToBytes(privateKeyHex));
  return `${body}.${b64urlEncode(sig)}`;
}

export async function verifyToken(
  token: string,
  publicKeyHex: string,
  ctx: { fingerprint: string; now: number },
): Promise<TokenPayload | null> {
  try {
    const [body, sig, extra] = token.trim().split('.');
    if (!body || !sig || extra !== undefined) return null;
    const ok = await ed.verifyAsync(b64urlDecode(sig), enc.encode(body), ed.etc.hexToBytes(publicKeyHex));
    if (!ok) return null;
    const p = JSON.parse(dec.decode(b64urlDecode(body))) as TokenPayload;
    if (p.v !== 1 || typeof p.exp !== 'number' || p.exp <= ctx.now) return null;
    if (p.kind === 'single') {
      if (!p.fp || p.fp !== ctx.fingerprint) return null;
      if (p.exp - ctx.now > SINGLE_MAX_SECONDS) return null;
      return p;
    }
    if (p.kind === 'year') {
      if (p.exp - ctx.now > YEAR_MAX_SECONDS) return null;
      return p;
    }
    return null;
  } catch {
    return null;
  }
}
