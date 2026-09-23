# Private Label Coffee Section

_Started 2026-07-31 20:55 UTC_

---

## User

Continuing from "Coffee tech design reskin".

## Assistant

We've been reskinning **CoRoasted** across three design systems now — the Universal Design System (complete), Coffee Tech (complete), and CoffeeOS (the main focus). Most recently we finished the **Roaster Portal** (customer-facing booking app) onto CoffeeOS.

**What was done:**
- Rebuilt CoRoasted dashboard under CoffeeOS with worksheet layout: live batch strip (7a–7p roast queue with red "now" marker), grouped sidebar (facility switcher, workspace groups with red active state), hero metric + full-width stat strip, and edge-to-edge table with roast-encoded dots and mono data.
- Fixed drawer z-index (401 over header's 200) so modals sit above chrome.
- Fixed white-text legibility on integration chips (QuickBooks/Stripe) by setting text to ink.
- Reskinned entire Roaster Portal onto CoffeeOS: slim utility bar (wordmark + red drip, notification badge), ruled tabs with red active underline, worksheet-styled Book time (service/roaster pickers as hairline selectable cards, mono schedule grid with roast encoding, sticky confirm bar with ink action button), and Job request/My bookings/My shelf/Invoices all converted to worksheet vocabulary (hairline containers, roast dots, tabular mono, tonal pills).
- Updated Co-Roast minimum from time-based to weight-based: "$3.5/lb · min 10 lb".

**Key decisions:**
- Built all CoffeeOS components as new files (`coffeeos/` folder), leaving UDS and Coffee Tech versions untouched for comparison.
- Honored the two CoffeeOS governing rules: **action = ink** (primary buttons, never red) and **red = live register** (active nav, alert badges, live roasting).
- Stacked hero above full-width stat strip instead of side-by-side to avoid clipping at any viewport width.

**Current state:**
Both CoRoasted dashboard and Roaster Portal render cleanly on CoffeeOS with no console errors. All worksheet patterns, type rules (wide display, condensed tabular), and token conventions in place.

**Files:**
- `coffeeos/Dashboard.jsx`, `Chrome.jsx`, `parts.jsx` (dashboard chrome/layout)
- `coffeeos/PortalChrome.jsx`, `BookView.jsx`, `JobRequestFlow.jsx`, `PortalOther.jsx`, `PortalPrimitives.jsx` (portal reskin)
- `theme/coroasted-coffeeos.css` (token bridge)
- `uds/BookingDrawer.jsx`, `uds/OtherViews.jsx` (shared fixes)
- Original files (UDS, Coffee Tech, neobrutalist `src/`) all untouched

## User

on the roaster portal, we need to add a new "Private Label" section where roasters instead of booking a time or service, can purchase private label coffee.
in this section they can either buy pre-roasted coffees provided by the admin, or they can "Build their own blend. we made a blend builder in this claude design

https://claude.ai/design/p/4445286a-31fd-4f07-a672-05896c86eafd?file=Blend+Builder.dc.html

take a look at the current roaster portal here to determine where this should live and what should change on the current roaster portal.

include the purchasing of whatever they're choosing as well as the ability for a roaster to either provide their own bags, take the default bags the facility supplies, or add their own design labels for the facility's stock bags

## Assistant

I'll look at the blend builder design and the current portal.

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

Now building the Private Label section.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: ready_for_verification]_

Added **Private label** as a second top-level tab (right after Book time — it's a purchase, not a facility booking, so it doesn't belong under either).

The section is one worksheet flow:

1. **What are you selling** — Ready to ship (8 stocked SKUs the facility roasts) vs. Build your own blend.
2. **Product** — either a ruled SKU list with roast dots, lead time and stock, or the blend builder ported from your Claude design (up to 4 green lots, drag ratios, roast-level override). Both drive the same live tasting wheel on the right.
3. **Packaging** — bag size (12 oz / 2 lb / 5 lb, which derives bag count from run size), then the three options you asked for: our stock bags (default), your label on our bags (artwork upload + label size + $85 plate setup + proof language), or you supply the bags (bag count + arrival date, with a red warning if they're short for the run).
4. **Run size and need-by**, then a full ruled cost worksheet — coffee, material, label/handling, setup, fill labor — with $/lb and $/bag, plus a sticky bar that blocks on real problems (under 25 lb minimum, empty blend, missing artwork, not enough bags).

Placed orders land in a new **Private label orders** panel at the top of My bookings.

## User

Found issues — fixing…

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

Fixed: bean icon swapped to `pkg` (all three spots), run-size chips and the bag-count label no longer wrap mid-token, and a blend now requires a name before Review order enables.

## User

this is cutting off tje weight tabs to the left

## Assistant

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

Widened the run-size column to 320px and let the quick chips wrap — they're no longer clipped.

(The two overlap findings are on the Book time schedule grid, not this section — pre-existing tooltip/label layering in the booking blocks.)

## User

we should show the price per pound on the builder

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

## User

okay we need to now add the admin side of this

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: run_script]_

Now the order drawer and wiring.

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: ready_for_verification]_

Added **Private label** to the facility app, under Facility in the sidebar with a live count badge.

**The view** — hero (orders in flight) + stat strip (committed value, open proofs, roasting now, avg run), then six tabs:

- **Queue / Needs us / All orders** — edge-to-edge table: order, roaster, product (roast dot, blend vs stocked), lbs, bags × size, packaging method, a *Needs* column flagging proof due / green short / bags short, stage chip, need-by, total.
- **Proofs** — artwork desk. Each card shows the file, revision, color spec, state (needs review / awaiting roaster / changes requested) and the action: send proof, request changes, or nudge.
- **Catalog** — the two things admin sells: stocked coffees (price, on hand vs par, weekly out, live toggle to list/unlist) and green lots feeding the roasters' blend builder (price, on hand, listed/limited/hidden).
- **Packaging** — bag stock with free-vs-committed counts against par, roaster-supplied inbound bags to receive, and the rate card the portal quotes from.

**Order drawer** (click any row) — six-stage pipeline bar (submitted → proof → green → roasting → packing → shipped), a flag banner when something's blocking, the blend sheet with per-lot poundage drawn against on-hand green, packaging detail, and the invoice lines with the same math the roaster saw. Footer action advances to the next stage.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Folded the *Needs* flag under the stage chip (11 → 10 columns), set the table to 1180px so horizontal scroll handles narrow viewports, added `nowrap` to the order ID, placed date, tier, bags and roast overline, and capped the proof placeholder at 260px tall.

