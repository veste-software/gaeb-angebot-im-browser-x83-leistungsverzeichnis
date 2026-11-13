# Growth plan (30 days after launch)

Status of on-page basics (done in prep): unique title and description per page, one H1, canonical, Open Graph and Twitter tags, `WebApplication` JSON-LD on `/`, `FAQPage` JSON-LD on `/hilfe` (the questions are visible on the page), sitemap via `@astrojs/sitemap` when `SITE_URL` is set, `robots.txt` with sitemap line. No ratings, no review markup, no user counts.

Positioning to repeat everywhere: one bid, paid per tender (19 EUR net), nothing to install, and the tender file is processed only in the browser. Do not claim acceptance by clients.

## Query to page map

| Query cluster | Page | Honest status |
|---|---|---|
| x83 datei öffnen / bearbeiten / ausfüllen | `/` | working tool |
| gaeb x84 erstellen, x83 in x84 umwandeln | `/x84-erstellen` | tool plus guide |
| x83 in pdf | `/x83-in-pdf` | working print view |
| x84 öffnen / prüfen | `/x84-pruefen` | working viewer |
| Preise, Hilfe | `/preise`, `/hilfe` | answers |

Search volumes are not measured. Nothing is assumed about traffic until Search Console has data.

## Days 1 to 3 (human)

- Add the site to Google Search Console, submit `sitemap-index.xml`, request indexing for the five tool pages.
- Add the site to Bing Webmaster Tools (gives IndexNow).
- Check the live pages once: view source for the JSON-LD, paste the start page into the Rich Results Test.

## Week 1 to 2: pages that may come next (only if Search Console shows the query)

1. `/x83-datei-oeffnen`: only if `/` does not rank for it. Must be a distinct answer (how to tell a real X83 from D83/P83, what to do with ÖNORM and old formats), not a copy of the start page.
2. `/bedarfsposition-wahlposition-bepreisen`: how Bedarfs- and Wahlpositionen are priced and left out of the sum. The content already exists in `/hilfe` and `/x84-erstellen`; give it its own page only if queries appear.
3. `/d83-oeffnen`: honest answer for old-format files (what is not supported and how to get a new file). Useful because it stops wasted visits.

No city, trade or industry variants of the same page.

## Week 2 to 4: distribution (legitimate fit only)

- Handwerk and Bau forums where people already ask "wie fülle ich eine X83 aus" (for example the thread cited in SPEC.md). Answer the question first with the free steps; mention the tool once, say that exporting X84 costs money, and say who built it. No repeated posts.
- Handwerkskammer and Innung newsletters or Merkblätter: offer a short neutral explainer ("Was ist eine X83, was eine X84") with a link. Write to the contact person, one message each, no mass mailing.
- Software directories that list GAEB tools (softguide.de listing was seen in research): submit a plain listing with true facts.
- Hacker News "Show HN" or a German dev community post only about the technical side: GAEB parsing in the browser, no upload, tests against the official XSDs. Fits the privacy-in-browser story.
- Self-host option: not offered. If asked, answer that the page makes no network request with the file; point to the browser network tab so users can verify it. A short "so prüfen Sie das" paragraph on `/hilfe` could be added later.

## Conversion and measurement

- Events (cookie-free, fixed names, never LV content) live in `src/lib/track.ts`. Key funnel: file opened, first price entered, export clicked, checkout started, unlocked.
- Reading the funnel: if many open files but few price entries, the problem is the tool; if many reach the export button but not checkout, the problem is the price or trust, not search.
- Change one thing at a time (price text, button label) and write it into `growth/LOG.md` with date and hypothesis.

## Not doing

Ads, affiliate links, fake reviews, countdowns, mass landing pages, AI-answer ranking promises.
