/**
 * Pure timing for the hero sequence. Intentionally has NO three.js import so the
 * HTML timeline (and static/mobile mode) never pulls the 3D bundle into the critical path.
 */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** normalised position of p inside [a, b] */
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* One scroll-progress timeline (0..1) for the whole pinned sequence.
 *  1. Establish   hold the full hero composition
 *  2. Approach    camera dollies toward the display, headline exits, bag turns
 *  3. Frame       camera passes through the chrome arch
 *  4. Reveal      editorial panels rise along the curved runway
 *  5. Resolve     panels fly into the exact rects of the HTML lookbook cards
 *  6. Handoff     HTML cards take over; normal page scroll continues
 */
export const PHASE = {
  establish: [0, 0.06],
  approach: [0.06, 0.4],
  frame: [0.4, 0.62],
  reveal: [0.5, 0.76],
  camera: [0.06, 0.8],
  resolve: [0.8, 0.95],
  handoff: [0.95, 0.985],
} as const;

export const CHAPTERS = [
  { at: 0, label: 'Establish' },
  { at: 0.08, label: 'Approach' },
  { at: PHASE.frame[0], label: 'Frame' },
  { at: 0.58, label: 'Reveal' },
  { at: PHASE.resolve[0], label: 'Resolve' },
];
