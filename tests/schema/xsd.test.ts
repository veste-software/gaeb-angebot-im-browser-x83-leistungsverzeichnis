import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportX84, type Bidder } from '../../src/lib/gaeb/export84';
import { parseGaeb } from '../../src/lib/gaeb/parse';
import { toCents } from '../../src/lib/gaeb/number';
import type { Prices } from '../../src/lib/gaeb/totals';

const official = join(__dirname, '..', 'fixtures', 'gaeb', 'official');
const synthetic = join(__dirname, '..', 'fixtures', 'gaeb', 'synthetic');
const bidder: Bidder = { firma: 'Maler Müller GmbH', strasse: 'Hauptstraße 1', plz: '12345', ort: 'Beispielstadt' };

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** Finds the XSD for a phase ("83"/"84") and version ("3.2") in the downloaded packages. */
function findXsd(phase: string, version: string): string {
  const re = new RegExp(`(^|[^0-9])${phase}[_-].*${version.replace('.', '\\.')}.*\\.xsd$|DA${phase}.*${version.replace('.', '\\.')}.*\\.xsd$`, 'i');
  const hit = walk(official).find((f) => re.test(f.split('/').pop() ?? ''));
  if (!hit) throw new Error(`XSD für X${phase} ${version} fehlt in tests/fixtures/gaeb/official/. Zuerst "npm run fetch:gaeb" ausführen.`);
  return hit;
}

function validate(xsd: string, xml: string): { ok: boolean; out: string } {
  const dir = mkdtempSync(join(tmpdir(), 'gaeb-'));
  const file = join(dir, 'doc.xml');
  writeFileSync(file, xml);
  const r = spawnSync('xmllint', ['--noout', '--schema', xsd, file], { encoding: 'utf8' });
  if (r.error) throw new Error('xmllint ist nicht installiert (libxml2-utils). Ohne xmllint kann das Schema nicht geprüft werden.');
  return { ok: r.status === 0, out: `${r.stdout}${r.stderr}` };
}

const fixtures = readdirSync(synthetic).filter((f) => /\.X83$/i.test(f));

describe.each(fixtures)('XSD %s', (name) => {
  const xml = readFileSync(join(synthetic, name), 'utf8');
  const lv = parseGaeb(xml);

  it('X83 validates against the official X83 schema', () => {
    const res = validate(findXsd('83', lv.version), xml);
    expect(res.out).toContain('validates');
    expect(res.ok).toBe(true);
  });

  it('exported X84 validates against the official X84 schema', () => {
    const prices: Prices = {};
    lv.items.forEach((it, i) => (prices[it.id] = toCents(1.5 + i)));
    const out = exportX84(xml, prices, bidder);
    const res = validate(findXsd('84', lv.version), out);
    expect(res.out).toContain('validates');
    expect(res.ok).toBe(true);
  });
});
