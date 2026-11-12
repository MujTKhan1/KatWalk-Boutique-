/**
 * Pure timing for the hero sequence. Intentionally has NO three.js import so the
 * HTML timeline (and static/mobile mode) never pulls the 3D bundle into the critical path.
 */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** normalised position of p inside [a, b] */
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* Four viewport-length chapters over one progress value (0..1):
 *  1. Boutique     opening view of the facade, headline + CTAs           [0, 0.08] hold
 *  2. Entrance     camera moves through the arch toward the featured display
 *  3. Collection   interior reveals the editorial prints and collection displays
 *  4. Lookbook     the prints lift off the wall and settle into the HTML lookbook
 */
export const PHASE = {
  establish: [0, 0.08],
  approach: [0.08, 0.3],
  frame: [0.22, 0.45],
  reveal: [0.45, 0.72],
  camera: [0.08, 0.76],
  resolve: [0.78, 0.95],
  handoff: [0.95, 0.985],
} as const;

export const CHAPTERS = [
  { at: 0, label: 'The boutique' },
  { at: 0.12, label: 'The entrance' },
  { at: 0.47, label: 'The collection' },
  { at: 0.78, label: 'The lookbook' },
];
