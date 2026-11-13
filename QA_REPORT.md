# QA report, round 2

Verdict: **not passing.** Three of the five round-1 blockers are fixed. The two that remain are the missing official GAEB files and XSD validation, and the open `npm audit` findings.

## What I ran
- `npm test`: 14 files, 63 tests, green.
- `npm run build:preview`: 9 pages, green.
- `node scripts/design-check.mjs`: nothing found in 20 files.
- Preview HTML: no `href`, `src`, `content` or `action` attribute points to a root path outside `/preview/`. `robots.txt` names the `/preview/` sitemap.
- Every built page, including 404, has a `<title>`, a description and a canonical link.
- No `document.cookie` and no Stripe.js in `src`, `dist` or `functions`. The only external script is the Cloudflare beacon in `Analytics.astro`, and it is off unless a build env var is set. That is cookie-free.
- No marketing filler words found in `src`.
- `npm audit --omit=dev`: 5 findings, unchanged since round 1.

## Round-1 blockers, now

| # | Round-1 blocker | Now |
|---|---|---|
| 1 | No official fixtures or XSD validation | **Still open** (see below) |
| 2 | Bidder text complements missing | Fixed. They are parsed, shown in the check panel and written to the X84, with a test in `export84.test.ts`. |
| 3 | Non-UTF-8 files corrupted | Fixed. `PricingTool.tsx:68` calls `decodeGaeb(await file.arrayBuffer())`, and `decode.test.ts` exists. |
| 4 | Wrong Freischaltcode reported as checked | Fixed. The code is verified with `verifyToken`, and a German error is shown on failure (`PricingTool.tsx:193-195`). |
| 5 | `npm audit` findings | **Still open** (see below) |

## Blockers
1. **The X84 output has still never been checked against the official schema (criteria 1, 2, 7).**
   - `tests/fixtures/gaeb/official/` does not exist. There are no official samples, no XSDs and no `SOURCE.md`.
   - `xmllint` is not installed on this machine, so `npm run test:schema` cannot pass.
   - `// XSD-TODO` is still in `src/lib/gaeb/export84.ts:6`, `src/lib/gaeb/parse.ts:5` and `src/lib/gaeb/parse.ts:161`.
   - The element order of `UP`, `IT`, `Totals` and `CTR` is unchecked. The alternative marker (`ALNSerNo > 0`) is a guess.
   - The synthetic X83 fixtures were never validated either.
   - Taking money for a file that may be rejected by the client's AVA software breaks the spec's rule.
   - `scripts/fetch-gaeb.mjs` exists and looks complete, but nobody has run it. It needs network access, and the Builder has none.
   - Next step, for the owner: install `libxml2-utils` and run `npm run fetch:gaeb` once. Commit `tests/fixtures/gaeb/official/`. Then the Builder runs `npm run test:schema` and fixes names and order until it is green. The Builder then removes the `XSD-TODO` marks.
2. **`npm audit --omit=dev` shows 1 critical (astro ≤7.4.6), 3 high (sharp, zod, esbuild) and 1 low.**
   - Round 1 asked for an upgrade or a written reason. Neither was done: `package.json` still has `astro ^5.13.0`.
   - A fix exists (astro 7.4.12 via `npm audit fix --force`).
   - Most of the advisories concern SSR, server islands or the dev server and are probably not reachable in a static build. The studio rule is still "no high or critical issue that has a fix".
   - Either upgrade `astro`, its integrations and `sharp`, then re-run test, build and `build:preview`. Or add a section "audit" to this report or the README that names each advisory and says why a static build is not affected.

## Warnings
- The "Angebot geprüft" stamp only means that prices are present. Consider the wording "Alle Positionen bepreist" until XSD validation is in place.
- Unpriced alternative (Wahl) items do not block export (`check.ts:23`). Add a warning entry for them.
- A bidder text complement is shown in the check panel as a warning ("bleibt unverändert in der X84"). The spec asked for a blocking entry when a complement is empty. Whether the bidder has to type into it is unknown until the XSD is available. Re-check after blocker 1.
- A dropped X84 is accepted on `/` and can be exported again. This is harmless.
- `/api/unlock` mints a fresh 60-day token on every call with the same paid `session_id`.
- Token verification needs `PUBLIC_UNLOCK_KEY` at **build** time. If it is missing, a customer pays and the download never unlocks. Fail the build, or warn loudly, when Stripe is configured but the key is not.
- The success redirect returns to `/`, which clears the loaded LV. Prices come back from autosave.
- The `/api/*` calls use root paths. That is right for Pages Functions. On the GitHub preview the payment is unreachable, and the page says so.
- I could not re-run my broader grep (titles unique, external links) because a shell command was denied. I reused the round-1 findings for these points.

## Human tasks
See the JSON block.

## Round 2: blockers

- (high) X84 output and synthetic X83 fixtures are not validated against the official GAEB XSDs. tests/fixtures/gaeb/official/ does not exist, xmllint is not installed, test:schema cannot pass, and element names and order for UP, IT, Totals, CTR and the alternative marker are still XSD-TODO. Fetch the files (owner), then fix names and order until npm run test:schema is green and remove the XSD-TODO marks. [tests/fixtures/gaeb/official/ (absent), src/lib/gaeb/export84.ts:6, src/lib/gaeb/parse.ts:5,161, tests/schema/xsd.test.ts]
- (medium) npm audit --omit=dev reports 1 critical (astro <=7.4.6), 3 high (sharp, zod, esbuild) and 1 low, with a fix available (astro 7.4.12). Upgrade astro, its integrations and sharp, then re-run test, build and build:preview, or document per advisory why a static build is not affected. [package.json (astro ^5.13.0), package-lock.json]
