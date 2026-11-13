# GAEB-Angebot im Browser: X83-Leistungsverzeichnis bepreisen und als X84 abgeben

Built by an automated studio. Read `SPEC.md` (what and why), `PLAN.md` (the task list) and this file (how) before changing anything.

## Rules for every contributor, human or agent

- Never commit secrets. Environment variable names go in `.env.example`, values never do.
- Payments stay in test mode until the owner goes live.
- Do not run `git commit` or `git push`. The studio orchestrator commits.
- `npm test` and `npm run build` must pass before work counts as done.
- Pages that answer a search query must be real tools or substantive answers, never thin filler.

## Stack, layout and commands

**Stack:** Astro 5 (static output, TypeScript strict) + Tailwind 4 (via `@tailwindcss/vite`, tokens only) + Preact islands for the tool. Cloudflare Pages Functions (`functions/api/*.ts`) for the two payment endpoints; no other backend, no database. Vitest for tests. XML: `@xmldom/xmldom` (same parser in browser and Node, so tests and app behave the same). Signatures: `@noble/ed25519`. Local storage: `idb-keyval` (IndexedDB) + localStorage for the unlock token. Fonts: `@fontsource/zilla-slab`, `@fontsource/courier-prime` (self-hosted, no CDN).

**Design:** read `DESIGN.md` before touching any markup or CSS. Tokens live in `src/styles/global.css` (CSS custom properties and the Tailwind `@theme`). No gradients (the green bars are `:nth-child` backgrounds), radius 0, five colours only. `npm run design-check` must pass.

### Layout

```
src/
  layouts/Base.astro        fonts, global.css, header/nav, footer, analytics
  styles/global.css         design tokens, base type, .btn, .fill-in, .sheet (sprocket strip), .bars, .notice
  components/               Astro components (LegalPage, Analytics, Stamp …) and Preact islands (*.tsx)
  lib/                      pure TypeScript, no DOM globals unless named *.browser.ts
    paths.ts                url(): EVERY internal link/asset goes through it (sub-path previews)
    legal.ts                reads src/content/legal/*.html (installed by the studio, shown unchanged)
    track.ts                cookie-free analytics events (fixed names, never LV content)
    gaeb/                   parse.ts, model.ts, totals.ts, number.ts, export84.ts, unsupported.ts, fingerprint.ts
    unlock/                 token.ts (verify), checkout.ts (client request)
  server/                   pure handlers for the Pages Functions, take (request, env, fetch) so tests can mock Stripe
  pages/                    one file per route; robots.txt.ts; 404.astro
  content/legal/            studio-installed legal HTML; never edit
functions/api/              checkout.ts, unlock.ts: thin Cloudflare wrappers around src/server/*
tests/
  fixtures/gaeb/synthetic/  hand-written X83 (3.2, 3.3) + expected.json; labelled synthetic
  fixtures/gaeb/official/   official samples + XSDs fetched by scripts/fetch-gaeb.mjs (test-only, never shipped)
  schema/                   xmllint XSD validation (npm run test:schema)
scripts/                    design-check.mjs (studio-owned, do not edit), size.mjs, fetch-gaeb.mjs
```

### Commands (all exit on their own)

- `npm install` / `npm ci` – install (commit `package-lock.json`)
- `npm test` – `vitest run`, everything except XSD validation
- `npm run test:schema` – XSD validation with `xmllint`; fails loudly if xmllint or the official XSDs are missing
- `npm run build` – static site into `dist/`
- `npm run build:preview` – same build under `SITE_URL=https://example.github.io SITE_BASE=/preview`
- `npm run lint` – `astro check` (types)
- `npm run design-check` – the studio's AI-look check
- `npm run size` – gzip size of the built JS/CSS (run after build; budget 120 KB JS)
- `npm run fetch:gaeb` – downloads the official GAEB samples/XSDs once into tests/fixtures (network; human may need to run it)

Never run `astro dev`, `astro preview` or `vitest` without `run`.

### Conventions

- The tender never leaves the device. Only `{ product, fingerprint }` may be sent to `/api/checkout`. A test guards this.
- Money is computed in integer cents. GP = round half-up(Qty × EP) to cents per item; sections sum the rounded GPs. Display with `Intl.NumberFormat('de-DE')`.
- GAEB element names come from the official XSDs in `tests/fixtures/gaeb/official/`. Where they are not yet present, names in code carry a `// XSD-TODO` comment until checked.
- Pure logic in `src/lib` has a `*.test.ts` next to it. UI islands stay thin.
- Copy is German, "Sie", plain; no promises that a client accepts a bid; no fake social proof.
- Env var names are listed in `.env.example`; secrets only in Cloudflare env, never in files.
