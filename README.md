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
   *The boutique*, then *The entrance*, then *The collection*, then *The lookbook*.
2. **Featured drop**: four clearly labelled demo pieces, no prices or stock.
3. **Boutique story**: proposed copy with a word-by-word reading reveal.
4. **Social gallery**: illustrative tiles; handle shown but not linked until ownership is confirmed.
5. **Find Your Next Look**: closing section; the inquiry route awaits approval, so no form is shown.

## Art direction

- **Surfaces:** warm ivory plaster (procedural, tileable texture used as colour and bump). Blush appears only
  on the display platforms and the runway. Chrome is limited to the entrance trim and the rail.
- **Light:** one directional "late-morning sun" with soft real-time shadows (2048 map, PCF soft), a warm
  hemisphere fill, a shadowless interior bounce, and layered contact-shadow decals.
- **Architecture:** one strong entrance arch with shallow pilasters and a lintel, and the curved runway as the
  path through the boutique. The floating spheres, coral disc, ticker, badge and decorative arcades are removed.
- **Featured accessory:** a custom 3D structured top-handle bag. Deep rose leather with clearcoat and sheen,
  gold rings, clasp and feet. It turns about 30° toward the visitor on approach.
- **Collection:** three framed prints with picture lamps on the back wall, a chrome rail with garments, and
  folded knit stacks on a blush platform.

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

Last measured build (gzip): critical JS 121 KB, lazy 3D chunk 250 KB, CSS 8 KB, hero still 38 KB WebP,
artwork 2–7 KB per SVG.

Not measured: frame rate, GPU timing and real-device performance. The review browser throttled
`requestAnimationFrame` because its pane was hidden. Mobile was checked only in a 375×812 emulated viewport.

See [ASSETS.md](ASSETS.md) for sources, substitutions and what still needs approval.
