import { describe, expect, it } from 'vitest';
import { decodeGaeb } from './decode';

const ascii = (s: string) => Array.from(s).map((c) => c.charCodeAt(0));

describe('decodeGaeb', () => {
  it('reads ISO-8859-1 umlauts', () => {
    const bytes = new Uint8Array([
      ...ascii('<?xml version="1.0" encoding="ISO-8859-1"?><a>'),
      0xe4, 0xf6, 0xfc, 0xdf,
      ...ascii('</a>'),
    ]);
    expect(decodeGaeb(bytes.buffer as ArrayBuffer)).toContain('äöüß');
  });
  it('defaults to UTF-8', () => {
    const b = new TextEncoder().encode('<?xml version="1.0"?><a>Größe</a>');
    expect(decodeGaeb(b.buffer as ArrayBuffer)).toContain('Größe');
  });
});
