# Asset register

Every asset in this prototype is replaceable. Nothing here is Katwalk inventory or approved brand material.

| Asset | File | Source / licence | Status |
| --- | --- | --- | --- |
| Wordmark "KATWALK" | typeset in Instrument Serif (`Header.tsx`) | Proposed typographic treatment | Pending the real logo; labelled "proposed wordmark" |
| Display headings | `@fontsource-variable/imbue` (Imbue, optical-size axis) | SIL Open Font License 1.1, self-hosted | Proposed; chosen as a free alternative to the commercial "Belange" reference (condensed, high-contrast caps) |
| Secondary serif | `@fontsource/instrument-serif` | SIL Open Font License 1.1, self-hosted | Card and product names, story text |
| UI sans | `@fontsource-variable/manrope` | SIL Open Font License 1.1, self-hosted | Proposed |
| Lookbook prints (3) | `public/media/photos/print-*.webp` | Unsplash License stock photography (see credits below) | Illustrative, not Katwalk models or inventory |
| Featured drop images (4) | `public/media/photos/product-*.webp` | Unsplash License stock photography | Demo pieces; no prices or stock |
| Story images (2) | `public/media/photos/story-*.webp` | Unsplash License stock photography | Illustrative |
| Social gallery tiles | reuse the photos above | Nothing scraped from social media | Illustrative; feed and link inactive until account ownership is confirmed |
| Featured 3D handbag | `makeBagGeometries` in `src/scene/geometry.ts` | Custom procedural model: pebbled leather (runtime grain texture), saddle stitching, painted edge, brass D-rings, turn-lock clasp and feet; unbranded | Replace with a licensed GLB when available |
| Stone floor, leather grain, fabric weave | `stoneTexture()`, `leatherGrain()`, `fabricTexture()` in `src/scene/materials.ts` | Generated at runtime (canvas) | No download |
| Boutique architecture | `src/scene/geometry.ts`, `Environment.tsx` | Procedural: plaster facade with one arched entrance, pilasters, interior room, curved runway | Concept quality |
| Plaster texture | `plasterTexture()` in `src/scene/materials.ts` | Generated at runtime (canvas noise) | No download |
| Boutique life | `Display.tsx` | Procedural: chrome rail with seven draped garments, plaster table with folded stacks, leaning mirror, blush bench | Stylised |
| Reflections | three.js `RoomEnvironment` | Procedural, ships with three.js (MIT) | No HDR file needed |
| Static hero still | `public/media/hero-still.webp` | Rendered from this scene (`/?capture` in dev) | Re-render after any scene change |
| Vector illustrations (unused alternates) | `public/media/edit-*.svg`, `product-*.svg`, `hero-bag.svg` | Original artwork (`scripts/make_*.py`) | Superseded by photography; kept as a no-download fallback set |

## Photography credits (Unsplash License: free to use, attribution appreciated)

Downloaded through the Unsplash CDN at 1000×1250 WebP crops. Licence confirmed on each photo page.

| File | Photographer | Source |
| --- | --- | --- |
| `print-street-chic.webp` | Marcel Strauß | https://unsplash.com/photos/1FnVSX5flT8 |
| `print-statement.webp` | Jahanzeb Ahsan (page also credits @mukhina_mira) | https://unsplash.com/photos/phWzbhrgvH0 |
| `print-after-dark.webp` | FOTOGRAFÍA EDITORIAL | https://unsplash.com/photos/ZKPEw9BWFC8 |
| `product-tote.webp` | Ugluk Potroshitel | https://unsplash.com/photos/XwjrPFW7xw0 |
| `product-coats.webp` | Priscilla Du Preez | https://unsplash.com/photos/my5cwTzhmNI |
| `product-satin.webp` | PRAHANT STUDIO | https://unsplash.com/photos/rDExPGnIuuc |
| `product-denim.webp` | Mehrpouya H | https://unsplash.com/photos/3k5PytIyuBQ |
| `story-pink-coat.webp` | Sasha Matveeva | https://unsplash.com/photos/pyPI14RrbvM |
| `story-boutique-rail.webp` | Clark Street Mercantile | https://unsplash.com/photos/qnKhZJPKFD8 |

These are stand-ins for the pitch. For production, use the boutique's own photography or properly licensed
and released imagery. Stock models do not represent Katwalk.

## Substitutions and decisions

- **Photography.** The vector illustrations were replaced with free Unsplash stock photography (credits
  above), labelled on the page as illustrative stock. Photos showing visible third-party brand names were skipped.
- **3D handbag.** We searched for a free-licence handbag model. Poly Haven has none, and general search found
  only paid or restrictive licences (CGTrader, RenderHub). So the bag is a custom procedural model built in
  code. To swap in a licensed GLB: keep the origin at the base centre, roughly 0.42 m wide, and replace
  `<Handbag />` in `src/scene/Display.tsx`.
- **Instagram.** The boutique's Instagram was suggested as an image source. Nothing was downloaded from it.
  Use boutique-supplied originals with permission instead, dropped into `public/media/source/`.

## Swapping in approved imagery

1. Export at 4:5 (e.g. 1200×1500), WebP or AVIF, sRGB.
2. Update `src` and `alt` in `src/content/lookbook.ts` (prints) or `src/content/site.ts` (products, social).
   The WebGL prints and HTML cards both read from the same source, so the handoff stays pixel-matched.
3. Re-render the static still: open `/?mode=immersive&capture` in dev, wait for the intro, then run
   `await __katwalkCapture()` in the console.

## Claims deliberately omitted

Founding date ("Since 1997"), awards ("Best of Baltimore"), testimonials, ratings, follower counts, prices,
SKUs, stock, address and opening hours.
