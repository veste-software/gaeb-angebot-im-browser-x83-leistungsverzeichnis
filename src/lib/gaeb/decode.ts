/** Decode GAEB file bytes using the encoding named in the XML declaration (default UTF-8). */
export function decodeGaeb(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 200));
  const m = /<\?xml[^>]*encoding\s*=\s*["']([^"']+)["']/i.exec(head);
  let label = (m?.[1] ?? 'utf-8').trim().toLowerCase();
  if (label === 'iso-8859-1' || label === 'latin1') label = 'windows-1252';
  let text: string;
  try {
    text = new TextDecoder(label).decode(bytes);
  } catch {
    text = new TextDecoder('utf-8').decode(bytes);
  }
  return text.replace(/^﻿/, '');
}
