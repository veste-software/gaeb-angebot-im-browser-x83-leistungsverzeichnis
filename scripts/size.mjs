// `npm run size`: prints the gzip size of every JS and CSS file in dist/ and the total JS.
// Run after `npm run build`. Exits 1 if the total gzipped JS exceeds the budget (default 120 KB).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(process.argv[2] || 'dist');
const budget = Number(process.env.JS_BUDGET_KB || 120) * 1024;
if (!fs.existsSync(root)) {
  console.error(`size: ${root} not found. Run \`npm run build\` first.`);
  process.exit(1);
}
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (/\.(js|mjs|css)$/.test(e.name)) files.push(full);
  }
})(root);
let js = 0;
for (const f of files.sort()) {
  const gz = zlib.gzipSync(fs.readFileSync(f)).length;
  if (/\.m?js$/.test(f)) js += gz;
  console.log(`${(gz / 1024).toFixed(1).padStart(7)} KB  ${path.relative(root, f)}`);
}
console.log(`total JS (gzip): ${(js / 1024).toFixed(1)} KB, budget ${(budget / 1024).toFixed(0)} KB`);
process.exit(js > budget ? 1 : 0);
