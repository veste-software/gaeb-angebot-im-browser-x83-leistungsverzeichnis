# DESIGN: LV-Bepreiser

## The idea

The site is the cousin of the **printed tender LV on green-bar continuous paper (Endlospapier)**: pale green and paper-white bands of three lines, a sprocket-hole margin on both sides, typewritten figures in strict columns, and dotted lines where the bidder writes prices in blue ballpoint. Missing prices get the red correction pencil; a clean check ends with a round blue "Angebot geprüft" rubber stamp next to the net total.

**Why not the starting direction (library card catalogue):** the product's whole job is one long, ruled table of items (OZ, Menge, Einheit, EP, GP), and that is a computer printout, not a drawer of index cards. SPEC §12 asks for exactly this printout. We keep two things from the card catalogue: the **typewriter face** and the **punched hole as the one ornament**, which here becomes the sprocket-hole strip.

## Typefaces (self-hosted via npm, no CDN)

| Role | Face | Package | Weights |
|---|---|---|---|
| Headings and running text | **Zilla Slab** (a slab serif with the sober, Amt-like voice of a form) | `@fontsource/zilla-slab` | 400, 600, 700 |
| Figures, OZ, labels, inputs, the LV table | **Courier Prime** (a typewriter face; monospaced, so every figure lines up) | `@fontsource/courier-prime` | 400, 700 |

Import them in `src/layouts/Base.astro` (`import '@fontsource/zilla-slab/600.css'` etc.). No other faces.

**Scale** (root 18 px, set as custom properties in `src/styles/global.css`):

| Token | Size | Use |
|---|---|---|
| `--fs-label` | 15 px, Courier Prime 700, uppercase, letter-spacing .08em | column heads, small labels only |
| `--fs-body` | 18 px / 1.5, Zilla Slab 400 | running text (min. 17 px) |
| `--fs-table` | 17 px / 1.35, Courier Prime 400 | LV rows, inputs |
| `--fs-h3` | 22 px, Zilla Slab 600 | |
| `--fs-h2` | 30 px, Zilla Slab 700 | |
| `--fs-h1` | clamp(36 px, 6vw, 64 px), Zilla Slab 700, line-height 1.02 | the one headline per page |
| `--fs-total` | clamp(32 px, 5vw, 56 px), Courier Prime 700 | the net total |

Running text max 68ch. German quotes „…“, en dash –, thin space before units where it fits. Figures are always `de-DE` (1.234,50 €).

## Colours (exactly five)

| Name | Hex | Use |
|---|---|---|
| Papier | `#F4F6EE` | page and sheet surface (never pure white) |
| Bandgrün | `#DDEBD7` | the green bars (every second block of three rows), the drop zone fill, quiet tints |
| Farbband | `#22302A` | ink: text, rules, the primary button fill (contrast on Papier ≈ 13:1) |
| Kuli-Blau | `#1B3E9C` | everything the bidder writes (EP inputs, bidder data) and the "Angebot geprüft" stamp; focus ring |
| Rotstift | `#B3261E` | missing prices, errors, the unsupported-file notice; never decoration |

No other hues. Disabled states use Farbband at 45% opacity on Papier, not a new grey.

## Grid and spacing

- Spacing steps: 4, 8, 12, 16, 24, 40, 64, 104 px (`--s-1` … `--s-8`). Nothing in between.
- Page: max 1200 px, left-aligned content column of 68ch for prose, the LV sheet runs the full width.
- **The LV sheet:** a 28 px sprocket strip on each side, then a CSS grid: `OZ 10ch | Kurztext 1fr | Menge 11ch | Einheit 6ch | EP 13ch | GP 14ch`. Rows are 1 line of Courier Prime (≈ 32 px tall); categories are a full-width row in Zilla Slab 600 with a ruled line above. Figures right-aligned.
- Green bars are made with `:nth-child` row backgrounds in blocks of three (rows 1–3 Bandgrün, 4–6 Papier …). **No CSS gradients anywhere** (`design-check` fails on them).
- Below 720 px each item becomes two lines: OZ + Kurztext, then Menge Einheit · EP · GP. The sheet still works at 360 px.
- Sections are separated by rules (1 px Farbband, or a dotted 2 px rule) and space, not by boxes. Asymmetry: the headline and tool sit left, the check panel sits on the right of the sheet on wide screens (sticky), below it on narrow ones.
- Radius is 0 everywhere. The only round things are the sprocket holes and the stamp.

## Signature element: the sprocket strip and the stamp

1. **Sprocket strip:** `.sheet` has `padding-inline: 28px` and a `background-image` on `::before`/`::after` pseudo-elements: an inline SVG data URL of one 12 px circle (stroke Farbband at 35%, fill Papier) on a 28 × 24 px tile, `background-repeat: repeat-y`. It also appears, small, on the drop zone's left edge and in the logo.
2. **The stamp:** an inline SVG component `Stamp.astro` / `Stamp.tsx`: two concentric circles (stroke 3 and 1.5 px, Kuli-Blau), the text "ANGEBOT GEPRÜFT" on a `<textPath>` along the ring, the date in Courier Prime in the middle, rotated −7°, `opacity: .88`, `mix-blend-mode: multiply`. It appears only when the bid check has zero blocking issues. One transition: it presses in (scale 1.15 → 1, 180 ms), skipped under `prefers-reduced-motion`.

## Components

- **Primary button** ("Datei auswählen", "X84 erstellen – 19 €"): square corners, Farbband fill, Papier text, Courier Prime 700 uppercase 17 px, min-height 52 px, 2 px Farbband border. Hover: fill turns Kuli-Blau. Active: shifts 1 px down with a 2 px hard Farbband offset shadow removed. One primary per screen.
- **Secondary button:** Papier fill, 2 px Farbband border, same type. Text links are underlined in Farbband, 1 px offset 3 px.
- **Drop zone:** a full-width Bandgrün field with a dashed 2 px Farbband border (a perforation line, not rounded), the sprocket strip on its left edge, the big primary button in the middle, the line "oder .X83-Datei hierher ziehen", and the example "z. B. Leistungsverzeichnis_Malerarbeiten.X83". Drag-over: border turns solid Kuli-Blau, fill Papier. The privacy sentence sits directly under it in Courier Prime: „Ihre Datei wird nur in diesem Browser verarbeitet und nicht hochgeladen.“
- **EP input:** no box. A dotted 2 px Farbband bottom rule (the fill-in line), Courier Prime 17 px in Kuli-Blau, right-aligned, min-height 48 px. Focus: the dotted rule becomes solid 2 px Kuli-Blau plus the focus ring. Unpriced required item: the row's OZ gets a Rotstift underline stroke and a small "fehlt" in Rotstift; never a red box.
- **Text inputs (bidder data):** same fill-in-line treatment with the label above in `--fs-label`.
- **Results / totals:** section subtotals in the GP column above a single rule; the net total under a double rule (two 1 px lines 3 px apart), set in `--fs-total`, with "netto" as a label. The stamp sits beside it.
- **Notices:** a full-width tinted band (Bandgrün for info; Papier with a Rotstift heading and a Rotstift 1 px top-and-bottom rule for errors), a label in `--fs-label` ("HINWEIS", "NICHT UNTERSTÜTZT"). **Never** a one-sided thick coloured border.
- **Check panel:** a typed checklist: each line starts with a typewriter mark `[x]` or `[ ]`; unpriced items are links in Rotstift to the row.
- **Focus ring:** `outline: 3px solid #1B3E9C; outline-offset: 2px` on everything. `::selection` Bandgrün on Farbband text.

## Brand

- Logo `public/brand/logo.svg`: a small square sheet with three horizontal bars (Bandgrün/Papier alternating, Farbband outline) and a column of three punched holes on its left edge; wordmark "LV-Bepreiser" in Zilla Slab 700 next to it. Flat colours, no gradient.
- Favicon `public/favicon.svg`: the sheet mark only.
- Illustrations (`public/art/`, hand-built SVG, 2 px Farbband strokes, flat fills from the palette): hero = a fan-folded printout with one row priced in blue; steps = (1) the file dropped on the sheet, (2) a ballpoint on a dotted line, (3) the sheet with the stamp. Empty state = a blank fan-fold; error = a sheet with a red pencil cross.

## Voice

Plain German, "Sie", short sentences, the vocabulary of the Bauamt and the trade: Leistungsverzeichnis, OZ, EP, GP, Bedarfsposition, Angebotsschreiben. Say what happens: "Datei auswählen", "Preise prüfen", "X84 erstellen – 19 € netto". States: "Leistungsverzeichnis wird gelesen …", "142 Positionen, 3 ohne Preis", "Diese Datei enthält Preisanteile (Lohn/Stoff). Das kann der LV-Bepreiser noch nicht schreiben – bitte nicht kaufen." No exclamation marks, no promises that the client accepts the bid.

## What we will not do

No gradients (including for the green bars), no rounded cards, no pill buttons, no hover lifts, no soft or glowing shadows, no frosted glass, no one-sided accent borders, no icon packs or emoji, no stock photos of hard hats or blueprints, no Inter/Roboto/system-only type, no three-equal-cards section, no gradient CTA band, no "Unlock"/"Seamless" copy, no fake reviews, user counts or countdowns, no Tailwind default blues or violets (the palette above is the only colour source).
