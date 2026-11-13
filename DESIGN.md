# DESIGN: LV-Bepreiser

Brand kit by the Designer. It replaces the Architect's first direction but keeps its core idea, which was right. Tokens and base styles live in `src/styles/brand.css`. Art lives in `public/brand/` and `public/art/`. Read this before touching markup or CSS.

## 1. The real-world cousin

**The printed tender LV on green-bar continuous paper (Endlospapier).** Pale green and paper bands in blocks of three rows. A punched sprocket margin on both edges. Typewritten figures in strict columns (OZ, Kurztext, Menge, Einheit, EP, GP). Dotted lines where the bidder writes prices in **blue ballpoint**. Missing prices get the **red correction pencil**. A finished, complete bid gets a round blue **"geprüft" rubber stamp** beside the net total.

The visitor holds a file type they have never seen, often late in the evening two days before the deadline. The site should feel like a calm Bauamt clerk who is on their side: sober, exact and warm. It should not look like software.

**What each colour means:** what the tender prints is *Farbband* (ribbon ink). What the visitor does or writes is *Kuli-Blau*. What is missing is *Rotstift*. That rule decides every colour question.

## 2. Name and mark

- **Name:** **LV-Bepreiser**, set in HTML beside the mark in Zilla Slab 700. It uses the trade's own words, needs no explaining and works in search.
- **Mark** (`public/brand/logo.svg`): one sheet of tender printout with its **punched sprocket margin** (four holes behind a perforation), two **green bars**, and the round **blue stamp** pressed over its lower-right corner, breaking the outline. The sheet stands for the tender, the stamp for "your bid is complete". It has no text. It is readable at 16 px; the favicon (`public/favicon.svg`) drops to two holes and a solid stamp centre.
- **Lockup:** the mark at 40 px, a 12 px gap, then "LV-Bepreiser" at 24 px Zilla Slab 700 in Farbband. Use the class `.brand-lockup` (with `<img src={url('brand/logo.svg')} alt="" width="40" height="40">`). On mobile: mark 32 px, name 20 px.

## 3. Palette: exactly five flat colours

| Token | Name | Hex | Role |
|---|---|---|---|
| `--paper` | Papier | `#F4F6EE` | The dominant surface. The page itself is the paper. Never pure white on screen. |
| `--band` | Bandgrün | `#DDEBD7` | The green bars, the drop-zone field, notice bands. Never used for text. |
| `--ink` | Farbband | `#22302A` | Ink: all text, rules, outlines, the hard offset shadow. Never black. |
| `--accent` | Kuli-Blau | `#1B3E9C` | Used sparingly: the **one primary button**, the visitor's EP inputs and bidder data, the stamp, the focus ring. |
| `--signal` | Rotstift | `#B3261E` | Missing prices, errors, "nicht unterstützt". Never decoration. |

Contrast (WCAG): on Papier, Farbband 12.6:1, Kuli-Blau 8.7:1, Rotstift 6.0:1. On Bandgrün, Farbband 11.1:1, Kuli-Blau 7.6:1. Papier on Kuli-Blau (button text) is 8.7:1. `--ink-muted` (Farbband at 72 %) is only for secondary text: 5.4:1 on Papier and about 4.7:1 on Bandgrün, so never lighter than that. Disabled controls are the same colours at 45 % opacity. Do not add a grey.

No other hues exist: `global.css` sets `--color-*: initial`, so Tailwind's default palette is gone. The only colour utilities are `bg-paper text-ink text-accent text-signal bg-band` (plus the German aliases).

## 4. Type

| Role | Face | npm package | Weights |
|---|---|---|---|
| Display and running text | **Zilla Slab**: a slab serif with the sober voice of a printed form | `@fontsource/zilla-slab` | 400, 600, 700 |
| Figures, OZ, labels, inputs, buttons, the LV | **Courier Prime**: a typewriter face. It is monospaced, so every figure lines up | `@fontsource/courier-prime` | 400, 700 |

Both are imported once, at the top of `brand.css`. No other faces.

Scale (root 18 px):

| Token | Size | Use |
|---|---|---|
| `--fs-h1` | 32 → 60 px fluid, Zilla 700, line-height 1.04 | the one headline per page |
| `--fs-total` | 32 → 56 px, Courier 700 | the net total |
| `--fs-h2` | 30 px, Zilla 700 | section heads |
| `--fs-h3` / `--fs-lead` | 22 px | sub-heads / the one sentence under the h1 |
| `--fs-body` | 18 px / 1.5, Zilla 400 | running text, max 68ch |
| `--fs-table` / `--fs-small` | 17 px, Courier 400 | LV rows, inputs, nav, the privacy line. **Nothing readable is smaller.** |
| `--fs-label` | 15 px, Courier 700 caps, +0.08em | column heads and eyebrows only (short, uppercase) |

German typography: quotes „…“, en dash –, `de-DE` figures (1.234,50 €), a non-breaking space before € and units.

## 5. Grid and spacing

- Spacing steps only: 4, 8, 12, 16, 24, 40, 64, 104 px (`--s-1` … `--s-8`).
- Page max 1200 px. Side margin `--margin` = 20 px on phones, rising to 40 px. Desktop grid: 12 columns with 24 px gutters. Phone grid: 1 column.
- Prose stays at 68ch and left-aligned. The LV sheet and the drop zone use the full width.
- Sections are separated by **rules and space, never boxes**: 1 px Farbband, 2 px dotted (the fill-in line), 2 px dashed (the perforation) or a 6 px double rule (totals only).
- Radius 0 everywhere. Only the sprocket holes and the stamp are round.
- Controls: buttons are 52 px high (60 px for the large drop-zone button), inputs 48 px.

## 6. Illustration style (all files in `public/art/`)

- **Flat shapes in the five colours.** No gradients, blur, filters or images.
- **Line weights, the same at display size (≈ 2 px):** outlines are 4 units in the 1200-wide hero and 3 units in the 480-wide spots. Inner rules and perforations are half that. Paper has square corners and mitred joins. Only handwriting (blue prices, red pencil marks) has round caps.
- **Typed text is drawn as short Farbband bars, and handwriting as a blue wave with a comma tick** (euros, cents). There is no real text in the art, so nothing breaks when the SVG loads without the web fonts.
- **Depth without gradients:** objects overlap; paper casts a **hatched shadow** (45° Farbband lines, a `<pattern>`), offset down and right; stacks of fan-fold slabs alternate Papier and Bandgrün.
- Sprocket holes are solid Farbband dots in the illustrations. In UI edges they are Papier rings (the `--sprocket-tile`), because a column of solid dots is too loud next to text.
- **The recurring cast:** the continuous-paper sheet, the blue ballpoint (blue barrel, Farbband grip with green ribs, clip), the red pencil, the stamp, the fan-fold stack, the green drop field.
- Do **not** add people, laptops, screens, hard hats, blueprints, icon-pack icons or emoji.

## 7. Signature element: the Lochrand (sprocket margin) and the stamp

1. **Lochrand.** A 28 px strip of punched holes behind a dashed perforation. It runs down both sides of every LV sheet (`.sheet`), down the left edge of the drop zone (`.dropzone::before`) and through the logo. `public/art/pattern.svg` is one 32 × 40 tile of it for `repeat-y` backgrounds.
2. **The stamp.** An inline SVG `Stamp.tsx` in Kuli-Blau: an outer ring (3 px), an inner ring (1.5 px), "ANGEBOT GEPRÜFT" on a `<textPath>` between the rings in Courier Prime 700, and the date in the middle. It sits rotated −7° beside the net total, at `opacity .9` with `mix-blend-mode: multiply` (class `.stamp`). It **only** appears when the bid check has zero blocking issues. It presses in once (scale 1.15 → 1, 180 ms), which is skipped under reduced motion.

## 8. The first screen (the tool must be visible without scrolling)

**Copy (use exactly):**
- Eyebrow (`.eyebrow`): `GAEB DA XML 3.1–3.3 · X83 → X84`
- H1: **„X83-Datei ausfüllen und als X84 abgeben“**. It names the visitor's job ("x83 datei ausfüllen") and must stay on 2 lines at 1280 and at 390.
- Lead (`.lead`, 1 sentence): „Leistungsverzeichnis öffnen, Einheitspreise eintragen, Summen prüfen – und die fertige X84-Datei für die Vergabeplattform speichern. Ohne Installation, ohne Konto.“
- Drop zone button (`.btn btn-primary btn-large`): **„X83-Datei auswählen“**
- Drop zone hint (`.dropzone__hint`): „oder die Datei hierher ziehen“, with `.dropzone__example` „z. B. Leistungsverzeichnis_Malerarbeiten.X83“
- Privacy line directly under the drop zone (`.privacy`): „Ihre Datei wird nur in diesem Browser verarbeitet und nicht hochgeladen.“
- Price line (`.price-line`): „Öffnen, bepreisen, drucken: kostenlos · X84-Datei: 19 € netto pro Angebot“ with a link to `/preise`.

**Desktop 1280 × 800**

```
| [mark] LV-Bepreiser             X84 erstellen  Als PDF  X84 prüfen  Preise  Hilfe |  72 px, 1 px rule below
|                                                                                 |
| GAEB DA XML 3.1–3.3 · X83 → X84          |                                       |  cols 1–7: text
| X83-Datei ausfüllen und                  |      hero.svg (≈ 460 × 276)           |  cols 8–12: art,
| als X84 abgeben                 (60 px)  |      bottom-aligned, its ground rule   |  sits ON the
| Leistungsverzeichnis öffnen, … (22 px)   |      touching the drop zone's top edge |  drop zone
|=================================================================================|
|o:  [ X83-DATEI AUSWÄHLEN ]                      OZ  KURZTEXT  MENGE  EP  GP      |  drop zone, 12 cols,
|o:  oder die Datei hierher ziehen                                                 |  min-height 220 px,
|o:  z. B. Leistungsverzeichnis_Malerarbeiten.X83                                  |  Bandgrün, dashed
|=================================================================================|
| Ihre Datei wird nur in diesem Browser …    Öffnen, bepreisen, drucken: kostenlos · X84: 19 € |
```

The drop zone ends at about y = 600, and the privacy and price lines at about y = 650. The empty drop zone is the empty LV sheet: `.dropzone__heads` types the column heads in its top right corner. When a file is read, **the LV sheet replaces the drop zone in the same place**, and the hero row collapses to the project name and client (so the work gets the screen).

**Phone 390 × 844**

```
| [mark] LV-Bepreiser        Preise  Hilfe |  56 px (full nav repeats in the footer)
| GAEB DA XML 3.1–3.3 · X83 → X84          |
| X83-Datei ausfüllen                      |  32 px, 2 lines
| und als X84 abgeben                      |
| Leistungsverzeichnis öffnen, … (18 px)   |  ≤ 4 lines
| [=========== X83-DATEI AUSWÄHLEN ======] |  drop zone, button full width
| oder die Datei hierher ziehen            |
| Ihre Datei wird nur in diesem Browser …  |
| … kostenlos · X84-Datei: 19 € netto      |  ends ≈ y 700
```

On phones the hero art moves **below** the price line, at full width, before "So geht's". Keep the lead to 18 px there.

## 9. Below the fold (home)

1. **"So geht's" as an LV excerpt** (`.steps-lv`): three rows under a 2 px rule, each with spot art (200 px), an OZ, a title with one sentence, and a price column. This shows the three steps and the free/paid split at the same time:
   - `01` spot-1 · **Datei öffnen**: Ihr Leistungsverzeichnis erscheint als Tabelle. · `0,00 €`
   - `02` spot-2 · **Preise eintragen**: Summen und fehlende Positionen sehen Sie sofort. Drucken und als PDF speichern. · `0,00 €`
   - `03` spot-3 · **X84 abgeben**: Die geprüfte Datei für die Vergabeplattform herunterladen. · `19,00 € netto`
2. **Formats**, as a short typed list: "Liest: X83 (GAEB DA XML 3.1, 3.2, 3.3) · Schreibt: X84 in derselben Version · Nicht: D83, P83, ÖNORM".
3. Footer: 1 px rule, full nav, Impressum · Datenschutz.

No three-equal-cards row, no testimonial band, no gradient CTA strip.

## 10. Components and their states (classes in `brand.css`)

- **Primary button** `.btn.btn-primary`: Kuli-Blau fill, Papier text, 2 px Farbband border, a 3 px hard Farbband offset shadow. Hover turns the fill Farbband; active presses into the shadow. Courier Prime 700, sentence case (`X83-Datei auswählen`, `X84 erstellen – 19 € netto`). **One per screen.**
- **Secondary** `.btn.btn-secondary`: Papier, Farbband border, turns blue on hover. **Text link**: underlined 1 px, 2 px on hover.
- **Drop zone** `.dropzone`: the empty state of the tool. It has states: idle (Bandgrün, dashed), `.is-over` (Papier, solid blue border), keyboard focus (blue ring around the field), working, done and error, described below. The `<input type=file>` is `.visually-hidden` inside a `<label>`, so the browser's default file button is never shown (and if it ever is, `::file-selector-button` is styled).
- **Working:** the drop zone keeps its size and shows `.working` „Leistungsverzeichnis wird gelesen“ with a blinking typewriter caret.
- **Done:** the `.sheet.lv.bars` grid replaces the drop zone. EP fields are `.fill-in.fill-in--ep` (blue, dotted line, no box). A missing item has `.lv-row.is-missing`: a red underline under its OZ plus a `.flag-missing` „fehlt“. Excluded items (Bedarf without total, Wahl) carry `.flag-excluded` with the reason. Totals use `.lv-sum`; the net total uses `.total` with the double rule, `.total__value` and `.total__label` „netto“, and the stamp beside it.
- **Error / unsupported:** `.notice-error` with a label „NICHT UNTERSTÜTZT“ in Rotstift, a plain sentence on what to do instead, and `spot-error.svg` (240 px) beside it. No buy button is rendered.
- **Empty (other pages, e.g. /x84-pruefen before a file is chosen):** `spot-empty.svg` above the drop zone.
- **Check panel:** `.checklist` with typed marks `[x]` (blue, done), `[ ]` (open) and `[!]` (Rotstift, blocks export; the item is a link to the row).
- **Fields** (bidder data): `.field` with an uppercase label above and a dotted fill-in line. Selects and checkboxes are restyled (square box, blue typed ×). Never the browser's default look.
- **Notices:** `.notice` is a Bandgrün band; `.notice-error` is Papier with 1 px Rotstift rules above and below. **Never a one-sided thick border.**
- **Focus:** a 3 px Kuli-Blau outline with a 2 px offset on everything. Selection is Bandgrün.

## 11. Voice

Plain German, "Sie", short sentences, the vocabulary of the trade and the Bauamt (Leistungsverzeichnis, OZ, EP, GP, Bedarfsposition, Angebotsschreiben, Vergabeplattform). Say what happens. No exclamation marks, no promises that the client accepts the bid, no "Unlock/Seamless" talk, no invented numbers.

1. „X83-Datei auswählen“
2. „142 Positionen gelesen, 3 noch ohne Preis.“
3. „Position 02.0040 hat noch keinen Einheitspreis.“
4. „Diese Datei enthält Preisanteile (Lohn/Stoff). Die kann der LV-Bepreiser noch nicht schreiben – bitte nicht kaufen.“
5. „Bitte die Angebotssumme mit Ihrem Angebotsschreiben abgleichen.“

## 12. Files in the kit

| File | What it shows | Where it goes |
|---|---|---|
| `src/styles/brand.css` | Tokens, the two faces, base type, `.btn`, `.dropzone`, `.fill-in`/`.field`/select/checkbox, `.sheet`, `.bars`, `.lv-*`, `.total`, `.stamp`, `.checklist`, `.notice*`, `.working`, `.steps-lv`, print | Imported first in `Base.astro` (done) |
| `src/styles/global.css` | Tailwind 4 plus `@theme`, mapped to the five colours only | Imported after brand.css (done) |
| `public/brand/logo.svg` | The mark: a sprocket-margin sheet, green bars, the blue stamp over the corner | Header lockup, 40 px |
| `public/favicon.svg` | The mark simplified for 16 px | `<link rel="icon">` (already wired) |
| `public/art/hero.svg` | 1200 × 720. Left: the tender as it arrives (X83): green-bar page, empty dotted price lines, two OZ marked in red. Right, in front: the same LV priced (X84): blue prices, typed GPs, net total under a double rule, the stamp. The blue ballpoint writes the last price. Both pages rise from one fan-fold stack on a ground rule. | Home, first screen right (desktop), below the tool (phone). `alt` is in the file's `aria-label`; use `alt=""` if the headline says the same. |
| `public/art/spot-1.svg` | A page falling into the green drop field (dashed border, sprocket margin), a blue arrow | Step 01 „Datei öffnen“ |
| `public/art/spot-2.svg` | Close-up of rows: blue prices on dotted lines, the pen mid-figure, a red-pencilled missing OZ | Step 02 „Preise eintragen“ |
| `public/art/spot-3.svg` | The priced, stamped page sliding into a tray (Ablage), a blue arrow down | Step 03 „X84 abgeben“; also the export dialog |
| `public/art/spot-empty.svg` | A blank page on a fan-fold stack, the pen lying ready | Empty state on /x84-pruefen, /x83-in-pdf |
| `public/art/spot-error.svg` | A page in a foreign format (no columns), crossed out with the red pencil | Unsupported/parse-error notice |
| `public/art/pattern.svg` | One 32 × 40 tile of the Lochrand | Optional `repeat-y` edge for print previews or the footer |

Always load art via `url('art/hero.svg')` from `src/lib/paths.ts` (sub-path previews), with `width`/`height` set to avoid layout shift.

## 13. Implementation notes

- `brand.css` declares `@layer theme, base, brand, components, utilities;`. The brand base sits after Tailwind's preflight, so preflight cannot reset headings or links, and utilities still override components. **Keep `import '../styles/brand.css'` as the first style import in `Base.astro`.**
- The header in `Base.astro` still carries the Architect's inline mark. Replace it with the `.brand-lockup` (logo.svg) and put a 1 px rule under the header. Nav is Courier Prime 17 px; on phones show only "Preise" and "Hilfe" and repeat the full nav in the footer.
- `index.astro`'s scoped `.dropzone` styles predate the kit. Delete them and use the classes in `brand.css`. Don't combine `.dropzone` with `.sheet`.
- `npm run design-check` must stay at 0. Nothing in the kit uses a gradient, blur, side border ≥ 2 px, hover lift, pill radius or font CDN.

## 14. What we will not do

No gradients (not even for the green bars), no rounded cards, no pill buttons, no hover lifts, no soft or glowing shadows, no frosted glass, no one-sided accent borders, no icon packs or emoji, no stock photos, no Inter/Roboto/system-only type, no three-equal-cards section, no gradient CTA band, no fake reviews, user counts or countdowns, no colours outside the five.
