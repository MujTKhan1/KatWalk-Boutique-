/**
 * Single source of truth for the hero sequence.
 *
 * `target`  raw ScrollTrigger progress (0..1), written on scroll.
 * `p`       damped progress, advanced by one GSAP ticker. EVERYTHING visual
 *           (camera, objects, panels, HTML timeline) is a pure function of `p`,
 *           so scrubbing backwards reconstructs every prior state exactly.
 * pointer   normalised pointer (-1..1) and its damped value, used only for
 *           restrained parallax that is faded out before the DOM handoff.
 */
export type SequenceStore = {
  target: number;
  p: number;
  initialised: boolean;
  pointer: { x: number; y: number };
  pointerSmooth: { x: number; y: number };
  parallaxEnabled: boolean;
  /** 0..1 one-shot entrance (time-based, never tied to scroll) */
  intro: number;
  visible: boolean;
  /** HTML card media elements the WebGL panels align with at the handoff */
  cardEls: (HTMLElement | null)[];
  invalidate: () => void;
};

export const store: SequenceStore = {
  target: 0,
  p: 0,
  initialised: false,
  pointer: { x: 0, y: 0 },
  pointerSmooth: { x: 0, y: 0 },
  parallaxEnabled: false,
  intro: 0,
  visible: true,
  cardEls: [],
  invalidate: () => {},
};

export function resetStore() {
  store.target = 0;
  store.p = 0;
  store.initialised = false;
  store.pointer.x = store.pointer.y = 0;
  store.pointerSmooth.x = store.pointerSmooth.y = 0;
  store.intro = 0;
  store.invalidate = () => {};
}
