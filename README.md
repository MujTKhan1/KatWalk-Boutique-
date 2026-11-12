# Katwalk Boutique: immersive landing page prototype

Internal concept demo prepared by Finatra.us for prospect review. **Not an approved production website.**
All imagery, products, copy and the wordmark are illustrative, pending the boutique's approval.

Central idea: visitors scroll *into* the boutique. The page opens on a warm plaster facade with one arched
entrance. The camera passes through the arch toward a featured display, the interior reveals framed
editorial prints and collection displays, and the prints lift off the wall to settle into the HTML lookbook.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck (tsc -b) + production build to dist/
npm run preview    # serve the production build on http://localhost:4173
```

| URL | Effect |
| --- | --- |
| `/?mode=static` | Force the composed static hero (same as mobile / reduced motion) |
| `/?mode=immersive` | Force the WebGL sequence even below 900px wide |
| `/?nowebgl` | Simulate WebGL being unavailable |
| `/?capture` (dev only) | Exposes `__katwalkCapture()`, which re-renders `public/media/hero-still.webp` from the live scene |

## Page structure

1. **Immersive sequence**: four viewport-length chapters on one pinned stage (400vh section):
   *The boutique*, then *The entrance* (through the arch, then a sideways arc round the featured bag), then
   *The collection*, then *The lookbook*. The ivory veil fully covers the room before the lookbook heading
   arrives, and the heading clears the fixed header.
2. **Featured drop**: four clearly labelled demo pieces, no prices or stock.
3. **Boutique story**: proposed copy with a word-by-word reading reveal.
4. **Social feed orbit**: a pinned scene (340vh). The giant words "BOUTIQUE" and "FEED." frame six photos
   riding a tilted CSS 3D ring with a glowing lime orbit line. Scroll turns the ring, and an info card tracks
   the front photo (01 / 06, code, title, caption). Mobile and reduced motion get a simple grid. The handle is
   shown but not linked until ownership is confirmed.
5. **Find Your Next Look**: closing section; the inquiry route awaits approval, so no form is shown.

## Art direction

- **Surfaces:** warm ivory plaster (procedural, tileable texture used as colour and bump). Blush appears only
  on the display platforms and the runway. Chrome is limited to the entrance trim and the rail.
- **Light:** one directional "late-morning sun" with soft real-time shadows (2048 map, PCF soft), a warm
  hemisphere fill, a shadowless interior bounce, and layered contact-shadow decals.
- **Architecture:** one strong entrance arch with shallow pilasters and a lintel, and the curved runway as the
  path through the boutique. The floating spheres, coral disc, ticker, badge and decorative arcades are removed.
- **Featured accessory:** a custom 3D structured top-handle bag. Muted rose pebbled leather, saddle stitching,
  a painted edge, brass D-rings, a turn-lock clasp and feet. It turns to keep facing the visitor as the camera
  arcs round it.
- **Photography:** illustrative Unsplash stock photography in the three framed prints (inside darker arched
  niches with picture lamps), the featured drop, story and social tiles. Credits are in ASSETS.md.
- **Boutique life:** a chrome rail of seven draped garments, a plaster table of folded stacks, a leaning mirror
  and a blush bench, all composed into the camera's path.
- **Tonal depth:** a cooler honed-stone floor with joints, deeper plaster on the arch reveal and the niches,
  lower ambient fill and stronger contact shadows.

## Typography

- **Display (main headings, wordmark, curtain):** Imbue. A condensed, high-contrast serif set in capitals at
  optical size 100, following the Belange reference (which is commercial). Accent words switch to deep rose
  rather than italics.
- **Secondary serif:** Instrument Serif, for card and product names and the story statement.
- **UI and body:** Manrope.

All fonts are OFL and self-hosted, with the `--display`, `--serif` and `--sans` tokens in `src/styles.css`.

## Motion (Lusion-inspired, all reversible)

- **One progress value drives everything.** Native scroll goes through ScrollTrigger into a single damped
  progress value. The camera spline, bag rotation, gallery light, print flight, veil and HTML timeline are
  all pure functions of it, so scrolling up reconstructs every frame exactly.
- **WebGL to HTML handoff.** Each print unprojects its HTML card's live rect and flies onto it. It uses an
  unlit, non-tone-mapped material with the same file as the `<img>`, so the swap is invisible.
- **Section reveals** (`useReveals`): masked line rises, clip-path image unveils with a counter-zoom,
  staggered card rises, and word-fill reading. All are scrubbed to scroll, so they reverse too.
- **Page transitions** (`usePageTransitions`): in-page links trigger a plaster curtain wipe. The page jumps
  and the 3D sequence snaps exactly, focus moves to the destination, and the curtain lifts. Links stay
  ordinary hrefs.
- **Hover:** a magnetic primary CTA with a sheen sweep, and slow image zooms on product and social tiles.
- **Reduced motion:** static hero, no reveals or curtain, native jumps.

## Accessibility and performance

- **Accessibility:**
  - All copy and controls are HTML above an `aria-hidden` canvas.
  - There's a skip link and visible focus styles.
  - If a CTA is focused after the hero has exited, the page scrolls back to it.
  - The primary CTA is charcoal on coral (about 6.2:1).
  - Static fallback for mobile, reduced motion, WebGL failure and context loss.
- **Performance:**
  - `frameloop="demand"`: the scene renders only on change, and pauses offscreen.
  - DPR capped at 1.75.
  - One shadow-casting light, no post-processing.
  - Procedural geometry and textures: no model or HDR downloads.
  - The 3D bundle is lazy-loaded only in immersive mode.

Last measured build (gzip): see `npm run build`. Photography is about 1.4 MB in total (nine WebP files, 90–300 KB each);
only the three lookbook photos load with the 3D scene, and the rest are lazy-loaded.

Not measured: frame rate, GPU timing and real-device performance. The review browser throttled
`requestAnimationFrame` because its pane was hidden. Mobile was checked only in a 375×812 emulated viewport.

See [ASSETS.md](ASSETS.md) for sources, substitutions and what still needs approval.
