// Downloads the official GAEB packages (SPEC §3 "Official format and samples") into
// tests/fixtures/gaeb/official/. Test-only material, never shipped. Needs network.
// Usage: npm run fetch:gaeb
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'tests', 'fixtures', 'gaeb', 'official');

const packages = [
  { dir: 'lv-3.3', url: 'https://www.gaeb.de/wp-content/uploads/2021/06/2021-05_Leistungsverzeichnis.zip' },
  { dir: 'lv-3.2', url: 'https://www.gaeb.de/wp-content/uploads/2019/04/Leistungsverzeichnis.zip' },
  { dir: 'samples-3.1', url: 'https://www.gaeb.de/wp-content/uploads/2022/11/Musterdateien_GAEB_DA_XML_3.1_2009-12.zip' },
];
const files = [
  { name: 'Regeln_fuer_X84_GAEB_DA_XML_3.1_2009-12.pdf', url: 'https://www.gaeb.de/wp-content/uploads/2022/11/Regeln_fuer_X84_GAEB_DA_XML_3.1_2009-12.pdf' },
];

const today = new Date().toISOString().slice(0, 10);
const log = [];
let failed = 0;

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

function save(base, rel, data) {
  const target = normalize(join(base, rel));
  if (!target.startsWith(normalize(base))) return; // zip-slip guard
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, data);
}

for (const p of packages) {
  try {
    const entries = unzipSync(await get(p.url));
    const base = join(root, p.dir);
    let n = 0;
    for (const [name, data] of Object.entries(entries)) {
      if (name.endsWith('/') || !/\.(xsd|x8\d|xml|pdf|md|txt)$/i.test(name)) continue;
      save(base, name, data);
      n++;
    }
    log.push(`- ${p.url}\n  fetched ${today}, ${n} files into \`${p.dir}/\``);
  } catch (e) {
    failed++;
    console.error(`FAILED ${p.url}: ${e.message}`);
  }
}
for (const f of files) {
  try {
    save(root, f.name, await get(f.url));
    log.push(`- ${f.url}\n  fetched ${today}`);
  } catch (e) {
    failed++;
    console.error(`FAILED ${f.url}: ${e.message}`);
  }
}

mkdirSync(root, { recursive: true });
writeFileSync(
  join(root, 'SOURCE.md'),
  `# Official GAEB material (test-only, not shipped)\n\nDownloaded by scripts/fetch-gaeb.mjs from gaeb.de. The page states no licence terms.\n\n${log.join('\n')}\n`,
);
console.log(`${log.length} sources fetched, ${failed} failed.`);
process.exit(failed ? 1 : 0);
