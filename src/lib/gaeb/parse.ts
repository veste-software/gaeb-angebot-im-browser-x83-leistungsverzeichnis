import { DOMParser } from '@xmldom/xmldom';
import type { Category, Item, Lv } from './model';
import { toCents } from './number';

// XSD-TODO: element names are from memory until checked against the official XSDs.

type El = Element;

export class GaebParseError extends Error {}

/** xmldom implements the DOM but its own types differ from lib.dom; the rest of the code uses lib.dom. */
export function parseXml(xmlText: string): Document {
  return new DOMParser({ onError: () => undefined }).parseFromString(
    xmlText.replace(/^﻿/, ''),
    'text/xml',
  ) as unknown as Document;
}

export function kids(el: El, name: string): El[] {
  const out: El[] = [];
  for (let n = el.firstChild; n; n = n.nextSibling) {
    if (n.nodeType === 1 && (n as El).localName === name) out.push(n as El);
  }
  return out;
}

/** First descendant with the given local name. */
export function desc(el: El, name: string): El | null {
  const all = el.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) if (all[i].localName === name) return all[i];
  return null;
}

/** All descendants with the given local name. */
export function descAll(el: El, name: string): El[] {
  const out: El[] = [];
  const all = el.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) if (all[i].localName === name) out.push(all[i]);
  return out;
}

/** Follow a chain of direct children. */
export function path(el: El | null, ...names: string[]): El | null {
  let cur: El | null = el;
  for (const n of names) {
    if (!cur) return null;
    cur = kids(cur, n)[0] ?? null;
  }
  return cur;
}

function text(el: El | null): string {
  return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Text of a formatted block: paragraphs on their own lines. */
function blockText(el: El | null): string {
  if (!el) return '';
  const ps = el.getElementsByTagName('p');
  if (ps.length === 0) return text(el);
  const lines: string[] = [];
  for (let i = 0; i < ps.length; i++) {
    const t = text(ps[i]);
    if (t) lines.push(t);
  }
  return lines.join('\n');
}

function detectVersion(ns: string, declared: string): string {
  const m = /DA8\d\/(3\.\d)/.exec(ns);
  if (m) return m[1];
  if (/DA8\d\/200407/.test(ns)) return '3.1';
  const d = /^3\.\d/.exec(declared);
  return d ? d[0] : declared || '?';
}

export function parseGaeb(xmlText: string): Lv {
  let doc: Document;
  try {
    doc = parseXml(xmlText);
  } catch {
    throw new GaebParseError('Die Datei ist keine lesbare XML-Datei.');
  }
  const root = doc?.documentElement;
  if (!root || root.localName !== 'GAEB') throw new GaebParseError('Die Datei ist keine GAEB-DA-XML-Datei.');

  const namespace = root.namespaceURI ?? '';
  const info = kids(root, 'GAEBInfo')[0] ?? null;
  const prj = kids(root, 'PrjInfo')[0] ?? null;
  const award = kids(root, 'Award')[0] ?? null;
  if (!award) throw new GaebParseError('Die Datei enthält keinen Vergabeteil (Award).');
  const boq = kids(award, 'BoQ')[0] ?? null;
  if (!boq) throw new GaebParseError('Die Datei enthält kein Leistungsverzeichnis (BoQ).');

  const items: Item[] = [];
  const categories: Category[] = [];

  const body = kids(boq, 'BoQBody')[0];
  const walk = (bodyEl: El | undefined, parentOz: string[]): Array<Category | Item> => {
    const out: Array<Category | Item> = [];
    if (!bodyEl) return out;
    for (let n = bodyEl.firstChild; n; n = n.nextSibling) {
      if (n.nodeType !== 1) continue;
      const e = n as El;
      if (e.localName === 'BoQCtgy') {
        const parts = [...parentOz, e.getAttribute('RNoPart') ?? ''];
        const cat: Category = {
          kind: 'cat',
          id: e.getAttribute('ID') ?? parts.join('.'),
          oz: parts.join('.'),
          label: blockText(kids(e, 'LblTx')[0] ?? null),
          children: [],
        };
        categories.push(cat);
        cat.children = walk(kids(e, 'BoQBody')[0], parts);
        out.push(cat);
      } else if (e.localName === 'Itemlist') {
        for (const it of kids(e, 'Item')) {
          const item = parseItem(it, parentOz);
          items.push(item);
          out.push(item);
        }
      }
    }
    return out;
  };

  const nodes = walk(body, []);
  return {
    version: detectVersion(namespace, text(path(info, 'Version'))),
    phase: Number(text(path(award, 'DP'))) || 0,
    namespace,
    projectName: text(path(prj, 'NamePrj')),
    projectLabel: text(path(prj, 'LblPrj')),
    owner: text(path(award, 'OWN', 'Address', 'Name1')),
    currency: text(path(prj, 'Cur')) || 'EUR',
    boqId: boq.getAttribute('ID') ?? '',
    nodes,
    items,
    categories,
  };
}

function parseItem(it: El, parentOz: string[]): Item {
  const parts = [...parentOz, it.getAttribute('RNoPart') ?? ''];
  const complete = path(it, 'Description', 'CompleteText');
  const outl = complete ? desc(complete, 'TextOutlTxt') ?? desc(complete, 'OutlTxt') : null;
  const detail = complete ? desc(complete, 'DetailTxt') : null;
  const qty = Number(text(path(it, 'Qty')));
  const upTxt = text(path(it, 'UP'));
  const aln = Number(text(path(it, 'ALNSerNo')));
  return {
    kind: 'item',
    id: it.getAttribute('ID') ?? parts.join('.'),
    oz: parts.join('.'),
    shortText: blockText(outl),
    longText: blockText(detail),
    qty: Number.isFinite(qty) ? qty : 0,
    qu: text(path(it, 'QU')),
    withoutTotal: text(path(it, 'Provis')) === 'WithoutTotal',
    alternative: aln > 0, // XSD-TODO: base item vs. alternative marking
    notAppl: text(path(it, 'NotAppl')) === 'Yes',
    complements: complete ? descAll(complete, 'TextComplement').map((c) => blockText(c)) : [],
    up: upTxt !== '' && Number.isFinite(Number(upTxt)) ? toCents(Number(upTxt)) : null,
  };
}
