# Nexus — design report

Rebuild of the Nexus marketing site under the **colour-chapters** direction (dealt by
`draw.mjs`, seed `472101938`, sector `finance`). Nexus is a **design concept**, and the
site now says so plainly wherever it matters.

## The idea, in one sentence
> On this page, the live currency board — 150 rates meeting at one hub, with the fee
> shown before you'd ever confirm it — becomes the page's structural device: each
> full-bleed chapter is a line on the board, and the visitor can make any line move by
> typing an amount.

## The one live thing
The existing GBP→USD transfer calculator was promoted into the hero chapter's mosaic:
type an amount and the fee (0.41 %, min £0.31), the mid-market rate, the recipient
figure and the remaining balance all recompute live. It is the proof of the hero claim
("Send money like a message").

## Art direction
- **Type:** Jost only (400/500/700). Display 700, tracking −0.03 em, leading 0.85.
  Five size steps, tabular figures everywhere numbers move. No monospace anywhere.
- **Colour:** five flat fields — red-orange `#ff3b1f` (bookends), electric blue
  `#2436ff`, black `#0a0a0a`, deep blue `#050a5c`, white/`#f3f3f3`. Chapters butt
  edge-to-edge; the hard edge is the look. No gradients, no shadows, no hairlines,
  square corners everywhere.
- **Ink rules per field:** on red, black ink for text (5.4:1) and white for display
  only; on blue, white only (6.9:1); on black/deep, white; on white, black.
- **Chapters (index):** red hero with two-ink stacked claim → black marquee band of
  corridor cities → white board (8-tile mosaic of live/interface close-ups) →
  red/paper split driven by one slider (how it works) → surface gallery of 7 photo
  tiles with label strips → white pricing with three stepping colour tiles → FAQ as a
  blue head band + one band per question → blue CTA sentence with a blank → footer as
  the last two rows of the board.

## Redraws (recorded)
- `--redraw section:pricing=pricing-stepped-colour-tiles` — the dealt "one plan as a
  sentence" cannot hold three tiers; three plans are flat colour tiles stepping up in
  height (380/500/620 px) like a bar chart, bottoms aligned, 8 px gaps.
- Hero redraw (approved): the two-ink two-line geometry is applied to the **claim**
  ("SEND MONEY / LIKE A MESSAGE.") rather than the 5-letter wordmark, which cannot
  carry a value proposition; the wordmark lives in the top bar.

## Honesty (invented-proof policy)
- The sign-up, login, newsletter and store flows are labelled demo-only on the page
  ("nothing you type is stored or sent", "the store links are placeholders").
- The FAQ answers "Is Nexus a real bank?" and "Can I open an account today?" with the
  concept disclosure. Footer statement tile repeats it.
- Stats on the About page are product facts of the concept (150+ countries, $0/mo,
  0.41 %, 1 tap), with the note "Product facts for the concept, not company metrics."
  The old invented traction figures (2M+ users, $12B, 4.8★, 99.9 % uptime) are gone.

## Gate results
- `lint.mjs`: **0 FAIL** (1 WARN: 13 em-dashes — the "Page — Site" title convention,
  one per `<title>`).
- `inspect.mjs` on all six pages: **0 FAIL each**. Remaining WARNs, defended:
  - `size-count` (10–15 sizes): the five steps are fluid clamps; the meter pools
    intermediate viewport sizes across 1440/768/390.
  - `grey-body` (5.6:1 / 6.9:1): the sample is ink-on-red (the darkest ink that field
    allows, 5.4:1 ≥ 4.5) or 13 px secondary notes in `--muted`.
  - `no-footage`: no honest clip exists for "currency board / corridors" — searched
    Wikimedia Commons, Internet Archive and NASA; only 45–95 MB Prelinger films of
    unrelated subjects came back. The continuous marquee band and the live calculator
    carry the motion job instead.
  - `card-rows` @390: the phone mosaic is the dealt composition (alternating
    full/half tiles, five field colours, different contents), not a grid of identical
    feature cards.
  - `still-page` (9–13 moving elements on secondary pages): above the FAIL floor,
    below the comfort threshold; utility pages stay quiet on purpose.
- Screenshot critique loop: 3 rounds. Round 1 fixed eyebrow/covered-text/overflow/
  headline length; round 2 fixed field-child centring, switch markup, CTA input
  ground, strip wrapping; round 3 verified.

## Real bugs fixed along the way
- White-on-white ledger headings in the navy CTA (the whole card system is gone).
- Headline wrapping to 3 lines at 1440/390; 390 px horizontal overflow.
- Closed mobile-nav overlay was a full-screen `opacity: 0` layer: it covered the page
  for hit-testing and screen readers (now `visibility: hidden` + `aria-hidden` swap).
- `img` height attribute defeated `aspect-ratio` (missing `height: auto` reset) —
  gallery images rendered at natural height on phones.
- Duplicate footer "Company" columns; all `#` legal links removed (plain text, honest).
- `git` junk dependency removed from `package.json`; no favicon/OG/canonical → added.
- Mojibake (Â£, â€¢) from a bulk edit was caught by screenshot critique and repaired.

## Imagery — all public-domain / CC0 / CC BY-SA, credited on-page
Every photo tile carries a label strip naming maker + year; full credits also live in
`assets/credits.json`. All via Wikimedia Commons:

| File (assets/) | Credit (from `assets/credits.json`) | Used on |
|---|---|---|
| `aerial-view-of-shipping-containers-and-big.jpg` | "Aerial view of shipping containers, and big container cranes at Tacoma's container port" by Brian Harris, **public domain**, via Wikimedia Commons | index, about, pricing, signup |
| `container-cranes-at-antwerp-harbor-close-up.jpg` | "Container cranes at Antwerp harbor Close-up" by Alf van Beem, **CC0**, via Wikimedia Commons | index, pricing, download, login |
| `world-map-1689.jpg` | "World Map 1689" by Gerard van Schagen, **public domain**, via Wikimedia Commons | index, about, pricing |
| `a-general-map-of-the-world-or.jpg` | "A General Map of the World, or Terraqueous Globe…" (Dunn wall map) by Thomas Kitchin, 1794, **public domain**, via Wikimedia Commons | index |
| `piri-reis-world-map-01.jpg` | "Piri reis world map 01" by Piri Reis, 1513, **public domain**, via Wikimedia Commons | index, about |
| `colorful-sky-with-orange-clouds-reflecting-in.jpg` | Sky over a paddy field at sunset, Vang Vieng, Laos, by Basile Morin, **CC BY-SA 4.0**, via Wikimedia Commons | index, about, pricing, signup |
| `pirogue-running-on-the-mekong-at-sunset.jpg` | "Pirogue running on the Mekong at sunset with pink clouds, Don Det, Laos" by Basile Morin, **CC BY-SA 4.0**, via Wikimedia Commons | index, download, login |
| `water-reflection-of-stringy-gray-and-white.jpg` | Clouds reflected in a pond, Don Khon, Laos, by Basile Morin, **CC BY-SA 4.0**, via Wikimedia Commons | download, login |
| `colorful-clouds-and-blue-sky-with-water.jpg` | Clouds and sky reflected in water, Si Phan Don, Laos, by Basile Morin, **CC BY-SA 4.0**, via Wikimedia Commons | download, signup |

The CC BY-SA 4.0 photos (the four Laos pictures by Basile Morin) require attribution:
each photo tile's label strip names the maker and year on the page, and the full legal
line above lives in `assets/credits.json`. Pictures are used unaltered, so share-alike
does not force anything beyond that attribution.

## Code-drawn product UI (stand-ins for screenshots)
All marked `data-ui`, drawn in HTML/CSS, no images: the live transfer calculator, the
available-balance readout, the 0.79 rate figure, the freeze-card switch, split-bill
initial discs, spending-category rows, the tilted Nexus virtual card, the four
how-it-works stage fragments, the auth aside transfer-proof panel.

## Sample content to swap before real use
Fictional entity: "Nexus Financial Technologies Inc.", contact mail `agaboodevelop@gmail.com`, the
$0/$9.99/$29.99 plans, the 0.41 % fee and 0.7885 rate (hard-coded in `js/script.js`
as `RATE`, `PCT`, `MIN_FEE`, `BASE`), corridor labels and local times in the gallery
strips, and the deploy placeholder domain in `sitemap.xml`.
