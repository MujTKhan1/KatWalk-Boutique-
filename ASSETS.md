# Asset register

Every asset in this prototype is replaceable. Nothing here is Katwalk inventory or approved brand material.

| Asset | File | Source / licence | Status |
| --- | --- | --- | --- |
| Wordmark "KATWALK" | typeset in Instrument Serif (`Header.tsx`) | Proposed typographic treatment | Pending the real logo; labelled "proposed wordmark" |
| Headline serif | `@fontsource/instrument-serif` | SIL Open Font License 1.1, self-hosted | Proposed; brand fonts unconfirmed |
| UI sans | `@fontsource-variable/manrope` | SIL Open Font License 1.1, self-hosted | Proposed |
| Lookbook prints (3) | `public/media/edit-*.svg` | Original vector illustrations made for this demo (`scripts/make_bag_svg.py` generates Statement Pieces) | Illustrative placeholders, 4:5 |
| Featured drop pieces (4) | `public/media/product-*.svg` | Original vector illustrations (`scripts/make_product_svgs.py`) | Demo pieces, not real inventory; no prices or stock |
| Social gallery tiles | reuse the lookbook and product artwork | Local artwork, nothing scraped | Illustrative; feed and link inactive until account ownership is confirmed |
| Featured 3D handbag | `makeBagGeometries` in `src/scene/geometry.ts` | Custom procedural model: structured top-handle bag with leather (clearcoat and sheen) and gold hardware, unbranded | Replace with a licensed GLB when available |
| Boutique architecture | `src/scene/geometry.ts`, `Environment.tsx` | Procedural: plaster facade with one arched entrance, pilasters, interior room, curved runway | Concept quality |
| Plaster texture | `plasterTexture()` in `src/scene/materials.ts` | Generated at runtime (canvas noise) | No download |
| Collection displays | `Display.tsx` | Procedural chrome rail, garment silhouettes, folded stacks | Stylised |
| Reflections | three.js `RoomEnvironment` | Procedural, ships with three.js (MIT) | No HDR file needed |
| Static hero still | `public/media/hero-still.webp` | Rendered from this scene (`/?capture` in dev) | Re-render after any scene change |
| Hero bag illustration (legacy) | `public/media/hero-bag.svg` | Original vector illustration | No longer used in the scene; kept as source art for the product artwork |

## Substitutions and decisions

- **Photography.** The client team decided large editorial photographs of people are not required for this
  round. The prints and products are text-free vector illustrations, labelled on the page as illustrative or demo.
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
