# Katwalk Boutique: immersive hero prototype

Internal concept demo prepared by Finatra.us for prospect review. **Not an approved production website.**
All imagery, copy, categories and the wordmark are illustrative, pending the boutique's approval.

Central idea: *the runway becomes the collection.* One continuous boutique scene. As you scroll, the camera
dollies toward the vitrine, passes through the chrome arch, and editorial panels rise along the blush runway.
The panels then fly into the exact positions of the HTML lookbook cards, which take over seamlessly.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck (tsc -b) + production build to dist/
npm run preview    # serve the production build on http://localhost:4173
```

### Testing switches (query string)

| URL | Effect |
| --- | --- |
| `/?mode=static` | Force the composed static hero (same as mobile / reduced motion) |
| `/?mode=immersive` | Force the WebGL sequence even below 900px wide |
| `/?nowebgl` | Simulate WebGL being unavailable |
| `/?capture` (dev only) | Exposes `__katwalkCapture()`, which re-renders `public/media/hero-still.webp` from the live scene |

## How it is built

React 19 + TypeScript, Vite, Three.js via React Three Fiber, GSAP + ScrollTrigger.

```
src/
  motion/
    phases.ts            phase timings + easing (no three.js, so static mode never loads the 3D bundle)
    choreography.ts      camera rail, object/panel transforms: pure functions of progress
    store.ts             shared progress store (target, damped p, pointer, card elements)
    useSequenceDriver.ts ScrollTrigger -> damped progress -> HTML timeline + WebGL invalidate
    domTimeline.ts       paused GSAP timeline (duration 1) for the HTML layers
  scene/                 one <Canvas>: CameraRig, Gallery, Display (pedestal, arch, bag), Panels (+ veil)
  components/            Header, HeroCopy, Lookbook, Sequence (immersive), StaticExperience, PlannedSections
  hooks/useExperienceMode.ts   immersive vs static decision (live on resize / reduced-motion change)
  content/lookbook.ts    lookbook data + image paths (swap for approved photography)
```

**Palette.** Ivory ground with layered pinks: petal, blush, rose, raspberry (text-safe `#C2416C` for the
italic accent) and peach. Coral is the warm accent (CTA, sun disc) and lime appears only in tiny details.
Tokens live in `src/styles.css` (`:root`) and `src/scene/materials.ts` (`PALETTE`).

**Hero accessory.** A detailed static illustration (`public/media/hero-bag.svg`) on a camera-facing plane
atop a raspberry plinth and blush pedestal. It stays crisp from every point on the camera rail and lifts
gently as the camera approaches.

**Depth and focus.** The dark After-Dark panel stands inside the chrome arch as the hero's focal point.
Eight glossy pearls (pearl, chrome, raspberry, one lime) float through the gallery for parallax depth. Each
drifts by a fixed amount as a pure function of progress. The primary CTA has a subtle magnetic pull and a
sheen on hover (mouse only, off for reduced motion).

**Reversibility.** Native scroll, with no hijacking. The stage is pinned with CSS `position: sticky`, and
ScrollTrigger only reports progress. One ticker damps that value into `p`. Every visual is a pure function
of `p`: the camera spline, bag rotation, panel rise and flight, the veil, and the HTML timeline via
`tl.progress(p)`. There are no independent tweens and no accumulated state, so scrubbing upward
reconstructs each prior frame exactly.

**WebGL to HTML handoff.** During *Resolve*, each panel unprojects its HTML card's live
`getBoundingClientRect()` onto a plane 2.4 units in front of the camera. It then interpolates position,
rotation and scale onto that exact rect. The panel uses an unlit, non-tone-mapped material with the same
SVG file as the `<img>`, so the pixels match. The HTML cards fade in on top, then the GL panels hide.
Pointer parallax is faded to zero before this phase, so the alignment is exact.

**Resize / refresh.** Resizing inside the sequence keeps the same *progress*, not the same pixel offset.
A refresh mid-sequence restores straight to the current state with no fly-through, and the entrance
animation is skipped.

**Performance measures.**
- `frameloop="demand"`: the scene renders only while progress, pointer or intro values change.
- Rendering pauses when the stage is offscreen (IntersectionObserver).
- DPR is capped at 1.75.
- No real-time shadow maps (baked radial contact shadows instead) and no post-processing.
- Reflections come from a procedural `RoomEnvironment`, with no HDR download.
- The 3D bundle is lazy-loaded only in immersive mode, and lookbook images below the fold are lazy-loaded.

**Accessibility.**
- The headline and CTAs are real HTML above the canvas, and the canvas is `aria-hidden`.
- There's a skip link ("Skip the intro animation") and visible focus styles throughout.
- Focusing a hero CTA after the copy has exited scrolls back so focus is never invisible.
- Primary CTA uses charcoal text on coral (about 6.2:1); white on coral would fail AA.
- Reduced motion, viewports under 900px, missing WebGL, scene errors and a lost WebGL context all fall
  back to the static hero, a pre-rendered still of the same scene.

## Budgets (proposed vs measured)

Measured from `npm run build` output, gzip sizes:

| Item | Budget | Measured |
| --- | --- | --- |
| Critical JS (React, GSAP, app) | ≤ 130 KB | **119 KB** |
| Lazy 3D chunk (three, R3F, scene), immersive only | ≤ 260 KB | **248 KB** |
| CSS | ≤ 10 KB | **7 KB** |
| Hero still (fallback) | ≤ 60 KB | **50 KB** WebP |
| Hero handbag illustration | ≤ 15 KB | **5.8 KB** SVG |
| Lookbook placeholders | ≤ 10 KB each | **2.4–2.7 KB** SVG |
| Fonts, latin subsets actually used | ≤ 80 KB | ~68 KB woff2 (3 files) |

Not measured: frame rate, GPU timing, draw calls, and real-device performance. The review browser throttled
`requestAnimationFrame` because its pane was hidden, so no FPS numbers are claimed. No mobile or touch hardware
was tested; mobile was checked only in a 375×812 emulated viewport.

## Still to do / open items

- Remaining sections: featured drop, full style edits, social gallery, final conversion route. These are
  planned only; the current CTAs land on minimal, honest placeholders.
- Real photography, logo, fonts, categories, contact route and social ownership all await approval.
  See [ASSETS.md](ASSETS.md).
- KTX2/GLB compression isn't needed yet, since all geometry is procedural and textures are tiny SVGs.
  It becomes worthwhile once licensed photography or a scanned bag model arrives.
