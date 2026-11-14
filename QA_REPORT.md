# QA report, round 3 (last round)

Verdict: **not passing.** Nothing changed since round 2. Both blockers are still open, and both need network access that the Builder does not have.

## What I ran
- `npm test`: 14 files, 63 tests, green.
- `npm run build:preview`: 9 pages, green. No `href`, `src`, `content` or `action` attribute points to a root path outside `/preview/`.
- `node scripts/design-check.mjs`: nothing found in 20 files.
- `npm audit --omit=dev`: 5 findings (1 critical, 3 high, 1 low), unchanged.
- `tests/fixtures/gaeb/official/` is absent. `xmllint` is not installed. `// XSD-TODO` remains in `src/lib/gaeb/export84.ts:6`, `src/lib/gaeb/parse.ts:5` and `src/lib/gaeb/parse.ts:161`.
- `package.json` still has `astro ^5.13.0`. README has no audit section.
- A broader shell check (network, title uniqueness) was denied, so I reused the round 1 and 2 findings for those points.

## Blockers
1. **The X84 output and the synthetic X83 fixtures have never been checked against the official GAEB XSDs (criteria 1, 2, 7).** Element names and order for UP, IT, Totals, CTR and the alternative marker are unverified. Taking money for a file the client's AVA software may reject breaks the spec's rule ("Never take money for a file we cannot write correctly"). Owner: install `libxml2-utils`, run `npm run fetch:gaeb`, commit `tests/fixtures/gaeb/official/`. Then the Builder runs `npm run test:schema`, fixes names and order, and removes the `XSD-TODO` marks.
2. **`npm audit --omit=dev` shows 1 critical (astro ≤7.4.6), 3 high (sharp, zod, esbuild) and 1 low, and a fix exists (astro 7.4.12).** Upgrade astro and its integrations, or document per advisory why a static build is not affected. Most advisories concern SSR, server islands or the dev server. This is probably not reachable here, but nothing is written down.

## Warnings
- The "Angebot geprüft" stamp only means that prices are present. Use "Alle Positionen bepreist" until XSD validation passes.
- Unpriced alternative (Wahl) items do not block export and give no warning (`check.ts:23`).
- An empty bidder text complement is only a warning. The spec asked for a blocking entry. Re-check once the XSD is available.
- `/api/unlock` mints a new 60-day token on every call with the same paid session.
- `PUBLIC_UNLOCK_KEY` is needed at build time. If it is missing while Stripe is configured, a customer pays and the download never unlocks. Fail the build or warn loudly.
- The success redirect returns to `/` and clears the loaded LV. Prices come back from autosave.
- `/api/*` uses root paths, which is right for Pages Functions. On the GitHub preview, payment is unreachable and the page says so.

## Human tasks
See the JSON block.

## Round 3: blockers

- (high) X84 output and synthetic X83 fixtures are not validated against the official GAEB XSDs. tests/fixtures/gaeb/official/ does not exist, xmllint is not installed, npm run test:schema cannot pass, and element names and order for UP, IT, Totals, CTR and the alternative marker are still XSD-TODO. Taking money for a file the client's AVA software may reject breaks the spec's rule. Owner fetches the files; Builder then fixes names and order until test:schema is green and removes the XSD-TODO marks. [tests/fixtures/gaeb/official/ (absent), src/lib/gaeb/export84.ts:6, src/lib/gaeb/parse.ts:5 and :161, tests/schema/xsd.test.ts]
- (medium) npm audit --omit=dev reports 1 critical (astro <=7.4.6), 3 high (sharp, zod, esbuild) and 1 low, and a fix exists (astro 7.4.12). Upgrade astro, its integrations and sharp, then re-run test, build and build:preview. Or document per advisory in README or QA notes why a static build is not affected. [package.json (astro ^5.13.0), package-lock.json]
