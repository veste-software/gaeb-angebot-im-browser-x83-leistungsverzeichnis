# SPEC: GAEB-Angebot im Browser (X83 bepreisen, X84 abgeben)

Working name: **LV-Bepreiser** (the Architect may rename it). Language of the product: German. Platform: web (static site plus two small serverless functions for payment).

Decision: **build, as a one-day prototype** (the owner's rule for the day's pick). The market already has several tools, so this spec does not try to beat the suites. It targets one segment none of them serves: the **occasional bidder** who must return one priced X84 file **this week**, on whatever computer is at hand, and who pays **per tender** instead of buying a Windows licence or a monthly plan.

---

## 1. Problem and users

**The job:** a public client (Bauamt, Landesbetrieb, Stadtwerke) or an engineering office sends a tender. The bill of quantities (Leistungsverzeichnis, LV) comes as a GAEB DA XML file with phase 83 (`.X83`, "Angebotsaufforderung"). The bidder must enter a unit price (Einheitspreis, EP) for every item and return the same LV as phase 84 (`.X84`, "Angebotsabgabe"). The client's AVA software reads the X84 straight into its price comparison (Preisspiegel).

**The users and payer:** a trade business with 1 to 20 staff (painter, carpenter, electrician, roofer, landscaper, scaffolder, cleaning firm, small engineering office) that bids on public or semi-public jobs **a few times a year** and has no AVA or trade software with GAEB export. The owner or office worker does the bid in the evening before the deadline. Often they use a Mac, a laptop without admin rights, or a PC where they cannot install anything.

**What hurts today:**
- They can open the file with a free viewer (WinGAEB viewer, Heitker viewer) but **cannot fill in prices or export** without buying a licence (forum thread, Sept 2025, see Evidence).
- Paid tools are Windows desktop licences (89 to 125+ EUR one-off) or a cloud plan from 25 EUR a month: too much for two bids a year.
- The free route (Dangl GAEB Converter) is a round trip: GAEB to Excel, type prices in Excel, convert back with phase 84. It needs Excel, uploads the tender to a server, gives one download per conversion and can break when the Excel layout changes.
- A wrong or missing GAEB file costs the bid. Some clients evaluate **only the submitted GAEB file**, and the format has to match the tender (D83 → D84, X83 → X84).

## 2. Why now

There is no trigger. This is a **standing need**: public construction tenders arrive as X83 every working day. What keeps the gap open:
- Every vendor sells to regular bidders (licences, monthly plans, suites). Nobody sells one bid for the price of one bid.
- Every browser option sends the tender file to a server (Dangl converts on its server; gaeb-365 is SaaS/cloud). None says "your file never leaves your computer".
- Modern browsers can now parse a 5 MB XML file, keep the state in IndexedDB and write the result as a download, all on the device, so the job needs no installation.

**Ship by: 2026-11-27** (the prototype in one build day, plus QA). The value does not depend on a date.

## 3. Evidence (only what I opened or saw myself, 2026-11-13)

| What | Source | What it shows |
|---|---|---|
| Paid desktop tools for this job | https://www.streit-software.de/wissen/gaeb-konverter (opened; undated, © 2026) | GAEB-Online 2025: 120 EUR single seat / 180 EUR USB, Windows 10/11. Wingaebxml: Basic 125, Plus 250, Pro 600 EUR one-off, "an offer tool for X83 and X84". T&T 99 to 2,499 EUR. WebGAEB (DanglIT): free, in the browser. gaeb2excel.online: free, but GAEB to Excel only. |
| GAEB-Online price and platform | https://www.gaeb-online.de (opened) | "Die Einzelplatz-Lizenz kostet 120 € netto", USB 180 EUR. X83 and X84 import/export. Windows only; on a Mac it needs Parallels/VMware or RDP. |
| Wingaebxml Bietertool | https://www.wingaeb.de (opened) | Bietertool "ab 125,00 € (einmalig)", aimed at trades that received an X83. The viewer is free, but filling in and exporting is paid. |
| **Browser competitor (paid)** | https://www.softguide.de/programm/gaeblv/vorschau (opened; listing updated 2026-03-05) | mein.gaeb-365.online: VIEW is free. EDIT adds price entry and the bid as GAEB-84/85 plus PDF, **from 25 EUR/month**; the web version is "from 19 EUR monthly". SaaS/cloud with an e-mail login. |
| Free route via Excel | https://www.dangl-it.com/articles/convert-gaeb-files-with-the-free-gaeb-converter (opened) and https://docs.dangl-it.com/Projects/WebGAEB/latest (opened) | Free. You enter prices in an Excel export, then convert back and "chose phase 84 (Offer)". "You can download a converted file only once"; the file is deleted after 15 minutes. Conversion runs on the server. |
| More one-off tools | search results seen (not opened): https://www.heise.de/download/product/gaeb-kalkulator-52818 and https://www.heise.de/download/product/x83-konverter-d84-generator-45381 | GAEB-Kalkulator 89 EUR (Excel based, exports DA84). X83-Konverter / D84-Generator 101.15 EUR. |
| Real user with exactly this job | https://www.woodworker.de/forum/threads/welche-software-zur-verarbeitung-von-gaeb-daten.137814/ (opened; posts 5 and 11 Sept 2025) | A carpenter's shop (Saxony) got a restricted tender with an `.x83` via eVergabe. It can read the file with a free viewer, wants to edit it and send it back, and asks which software to buy. Replies: it needs an AVA program; the client probably wants an X84; the WinGAEB viewer is free but exporting needs a paid key. |
| Buyer request for exactly this job | https://www.softguide.de/ausschreibungen/ingenieurbuero-sucht-software-fuer-ausschreibungen-x83-x84-dateien (opened; project no. 25/3412, ended) | An engineering office wants "x83 import, enter prices, export x84", one seat, Windows, on-prem or cloud. |
| Money at stake | search result snippet seen (PDF not readable): https://www.sib.sachsen.de/download/Hinweise_zur_elektronischen_Abgabe_von_Angeboten_und_Teilnahmeantraegen_07_2021.pdf | Saxony's building authority: the bid must be returned in the tender's GAEB format (D83 → D84, X84 not allowed then), and the check and scoring are based on the GAEB file submitted. *Snippet only, not verified in the document.* |
| Search demand (variants) | https://suggestqueries.google.com/complete/search?client=firefox&hl=de&q=gaeb%20x84 (opened) | 10 suggestions: x84 datei, in x83 umwandeln, beispiel, in excel umwandeln, öffnen, einlesen, konverter, format x84, x83 x84. |
| Search demand (variants) | https://suggestqueries.google.com/complete/search?client=firefox&hl=de&q=x83%20datei (opened) | "x83 datei in pdf umwandeln", "x83 datei bearbeiten", "x83 datei in pdf umwandeln online", "x83 dateiformat", "**x83 datei ausfüllen**". |
| Official format and samples are public | https://www.gaeb.de/de/service/downloads/gaeb-datenaustausch/ (opened) | Schema packages and documentation for 3.1, 3.2 and 3.3 (3.3 is current; 3.4 is beta only). Direct links: `https://www.gaeb.de/wp-content/uploads/2021/06/2021-05_Leistungsverzeichnis.zip` (3.3 LV package), `https://www.gaeb.de/wp-content/uploads/2019/04/Leistungsverzeichnis.zip` (3.2), `https://www.gaeb.de/wp-content/uploads/2022/11/Regeln_fuer_X84_GAEB_DA_XML_3.1_2009-12.pdf` (X84 rules, 48 KB, opened: exists), `https://www.gaeb.de/wp-content/uploads/2022/11/Musterdateien_GAEB_DA_XML_3.1_2009-12.zip` (official sample files), checker: `https://www.bvbs.de/wp-content/uploads/2024/07/GAEBXmlChecker.zip`. No login is needed for the PDF; the page states no licence terms. |
| AI is moving in, but on the other side | https://www.baulinks.de/webplugin/2026/0937.php4 (opened; 2026-07-02) | BauGPT Pro exports LVs **as X83** for planners and contractors. X84 bidding is not mentioned. |

**Not verified:** search volumes (not open to us); how many tenders demand X84 versus PDF only; whether mein.gaeb-365 processes files locally (it is listed as SaaS/cloud, so probably not); customer counts of any competitor (GetApp shows no reviews for GAEB-Online).

**The Scout's claims, checked:** "Nothing hosted is aimed at a trade that bids a few times a year" is **false**: mein.gaeb-365.online is hosted and aimed at trades. It is a monthly plan with a login, though. "WebGAEB does not state X84 pricing" is **half true**: the free Dangl converter can output phase 84, but only via Excel and a server upload. The paid desktop prices are confirmed.

## 4. Positioning

**The gap in one sentence:** the only way to turn one X83 into a priced X84 without installing Windows software, uploading the tender or taking out a monthly plan, paid per tender (19 EUR) and checked against the GAEB rules before you upload it to the eVergabe platform.

| Alternative | URL | What it lacks for our segment |
|---|---|---|
| GAEB-Online 2025 | https://www.gaeb-online.de | 120 EUR one-off, Windows only (Mac needs Parallels/RDP), must be installed. |
| Wingaebxml Bietertool | https://www.wingaeb.de | From 125 EUR one-off, desktop install. Viewer free, export paid. |
| GAEB-Kalkulator / X83-Konverter D84-Generator | heise listings above | 89 / 101 EUR, Windows, Excel based. |
| mein.gaeb-365.online EDIT | https://www.softguide.de/programm/gaeblv/vorschau | From 19 to 25 EUR **per month**, account, cloud upload of the tender. |
| Dangl GAEB Converter / WebGAEB (free) | https://www.dangl-it.com/articles/convert-gaeb-files-with-the-free-gaeb-converter | Round trip through Excel (needs Excel), server upload, one download per conversion, no check that every item is priced and no totals review. |
| Trade suites (STREIT, Heitker, AVAPLAN, ORCA) | streit-software.de comparison | 390 to 3,840 EUR or prices on request; far too much for 2 to 5 bids a year. |

**What only this product does:**
1. **The tender never leaves the device.** Parsing, pricing, totals and X84 writing all run in the browser. Say it in one plain sentence on the page. The only thing that goes to our server is an anonymous fingerprint (a hash), at payment time.
2. **No install, no account.** It works on Mac, Windows, Linux and iPad in a current browser. Drop the file and see the LV in seconds.
3. **Pay per tender.** 19 EUR for one bid is less than any licence or one month of the cloud plan. A 12-month pass at 79 EUR suits firms that bid more often. No subscription and no auto-renewal.
4. **A bid check before export:** every required item priced; optional (Bedarf) and alternative (Wahl) items handled correctly; bidder text fields (Fabrikat/Typ) filled; totals per section and an overall net total to copy into the Angebotsschreiben; the output is the same GAEB version as the input.
5. **Free before you pay:** open, price, check, totals and a print/PDF of the priced LV are free. You pay only for the X84 download.

## 5. MVP scope

### In
- **Import** `.X83` in GAEB DA XML **3.1, 3.2 and 3.3** (detect the version from the XML namespace and `GAEBInfo/Version`). Also open `.X84` read-only for the free "X84 prüfen" page (same parser).
- Read: project info (PrjInfo), client (OWN), BoQ structure with categories (BoQCtgy, any depth), items with ordinal number (RNoPart chain), short text, long text (rendered as plain formatted text), quantity, unit (QU), item kinds: normal item, lump-sum item, Bedarfsposition with and without total, Wahl/Alternativ items (alternative groups), Zulage items, items marked not applicable, and bidder text complements (Bieterergänzungen / text complements that the bidder must fill in). The Architect takes exact element and attribute names from the **official XSD and the "Regeln für X84" PDF**, not from this spec.
- **Price entry:** one EP input per item (German decimal comma, also accepts a dot; up to the decimals the LV allows, default 2). Keyboard flow: Enter or Tab jumps to the next unpriced item. Live GP = round half-up (Qty × EP, 2 decimals). Section subtotals and a net total. Bedarfspositionen without total and alternative items are priced but **not** added to the total, with a visible label explaining why.
- **Bidder data form:** company name, street, postcode, town (needed for the CTR/bidder block of the X84). Stored only in the browser.
- **Bid check panel** (always visible): count of unpriced required items (each one a link that jumps to the item); empty bidder text complements; items priced 0,00 (allowed only when typed explicitly, shown as a warning); a total that differs from the sum of the parts (must never happen; it is an internal guard).
- **Autosave** of prices and bidder data in IndexedDB, keyed by the LV fingerprint; reopening the same X83 restores them. A "Alles löschen" button deletes the local data.
- **Print view** (free): A4 portrait table with OZ, Kurztext, Menge, Einheit, EP, GP, section subtotals, net total, bidder name and date; print CSS only, no PDF library. The browser's "Save as PDF" covers the "x83 in pdf umwandeln" query.
- **X84 export (paid):** writes phase 84 in the **same GAEB version and namespace** as the input. It keeps every item's ID and RNoPart chain and the order, keeps the quantities unchanged, writes UP and IT per item, the category totals, the BoQ total and the bidder block. Long texts are left out unless the X84 rules require them. Text complements go in. The file name is `<original name>.X84`. Before the download, a summary dialog shows the item count, priced count, net total and version, plus the line "Bitte die Angebotssumme mit Ihrem Angebotsschreiben abgleichen."
- **Unsupported-feature gate:** if the X83 asks for things the MVP cannot write (price components UPComp, i.e. Lohn/Stoff shares; time-and-material item lists that need hourly rates in a special block; several BoQs in one file; GAEB 90 D83 or GAEB 2000 P83; ÖNORM), show a plain German message **before** the paywall and do not offer the purchase. Never take money for a file we cannot write correctly.
- **Payment:** Stripe Checkout (test mode) with two products. A Cloudflare Pages Function creates the session; a second one checks it after the redirect and returns a **signed unlock token** (Ed25519). The browser checks the signature with the public key and stores the token in localStorage. It also shows the token as a copyable "Freischaltcode" for use on another device. No accounts and no customer database.
- **Pages:** see section 8. Plus /impressum and /datenschutz from `src/content/legal/`.

### Out (explicitly)
- GAEB 90 (D83/D84), GAEB 2000 (P83/P84), ÖNORM A2063, X81/X86/X89, Formblatt 221/223 calculation, price components (UPComp), discounts (Nachlass) inside the X84, Excel import or export, price databases, AI price suggestions, collaboration, user accounts, server-side storage of anything, a native app, a phone-optimised layout (tablet and desktop only), multiple languages.
- Schema validation **in the browser** (no XSD shipped to the site in the MVP; see Legal notes). Validation against the official XSD happens in the test suite.

## 6. Acceptance criteria (QA checks each one without a live account)

**Data and fixtures (do these first; the studio's last builds stalled on missing data)**
1. `tests/fixtures/gaeb/official/` contains the official GAEB 3.1 (2009-12) sample files from the Musterdateien zip (at least one `.X83`, plus an `.X84` if the zip has one), the official **X83 and X84 XSDs for 3.1, 3.2 and 3.3**, and `SOURCE.md` with each source URL and its download date. The files were downloaded by a script (`scripts/fetch-gaeb.sh` or `.mjs`) that the Builder ran **once** and committed. Tests never touch the network.
2. `tests/fixtures/gaeb/synthetic/` contains hand-written X83 files for **3.2 and 3.3**, each valid against its official X83 XSD (checked in a test). Together they cover two category levels, a normal item, a lump-sum item, a Bedarfsposition with total and one without, an alternative group (base plus alternative), a Zulage item, an item with a bidder text complement, a quantity with 3 decimals, umlauts and ß in texts, and an item with quantity 0. Each has an `expected.json` (item count, category count, the list of OZ, and the expected net total for a given price set).
3. A generated stress fixture with 2,000 items parses in under 1 second in Node (`npm test`).

**Parsing and pricing**
4. `npm test` parses every fixture and matches `expected.json` (OZ list, item kinds, quantities, units, short texts).
5. Totals: for each synthetic fixture with its price set, the computed net total equals `expected.json` to the cent. Bedarfspositionen without total and alternative items are excluded. Rounding is half-up to 2 decimals per item, and sections sum the rounded item totals.
6. German number input: "1.234,5", "1234,50" and "1234.50" all parse to 1234.50. Display uses `de-DE` (1.234,50 €).

**Export**
7. For every 3.1/3.2/3.3 X83 fixture, a fully priced export produces an X84 that **validates with `xmllint --noout --schema <official X84 XSD of the same version>`** in the test suite. If xmllint is missing, the test fails with a clear message; it is not skipped silently.
8. The X84 keeps every item ID and RNoPart chain in the original order, the quantities are unchanged, the exchange phase is 84 and the version and namespace equal the input's. A test compares the item lists of input and output.
9. Re-import: the exported X84, opened with the app's own parser, shows the same EPs, GPs and net total.
10. Export is blocked while required items are unpriced. The check panel lists them, and a click scrolls to and focuses the input.
11. An X83 that uses an unsupported feature (test fixture with UPComp, plus a D83 text file and a P83 file) shows the German "nicht unterstützt" message, and the buy button is not rendered.

**Privacy and payment**
12. No request body contains LV content. A unit test checks that the checkout request payload has exactly the keys `product` and `fingerprint` (a 64-char hex SHA-256). The fingerprint is computed from the LV structure (project name, BoQ ID, item IDs and OZ), so it is identical before and after prices change.
13. Unlock tokens (tests generate a throwaway Ed25519 keypair): a valid "single" token unlocks export only for its fingerprint and only until its expiry (60 days); a valid "year" token unlocks any LV until its expiry (365 days); a token with a changed byte, a wrong key or a past expiry is rejected.
14. The Pages Functions are unit-tested with a mocked Stripe API: `POST /api/checkout` returns a Checkout URL for `single` and `year` and rejects any other product with 400; `GET /api/unlock?session_id=…` returns a token only when the mocked session has `payment_status: "paid"`, and returns 402 otherwise. Missing env vars return 503 with a German message. Secrets are read only from env (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_SINGLE`, `STRIPE_PRICE_YEAR`, `UNLOCK_SIGNING_KEY`, `PUBLIC_UNLOCK_KEY`, `SITE_URL`), and all of them are listed in `.env.example` without values.
15. The site sets no cookies and loads no third-party scripts (no Stripe.js; Checkout is a redirect). Optional analytics must be cookie-free (Cloudflare Web Analytics) or absent.

**Pages and content**
16. The pages in section 8 exist, each with a unique German `<title>` and meta description, and are listed in `sitemap.xml`. `robots.txt` references the sitemap.
17. `/impressum` and `/datenschutz` render the files in `src/content/legal/` unchanged (German; English versions linked if present).
18. `/preise` shows both prices as net plus VAT, says "kein Abo, keine automatische Verlängerung", says what is free, and states plainly that the tool cannot guarantee that a client accepts a bid and that the bidder must check the total against the Angebotsschreiben. There are no fake reviews, user counts, countdowns or "x people bought" claims.
19. The page text says plainly, once, near the drop zone: "Ihre Datei wird nur in diesem Browser verarbeitet und nicht hochgeladen." It is true per criterion 12.
20. `npm run build` and `npm test` pass. Print view: a Playwright or jsdom test (or a snapshot of the print-only HTML) shows the columns OZ, Kurztext, Menge, Einheit, EP, GP and the net total.

## 7. Monetisation

**Model:** one-off purchases (paid per use), Stripe Checkout, test mode during the build.

| Product | Price | What it unlocks |
|---|---|---|
| Free | 0 | Open X83/X84, read the LV, enter prices, live totals, bid check, print/PDF, autosave in the browser |
| **Einzelangebot** | **19 EUR net** (22.61 EUR incl. 19% VAT) | X84 export for **one** LV (bound to its fingerprint), with re-exports for corrections for 60 days |
| **Jahrespass** | **79 EUR net** (94.01 EUR incl. VAT) | Unlimited X84 exports for 365 days on any LV; the Freischaltcode works on other devices. No auto-renewal |

**Paywall placement:** the "X84 erstellen" button. Everything before it is free, so the visitor has already invested an hour of pricing when they meet the price, and they have a deadline. The price is shown on the start page and /preise from the start (no surprise). Stripe creates a proper invoice with VAT, which a business needs.

**Why these prices:** they sit below every paid alternative for an occasional bidder. GAEB-Online costs 120 EUR plus a Windows PC; Wingaeb 125 EUR; gaeb-365 is 19 to 25 EUR per month. 19 EUR is less than one hour of a Meister's billed time. The 79 EUR pass serves firms with 5+ bids a year and still costs less than any licence. No ads, no affiliate links.

**Expected profit (12 months after launch; the ranking number):**
- *Channel reach (bottom-up):* the search cluster "x83 datei öffnen / bearbeiten / ausfüllen / in pdf umwandeln", "gaeb x84 erstellen / konverter / öffnen", "x83 in x84 umwandeln". Volume is **not measured**: autocomplete gives 10 + 5 variants, which proves the queries exist, not their size. Assumed: a new site reaches ~0 visits in months 1 to 3, then ~150 to 400 a month as the tool pages rank. That makes **~2,500 visits in year 1 (assumption)**. Conversion to a purchase: **2% (assumed**; the visitor arrives holding a tender with a deadline, but many only want to view or print). That gives **~50 payers**. Mix of 80% Einzelangebot and 20% Jahrespass: average 31 EUR net, so **~1,550 EUR revenue**. Costs: domain ~15 EUR, Cloudflare free tier 0, Stripe fees ~1.5% + 0.25 EUR per payment ≈ 40 EUR. **Expected profit ≈ 1,450 EUR; I state 1,300 EUR** to allow for refunds and a slower ramp.
- *Cross-check:* no competitor publishes a customer count. GetApp shows no reviews for GAEB-Online, so reviews give no floor, and I have **no real comparable revenue**. The price evidence (89 to 125 EUR one-off; 19 to 25 EUR/month) proves people pay, not how many. I therefore use the lower, channel-based figure.
- *To reach 5,000 EUR/year* we need **~160 payers** at the 31 EUR average. With the assumed traffic the channel reaches ~50 in year 1, so it **cannot** reach 5,000 EUR in year 1. It could in year 2 if the tool pages rank in the top 3 for "x83 datei bearbeiten/ausfüllen".
- *Upside (1 launch in 10):* 12,000 visits × 3% = 360 payers × 33 EUR ≈ 11,900 EUR, minus ~250 EUR in fees, so **≈ 11,500 EUR**.

## 8. Target queries and page plan

Every page is a working tool or a substantive answer. There are no generated page farms (the studio's procurement directory lost ~95% of its impressions; avoid that pattern).

| Page | Queries | What is on it |
|---|---|---|
| `/` | x83 datei öffnen, x83 datei bearbeiten, x83 datei ausfüllen, gaeb angebot abgeben ohne software, leistungsverzeichnis gaeb bepreisen | **The tool.** Drop zone, the privacy sentence, then the LV appears. Below the fold: three steps (öffnen → Preise eintragen → X84 herunterladen), the free versus paid line and the formats supported. |
| `/x84-erstellen` | gaeb x84 erstellen, x83 in x84 umwandeln, gaeb x84 konverter, gaeb x83 x84 | The tool entry plus a real guide: what phase 83/84 means; that the return format must match the tender (D83 → D84, X83 → X84); what the client checks; Bedarfs- and Wahlpositionen; bidder text fields; uploading to the eVergabe platform together with the Angebotsschreiben. |
| `/x83-in-pdf` | x83 datei in pdf umwandeln (online), x83 drucken | The tool opens in print mode: an empty or priced LV as an A4 table, then "Drucken / Als PDF speichern". Free. Feeds the funnel. |
| `/x84-pruefen` | gaeb x84 öffnen, gaeb x84 einlesen, x84 datei | Open any X84 (your own or one received): items, prices, totals and unpriced items. Free. A sanity check before upload. |
| `/preise` | gaeb software günstig, gaeb x84 kosten | Prices, what is free, no subscription, VAT and invoice, the limits of the MVP, and an honest comparison table with the alternatives in section 4 (facts with links, no disparagement). |
| `/hilfe` | x83 dateiformat, gaeb bedarfsposition preis, wahlposition gaeb | FAQ: supported versions, unsupported features and what to do instead, Freischaltcode on another device, data stays local, how to delete local data. |
| `/impressum`, `/datenschutz` | — | Company texts from `src/content/legal/`, unchanged. |

## 9. Success metrics and kill criteria

Launch target: 2026-11-27 (after QA and the human go-live steps).
- **Kill** if there are fewer than **100 organic clicks** in Google Search Console in the 90 days after launch (check on 2027-02-28).
- **Kill** if there are fewer than **5 paid unlocks** (Stripe live) by **2027-04-30**.
- **Pause sales** at once if an exported X84 is reported as rejected by a client's AVA program and the cause cannot be fixed in one build session.
- **Success signal:** 30 or more paid unlocks by 2027-06-30. Then consider D83/D84 (GAEB 90) as the next format, because the Saxony note shows D83 tenders still exist.

## 10. Legal and platform notes

- Hosting: Cloudflare Pages (static) plus Pages Functions for `/api/checkout` and `/api/unlock`. No database. No personal data stored by us. Stripe collects the buyer's e-mail and billing data as the payment processor. The site processes no tender content on any server.
- Impressum and Datenschutz: show `src/content/legal/` unchanged (rule 6). The product uses Stripe (payments) and Cloudflare (hosting); this is stated as a fact for the operator, and no legal text is written by agents.
- Cookies: none. localStorage and IndexedDB hold only the user's own LV prices, bidder data and the unlock token on their own device; `/hilfe` explains how to delete them.
- GAEB: an open exchange standard. The schemas, rules and sample files are public downloads on gaeb.de with no login. The page states no licence terms, so the XSDs and sample files are used **only in the test suite** (`tests/fixtures`, with source URLs) and are **not shipped** to the public site. Do not claim "GAEB-zertifiziert" (certification is a separate process). Say "nach GAEB DA XML 3.1–3.3, geprüft gegen die offiziellen Schemadateien" only after criterion 7 passes.
- Liability: copy must not promise acceptance by the client. The bidder stays responsible for the bid. Sell to businesses; the price page shows net prices plus VAT.
- Trademarks: "GAEB" is used descriptively for the file format only; no competitor logos.

## 11. Human tasks

1. Create (or reuse) a Stripe account. Create two one-off prices (19 EUR and 79 EUR net, tax-exclusive, VAT 19% via Stripe Tax or manual tax rates) and turn on invoice creation for Checkout. Put `STRIPE_SECRET_KEY`, `STRIPE_PRICE_SINGLE` and `STRIPE_PRICE_YEAR` into the Cloudflare Pages env (test keys first).
2. Generate an Ed25519 keypair. Store the private key as the secret `UNLOCK_SIGNING_KEY` and the public key as `PUBLIC_UNLOCK_KEY` in Cloudflare Pages.
3. Register a domain (~15 EUR/year), connect Cloudflare Pages and set `SITE_URL`.
4. Before going live: import one exported X84 into a real AVA program (for example a free trial of GAEB-Online or ORCA AVA on a Windows PC) and run the official GAEB-XML-Checker (bvbs.de) on it.
5. Add the site to Google Search Console and submit the sitemap.
6. Switch Stripe to live mode when steps 1 to 5 are done.

## 12. Look and feel

The visitor is the owner or office worker of a small trade firm, often in the evening two days before the deadline, slightly anxious and holding a file type they have never seen. They want to see their LV on screen within seconds and to trust that nothing is lost or sent anywhere. The product is the digital cousin of the **printed tender LV on green-bar continuous paper (Endlospapier / Tabellierpapier)**: pale green and white alternating bands, a narrow sprocket-hole margin, monospaced figures in strict columns (OZ, Menge, Einheit, EP, GP), and dotted fill-in lines where the bidder writes prices in **blue ballpoint ink**. Missing prices are marked as if with a **red correction pencil**, and a successful check ends with a round **"Angebot geprüft" rubber stamp** next to the total. The mood is calm, sober and Amt-like but warm, like a Bauamt clerk who is on your side. Avoid gradients, glass effects, stock photos of hard hats and any "AI" styling.

---

Sources used: see the tables in sections 3 and 4. Every URL there was opened, except where it is marked "search result seen".
