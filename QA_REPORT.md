# QA report, round 1

Verdict: **not passing.** The site is in good shape (tests, build, preview build, design check all green), but the product's core promise, a valid X84, has never been checked against the official schema, and one in-scope feature is missing.

## What I ran
- `npm test`: 13 files, 60 tests, green. `npm run build:preview`: 9 pages, green. `node scripts/design-check.mjs`: nothing found.
- `npm run size`: 49.7 KB gzipped JS (budget 120 KB).
- Preview HTML: no `href`/`src`/`content` attribute starts with a root path other than `/preview/`. The sitemap lists 8 pages under `/preview/` and leaves out `/404`. `robots.txt` names the sitemap.
- Every page has a unique title, a description and a canonical URL.
- `/impressum` and `/datenschutz` render `src/content/legal/*.html` through `set:html`, with the English text below. No cookies, no third-party script (analytics is off unless a build env var is set), no Stripe.js.
- Server handlers: the checkout accepts exactly `{product, fingerprint}`, and unlock returns a token only for `payment_status: paid`. Missing env returns 503. `.env.example` lists all names without values.
- `/preise` has net and gross prices, "kein Abo, keine automatische Verlängerung", what is free, and the no-guarantee text.
- Design: Zilla Slab and Courier Prime are self-hosted, with no gradients, no radius and no stock hero. The steps are built as an LV excerpt. No violations found.

## Blockers
1. **X84 output is not validated against the official schemas (criteria 1, 2, 7, 15).** `tests/fixtures/gaeb/official/` does not exist, so there are no official samples, no XSDs and no `SOURCE.md`. `npm run test:schema` therefore cannot pass. Element names and order for `UP`, `IT`, `Totals`, `CTR` and the alternative/Bedarf markers are still `XSD-TODO` (`src/lib/gaeb/export84.ts:6`, `src/lib/gaeb/parse.ts:5,153`). The synthetic fixtures were never checked against the X83 XSD either. The spec says never take money for a file we cannot write correctly. The Builder has no network, so a human has to fetch the files (see humanTasks), then the Builder fixes the names until `test:schema` is green. I could not confirm that `xmllint` is installed (my shell check was denied).
2. **Bidder text complements are missing (SPEC §5 and §6).** Grep finds no `TextComplement` or "complement" anywhere in `src/`. The parser does not read them, the check panel does not list empty ones, and `exportX84` does not write them. Add them to `parse.ts`, `check.ts` (blocking when empty) and `export84.ts`, with a test. Also add a lump-sum marker, and check how Zulage items are marked, against the XSD.
3. **Non-UTF-8 files are corrupted.** `PricingTool.tsx:67` uses `file.text()`, which always decodes as UTF-8. A GAEB file declared as ISO-8859-1 or windows-1252 loses its umlauts (U+FFFD) and the X84 is written with the damaged texts. Read `file.arrayBuffer()`, take the encoding from the XML declaration, decode with `TextDecoder`, and add a test with a Latin-1 fixture.
4. **A wrong Freischaltcode is reported as checked.** `PricingTool.tsx:189-195` shows "Code gespeichert und geprüft." whatever the code is. An invalid code only makes the dialog silently show the buy buttons again. Verify first with `verifyToken`, and show "Der Code ist ungültig, abgelaufen oder gehört zu einem anderen Leistungsverzeichnis." on failure. Do the same for an expired token.
5. **`npm audit --omit=dev` reports 1 critical (astro), 3 high (sharp, zod, esbuild) and 1 low.** npm offers fixes only through `--force`. Upgrade `astro` and its integrations (and `sharp`) to patched versions, then run test, build and `build:preview` again. If an advisory does not apply to a static build, say so in the report.

## Warnings
- `/hilfe` has no questions about the Freischaltcode on another device, local data deletion or Bedarf/Wahl pricing (SPEC §8, PLAN task 26). Check the page and add what is missing.
- The "Angebot geprüft" stamp shows as soon as the checklist is clear, but it only checks that prices are present. Consider the wording "Alle Positionen bepreist" until XSD validation is in place.
- Unpriced alternative (Wahl) items do not block export (`check.ts:23`). Many clients expect them priced, so show a warning entry.
- `parseGaeb` has no lump-sum or Zulage flag. Alternatives are detected only by `ALNSerNo > 0`, which is a guess (XSD-TODO).
- A dropped X84 is accepted on `/` and can be exported again. That is harmless but not intended.
- `/api/unlock` mints a fresh 60-day token on every call with the same paid `session_id`. That is acceptable for the MVP, but it is worth a note.
- Token verification needs `PUBLIC_UNLOCK_KEY` at **build** time. If it is missing, a customer pays and the download never unlocks. Make the build fail or warn loudly when Stripe is configured but the key is not.
- The success redirect returns to `/`, which clears the loaded LV. The user has to reopen the file; the message says so, and prices come back from autosave.
- `/api/*` calls use root paths (right for Pages Functions). On the GitHub preview they say plainly that the payment is unreachable.

## humanTasks
See the JSON block below.

## Round 1: blockers

- (high) Official GAEB samples and XSDs are missing (criteria 1, 2, 7, 15). X84 element names and order (UP, IT, Totals, CTR, alternative/Bedarf markers) are still XSD-TODO and the synthetic X83 fixtures were never validated. test:schema cannot pass. Once the fixtures exist, fix names and order until `npm run test:schema` is green and remove the XSD-TODO marks. [tests/fixtures/gaeb/official/ (absent), src/lib/gaeb/export84.ts:6, src/lib/gaeb/parse.ts:5,153, tests/schema/xsd.test.ts]
- (high) Bidder text complements (TextComplement) are not parsed, not listed in the check panel and not written in the X84; no lump-sum or Zulage flag either. SPEC §5 and §6 require them. Implement in parse.ts, check.ts (blocking when empty) and export84.ts, with tests. [src/lib/gaeb/parse.ts, check.ts, export84.ts]
- (high) Files are read with file.text() (always UTF-8). ISO-8859-1 or windows-1252 GAEB files lose umlauts and the damaged text goes into the X84. Read arrayBuffer, take the encoding from the XML declaration, decode with TextDecoder, and add a Latin-1 fixture test. [src/components/PricingTool.tsx:67]
- (medium) Entering any Freischaltcode shows 'Code gespeichert und geprüft.' without verifying it; an invalid, expired or wrong-LV code gives no error. Verify with verifyToken first and show a clear German error on failure. [src/components/PricingTool.tsx:189-195]
- (medium) npm audit --omit=dev reports 1 critical (astro), 3 high (sharp, zod, esbuild) and 1 low, with fixes available via --force. Upgrade astro, its integrations and sharp, re-run test, build and build:preview, or document why an advisory does not affect a static build. [package.json, package-lock.json]
