# CoffeeOS Design System

A reusable, themeable design system for **CoffeeOS** — a suite of coffee-business
operations software (order management, roasting/batch tracking, inventory,
wholesale, and a green-coffee marketplace). One system across every product. The
users are operators doing dense, repetitive work all day: accepting orders,
queueing roasts, tracking lots, fulfilling wholesale.

## The thesis — a working instrument, not a dashboard

Coffee operations are measurement — weights, temperatures, times, moisture,
density, agtron, par levels, lot codes. The interface reads like the **instrument
that job runs on**: precise, dense, legible, alive. Three moves carry the entire
personality; everything else stays quiet and neutral.

1. **Mono-forward type.** One variable monospace (Martian Mono) is the voice, for
   both display and data, traveling along its width axis — wide and heavy for
   headings/hero figures, condensed for dense data. Instrument Sans carries prose
   so mono headings never read as "developer tool."
2. **Color is roast.** The palette is the physical continuum coffee moves through
   as it roasts (green → espresso) and it is used to *encode* data — a row, lot,
   batch, or chart series carries its roast level as color, readable at a glance.
   Red is the **live register**: happening now / needs you.
3. **Worksheet layout.** Content sits directly on white, divided by hairline rules
   and section spacing — not an evenly-weighted grid of rounded boxes on gray. One
   hero figure, a ruled stat strip, edge-to-edge tables.

**Signature:** the **live batch strip** in the app shell — today's roast queue on
a time axis, ramp-colored segments, the roasting batch pulsing in brand red. The
one bespoke element and the only ambient animation.

---

## Sources

- **Brand mark:** heavy, wide, rounded geometric letterforms in vivid red
  (`#FA3B30`) on dark espresso, with a molten drip. **The logo file was not
  delivered.** Nothing is drawn from memory; wherever the mark belongs, the
  wordmark is set in Martian Mono (wide/heavy) with a single red glyph.
  **Action needed:** re-attach the logo (SVG preferred) via Import so the real
  mark can be placed and the exact red re-sampled.
- **Usability bar:** Shopify Admin / Polaris and the Roastify merchant admin. No
  source code was provided; patterns are built from the written brief.

No codebase or Figma was attached — all values come from the brief, which
specifies them exactly.

---

## Index / manifest

Root: `styles.css` (the single entry consumers link — `@import` lines only),
`readme.md`, `thumbnail.html`, `SKILL.md`.

`tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`,
`layout.css`, `base.css`.

`components/`
- `buttons/` — `Button`, `IconButton`, `SegmentedControl`
- `forms/` — `Input`, `Select`, `Textarea`, `Checkbox`, `Radio`/`RadioGroup`, `Switch`, `Field`
- `data-display/` — `RoastMeter`/`RoastDot`, `Badge`, `HeroMetric`, `StatStrip`, `BatchCard`, `DataTable`, `EmptyState`, `Kbd`
- `navigation/` — `AppShell`, `BatchStrip`, `CommandPalette`, `StepStrip`, `Tabs`, `Breadcrumbs`, `Wordmark`
- `feedback/` — `Modal`, `Toast`/`ToastViewport`, `InlineBanner`, `Tooltip`

`ui_kits/`
- `orders/` — Orders resource-list dashboard (worksheet table, hero metric, stat strip, batch strip, ⌘K).
- `roast-batch/` — Roast/batch detail (live timer, roast meter, lot traceability, mono spec table, roast curve).
- `shared/icons.jsx` — Lucide path data (kit-local icon helper).

`guidelines/` — foundation specimen cards (`*.card.html`), grouped Colors / Type / Spacing / Brand.

**Intentional additions** beyond the brief's named list: `RoastDot` (a one-glyph
roast marker for table rows, extracted from the roast-meter concept) and `Kbd`
(the brief calls for mono kbd chips in menus/tooltips, so a primitive was needed).

---

## CONTENT FUNDAMENTALS

Voice is **operator-facing, plain, active, calm** — a competent colleague who
respects your time. Never chatty, never apologetic, never salesy.

- **Person & casing.** Address the operator as **you**; the product is *it*.
  **Sentence case** for prose, headings, and buttons. Uppercase is reserved for
  the condensed-mono overline labels (nav groups, column headers) — a *visual*
  device, not shouting.
- **Vocabulary is real coffee-ops language:** roast, batch, lot, green, drop,
  charge, agtron, par level, DTC, wholesale, fulfillment, SKU, cupping.
- **Buttons say exactly what happens** — "Start batch", "Save changes",
  "Log drop", never "Submit"/"OK". The verb carries into confirmation:
  Publish → Published, Save changes → Saved, Start batch → Batch started.
- **Empty states** give one headline, one line of guidance, one action.
- **Errors** state what went wrong and how to fix it:
  *"Lot code must be unique — LOT-2411 is already in use."* Never vague.
- **Numbers are facts, presented flatly** — mono tabular, signed deltas
  (`+4.2%` / `−0.8%`) colored by meaning (success/danger), never brand red.
- **No emoji, no coffee puns, no exclamation marks** outside a genuine success.

---

## VISUAL FOUNDATIONS

**Mood.** Bright, warm-neutral, instrument-grade. The interface recedes; the data
is the subject. Premium comes from type, color logic, and density — never effects.

**Type — mono-forward, no serifs.** (`tokens/typography.css`)
- *Display* — **Martian Mono, `wdth` 112.5, `wght` 700**, tracking `-0.02em`.
  Wide and heavy: reads as a readout. Page titles, hero figures, empty-state
  headlines (uppercase). Applied via `font-variation-settings: var(--display-settings)`.
- *Data* — **Martian Mono, `wdth` 87.5, `wght` ~450**, tabular-nums. Condensed so
  dense tables stay narrow. **Every** figure, plus SKUs, lot codes, weights,
  temps, batch IDs, timers, prices, dates. `var(--data-settings)`.
- *Overline / label* — **Martian Mono, `wdth` 100, `wght` 600**, 10–11px,
  uppercase, tracking `+0.08em`. Column headers, nav group labels, stat labels.
- *Prose* — **Instrument Sans** 400/500/600. Descriptions, help, banners,
  tooltips, empty-state guidance, button labels — anything that is a sentence.
- **Hierarchy is dramatic:** hero figures 44–76px, labels 10–11px (>5×). No timid
  middle. The width axis is verified to render (`guidelines/type-width-axis`).

**Color — role-named** (`tokens/colors.css`), governed by two rules:
- *Surfaces stay bright:* `--canvas #F8F7F5`, `--surface #FFFFFF`,
  `--surface-sunken #F1EFEC` (filter bars, table headers, wells). **No brown or
  dark surface** — espresso appears only as `--ink #241812` and the ramp's dark end.
- *The **roast ramp** is a data-encoding palette,* not decoration:
  `--roast-0 #8C9A6B` (green) · `-1 #D9A441` · `-2 #C4763C` · `-3 #9A4F26` ·
  `-4 #6B3018` · `-5 #2A1710` (espresso). It appears **only in the data layer** —
  row markers, chips, meters, chart series, small fills. Never a background,
  never chrome, never a button fill.
- *Red is the **live register**:* `--brand #FA3B30` means "happening now / needs
  you" — actively roasting, open orders awaiting action, focus rings, active nav,
  live indicators, count badges. Because it carries meaning it can be loud without
  looking decorative, and it appears at meaningful size on every screen. It is
  **never a primary button fill**. Contrast: `#FA3B30` on white is ~3.4:1 — use it
  for ≥18px/bold text, icons, borders, fills; `--danger` carries body-size red text.
- *Action = ink:* primary buttons fill `--ink` / white text. Secondary =
  `--surface-sunken`. Destructive = `--danger` (darker/desaturated vs brand),
  filled only inside confirmation modals.
- *Semantic:* danger `#B42318`, warning `#B26B00`, success `#1E7A4A`, info `#2F5FA8`.
- *Data-viz:* warm muted `--viz-grid`/`--viz-axis`, series drawn from the roast
  ramp, brand red reserved for the live/highlight series.

**Layout — worksheet, not card grid.**
- **No nested cards as the default.** Content sits directly on `--surface`,
  organized by hairline rules and section spacing. A bordered container is
  reserved for genuinely modular things (filter bar, modal, sidebar panel, batch card).
- **Tables run edge-to-edge**, full content width, sticky sunken header with
  overline column labels, dense 40px rows, ruled row separators, **no zebra**,
  hover revealing row actions on the right, bulk bar sliding up from the bottom.
- **Metrics are never a row of equal cards.** One figure is the **hero** at
  display size on the canvas with a rule under it (`HeroMetric`); the rest collapse
  into a single ruled **stat strip** (`StatStrip`) — label above, mono figure below.
- **Density is a feature:** 12px cell padding, 16px stack gaps, 24px section gaps.
  Whitespace separates *sections*, not every element equally.

**Shape / elevation / motion.**
- Radius `--r-sm 4px`, `--r-md 6px`, `--r-lg 10px` — tight; precision reads as
  expensive. **Badges are pills; buttons never are.**
- Borders-first elevation. `--shadow-sm` is the strongest thing on a normal
  screen; real shadows (`--shadow-pop`, `--shadow-modal`) only for popovers,
  dropdowns, modals, palette, and the sliding bulk bar. No gradients, no glass.
- Motion `140ms cubic-bezier(.2,.6,.2,1)` on state changes. The batch-strip pulse
  is the only ambient animation. `prefers-reduced-motion` collapses durations to
  0 and stops the pulse.

**Interaction states.** Hover: buttons darken to `-hover`; rows shift to
`--surface-hover` and reveal actions; links shift ink→brand. Press: subtle darken.
Selected: `--brand-soft` bg + red left indicator (nav) or red row tint. Focus:
always a visible `--brand` ring. Disabled: `--ink-subtle` on a muted surface.

**Pro-tool affordances.** ⌘K command palette (jump to any order/lot/batch/screen,
run actions), mono kbd chips in menus/tooltips, hover/keyboard row quick actions,
bulk selection with a persistent action bar.

---

## ICONOGRAPHY

Line icons at a consistent **1.5px stroke** — functional, never literal coffee
(no beans, cups, steam, burlap). Set: **[Lucide](https://lucide.dev)** (ISC).
*Substitution flag:* no proprietary CoffeeOS icon set was provided; Lucide is the
closest match to the brief's thin-stroke direction. In the UI kits, icons are
Lucide path data via `ui_kits/shared/icons.jsx` (`<Icon name="package"/>`),
avoiding hand-drawn SVG.

- Default 16–18px inline, 18px in nav; stroke inherits `currentColor` so an active
  nav icon turns `--brand` automatically.
- **No emoji.** Unicode glyphs are used only as functional marks: `·` separator,
  `↑ ↓` sort/delta direction, `− +` steppers, `✓` done state, `▾ ▴` strip toggle.
- The **roast meter / roast dot are not icons** — they are ramp-colored data
  readouts, the only bespoke glyphs in the system.

---

## Namespace

Components are exposed on `window.CoffeeOSDesignSystem_372546`. Cards/kits mount
via `const { Button } = window.CoffeeOSDesignSystem_372546` after loading
`_ds_bundle.js`. Run `check_design_system` to reconfirm the namespace.

## Fonts caveat

No self-hosted binaries were provided — Martian Mono and Instrument Sans load
from Google Fonts (the `wdth` axis is requested explicitly, or width settings
silently fail). Supply `.woff2` files to self-host; replace the `@import` lines in
`tokens/fonts.css` with `@font-face` rules.
