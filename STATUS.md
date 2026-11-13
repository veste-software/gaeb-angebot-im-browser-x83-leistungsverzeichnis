# GAEB-Angebot im Browser: X83-Leistungsverzeichnis bepreisen und als X84 abgeben

**Stage:** qa · **Platform:** web · **Score:** 3.2/5 · **Spend:** $12.54

For small trades (painters, electricians, roofers, landscapers) who get a GAEB X83 bill of quantities with a public tender and must return a priced X84 file: open, price and export in the browser, on any computer, with the file never leaving the device. If it takes off it becomes the bidding companion next to tender-notice pages (Formblatt 221/223, X89 invoices, Austrian ONLV).

**Why now:** standing need. Window: Standing gap. The paid tools are Windows desktop programs sold as one-off licences (GAEB-Online needs Windows 10/11), and the free web converter allows one download and does not say it can price an X84. Nothing hosted is aimed at a trade that bids a few times a year.

## Needs you

- [ ] [task 1] Create two Stripe one-off prices (19 EUR and 79 EUR net plus 19% VAT), turn on Checkout invoice creation, and add STRIPE_SECRET_KEY, STRIPE_PRICE_SINGLE and STRIPE_PRICE_YEAR to Cloudflare Pages (test keys first)
- [ ] [task 2] Generate an Ed25519 keypair and store it as UNLOCK_SIGNING_KEY (secret) and PUBLIC_UNLOCK_KEY in Cloudflare Pages
- [ ] [task 3] Register a domain (~15 EUR/year), connect Cloudflare Pages and set SITE_URL
- [ ] [task 4] Before go-live, import one exported X84 into a real AVA program (e.g. a GAEB-Online or ORCA AVA trial on Windows) and run the bvbs.de GAEB-XML-Checker on it
- [ ] [task 5] Add the site to Google Search Console and submit the sitemap
- [ ] [task 6] Switch Stripe to live mode after the steps above
- [ ] [task 7] If the Builder cannot reach the network, run `npm run fetch:gaeb` once to download the official GAEB 3.1–3.3 samples and XSDs into tests/fixtures/gaeb/official/ and commit them
- [ ] [task 8] Create a Stripe account in test mode with two one-off prices (19 EUR and 79 EUR net, VAT via Stripe Tax, invoice creation on) and set STRIPE_SECRET_KEY, STRIPE_PRICE_SINGLE, STRIPE_PRICE_YEAR in Cloudflare Pages
- [ ] [task 9] Generate an Ed25519 keypair; store the private key as the secret UNLOCK_SIGNING_KEY and the public key as PUBLIC_UNLOCK_KEY in Cloudflare Pages
- [ ] [task 10] Register a domain, connect Cloudflare Pages and set SITE_URL
- [ ] [task 11] Before going live, import one exported X84 into a real AVA program and run the bvbs.de GAEB-XML-Checker on it
- [ ] [task 12] Add the site to Google Search Console and submit the sitemap; switch Stripe to live mode only after the steps above
- [ ] [task 13] Blocked: 14. Official fixtures script: run npm run fetch:gaeb (Builder has no network access; the human must run npm run fetch:gaeb once to download the official GAEB samples and XSDs.)
- [ ] [task 14] Blocked: 15. Schema tests: run npm run test:schema and fix element names (Needs the official XSDs from task 14 and xmllint; test is written but could not run, so the XSD-TODO marks are still unverified.)
- [ ] [task 15] Run npm run build and npm test once to confirm the layout and JSON-LD edits compile (Bash was unavailable during this run)
- [ ] [task 16] Add the live site to Google Search Console, submit sitemap-index.xml and request indexing for /, /x84-erstellen, /x83-in-pdf, /x84-pruefen and /preise
- [ ] [task 17] Add the site to Bing Webmaster Tools and enable IndexNow
- [ ] [task 18] Set SITE_URL in the Cloudflare Pages build environment so the sitemap and canonical URLs are generated
- [ ] [task 19] Submit a plain listing to GAEB tool directories such as softguide.de
- [ ] [task 20] Check the live start page and /hilfe in Google's Rich Results Test
- [ ] [task 21] Run `npm run fetch:gaeb` once on a machine with network access (installs the official GAEB samples and the X83/X84 XSDs for 3.1, 3.2 and 3.3 into tests/fixtures/gaeb/official/ and writes SOURCE.md), and install xmllint (libxml2-utils); then run `npm run test:schema`.
- [ ] [task 22] Create a Stripe account in test mode with two one-off prices (19 EUR and 79 EUR net), and set STRIPE_SECRET_KEY, STRIPE_PRICE_SINGLE and STRIPE_PRICE_YEAR in Cloudflare Pages.
- [ ] [task 23] Generate an Ed25519 keypair: private key as UNLOCK_SIGNING_KEY (secret), public key as PUBLIC_UNLOCK_KEY (also set at build time), and set SITE_URL.
- [ ] [task 24] Before going live, import one exported X84 into a real AVA program and run the official GAEB XML checker from bvbs.de on it.
- [ ] [task 25] Blocked: [QA round 1] Official GAEB samples and XSDs are missing (Needs network access to run npm run fetch:gaeb; the builder has no web access. A human must run it and commit the fixtures.)
- [ ] [task 26] Blocked: [QA round 1] Official GAEB samples and XSDs are missing (Needs network to run `npm run fetch:gaeb`; the builder has no web access. XSD-TODO element names stay unverified until then.)
- [ ] [task 27] Blocked: [QA round 1] npm audit: upgrade astro, sharp, zod, esbuild (npm audit and major dependency upgrades need registry access, which this shell does not have.)

## Recommendation

None yet. The Growth role gives one after launch.

## Metrics

No real numbers yet. Fill in `metrics.json` (Search Console, analytics, Stripe); agents never invent them.

## Monetisation

one-off (Free: open X83/X84, price, live totals, bid check, print/PDF, local autosave. Einzelangebot 19 EUR net per LV (X84 export, re-exports for 60 days). Jahrespass 79 EUR net, 365 days unlimited, no auto-renewal.)

## Target queries

- x83 datei öffnen
- x83 datei bearbeiten
- x83 datei ausfüllen
- x83 datei in pdf umwandeln online
- gaeb x84 erstellen
- x83 in x84 umwandeln
- gaeb x84 konverter
- gaeb x83 x84
- gaeb x84 öffnen
- gaeb angebot abgeben ohne software

## Alternatives found

- Wingaebxml Bietertool (solid): Desktop licence 125-600 EUR one-off; OS not stated; overkill for occasional bidders
- GAEB-Online 2025 (solid): Windows 10/11 only, 120 EUR one-off; X84 not named in the comparison
- T&T Datentechnik GAEB-Konverter (solid): Package pricing from 99 EUR up to 2,499 EUR; OS not stated
- DanglIT WebGAEB (partial): Free browser converter, but download possible only once and pricing an X84 is not confirmed
- Trade software suites (e.g. STREIT) (partial): Full ERP with prices on request; too much for a few tenders a year

## Kill criteria

- Fewer than 100 organic clicks in Google Search Console in the 90 days after launch (check 2027-02-28)
- Fewer than 5 paid unlocks in Stripe live mode by 2027-04-30
- Pause sales if an exported X84 is reported rejected by a client's AVA program and the cause cannot be fixed in one build session

## Links

- Repo: https://github.com/veste-software/gaeb-angebot-im-browser-x83-leistungsverzeichnis
- Preview (GitHub Pages, builds from main): https://veste-software.github.io/gaeb-angebot-im-browser-x83-leistungsverzeichnis/

## History

- 2026-11-13 21:18 · scouted · ranked first in the daily pool (aggregate 3.55 of 5 by 2 independent rankers); the studio builds the day's best candidate whatever its score, and the prototype is how it is judged
- 2026-11-13 21:30 · specced · spec written
- 2026-11-13 21:41 · planned · scaffold and plan written
- 2026-11-13 22:08 · building · build started
- 2026-11-13 22:48 · seo · all planned tasks done
- 2026-11-13 22:53 · qa · seo and conversion foundations written
- 2026-11-13 23:00 · building · visual review round 1: ease 3, average 3.2
- 2026-11-13 23:06 · qa · all planned tasks done
- 2026-11-13 23:22 · building · QA round 1 found 5 blocker(s)
- 2026-11-13 23:34 · qa · all planned tasks done
- 2026-11-13 23:40 · building · visual review round 2: average 3.8
- 2026-11-13 23:46 · qa · all planned tasks done
