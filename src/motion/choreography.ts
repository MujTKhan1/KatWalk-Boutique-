import * as THREE from 'three';

import { PHASE, range, easeInOut, easeOut } from './phases';

export * from './phases';
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------------------------------------------------------- layout (world units, roughly metres) */
export const LAYOUT = {
  arch: new THREE.Vector3(1.45, 0, -1.2),
  archInnerWidth: 2.1,
  archLegHeight: 2.15,
  pedestal: new THREE.Vector3(2.85, 0, 0.55),
  pedestalHeight: 0.8,
  pedestalRadius: 0.56,
  plinthHeight: 0.16,
};

/* ---------------------------------------------------------------- camera rail
 * Positions and look targets are Catmull-Rom splines sampled by arc length.
 * The rail passes through the chrome arch (z = -1.2) on its centre line.
 */
const camRail = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-0.1, 1.85, 9.6),
    new THREE.Vector3(0.85, 1.6, 4.6),
    new THREE.Vector3(1.45, 1.55, 1.2),
    new THREE.Vector3(1.45, 1.57, -0.6),
    new THREE.Vector3(1.4, 1.58, -1.9),
  ],
  false,
  'centripetal',
);
const lookRail = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0.05, 1.2, -1.2),
    new THREE.Vector3(1.5, 1.35, -2.2),
    new THREE.Vector3(1.45, 1.45, -5.5),
    new THREE.Vector3(1.4, 1.45, -8.5),
    new THREE.Vector3(1.4, 1.42, -9.5),
  ],
  false,
  'centripetal',
);

export function cameraU(p: number) {
  return easeInOut(range(p, PHASE.camera[0], PHASE.camera[1]));
}

export function cameraPose(p: number, pos: THREE.Vector3, look: THREE.Vector3) {
  const u = cameraU(p);
  camRail.getPointAt(u, pos);
  lookRail.getPointAt(u, look);
}

/** slight roll for a cinematic feel as we bank through the arch (radians) */
export function cameraRoll(p: number) {
  const t = range(p, PHASE.approach[0], PHASE.frame[1]);
  return Math.sin(t * Math.PI) * -0.018;
}

/** restrained pointer parallax, faded out before the DOM handoff */
export function parallaxWeight(p: number) {
  return 1 - range(p, 0.7, PHASE.resolve[0]);
}

/* ---------------------------------------------------------------- objects */
/** the illustrated bag lifts gently off the pedestal as the camera approaches (metres) */
export function handbagLift(p: number) {
  return Math.sin(easeInOut(range(p, PHASE.approach[0], PHASE.frame[1])) * Math.PI) * 0.07;
}

/** coral sun disc: rises and swells slightly as we travel into the gallery */
export function sunState(p: number) {
  const t = easeInOut(range(p, 0, PHASE.camera[1]));
  return { y: 3.4 + t * 0.8, scale: 1 + t * 0.25 };
}

/** runway placements for the editorial panels (index 0 is visible in the hero, framed by the arch) */
/**
 * Indexed like LOOKBOOK. The dark After-Dark panel (index 2) stands framed inside the chrome
 * arch in the hero: it is the strongest value contrast in the composition.
 */
export const PANEL_RUNWAY = [
  { pos: new THREE.Vector3(3.7, 0, -9.9), rotY: -0.35, height: 1.85, rise: [0.48, 0.64] as const },
  { pos: new THREE.Vector3(-0.3, 0, -9.4), rotY: 0.3, height: 1.85, rise: [0.54, 0.7] as const },
  { pos: new THREE.Vector3(2.2, 0, -7.0), rotY: -0.1, height: 2.0, rise: [0, 0] as const },
];

/**
 * Floating pearls that give the gallery depth and parallax. Each drifts upward by a fixed
 * amount over the sequence (pure function of progress, so fully reversible).
 */
export const PEARLS = [
  { pos: new THREE.Vector3(3.75, 1.95, 1.3), r: 0.075, mat: 'pearl', drift: 0.35 },
  { pos: new THREE.Vector3(2.75, 2.75, 0.4), r: 0.05, mat: 'raspberry', drift: 0.5 },
  { pos: new THREE.Vector3(1.15, 3.35, -4.6), r: 0.09, mat: 'chrome', drift: 0.3 },
  { pos: new THREE.Vector3(3.3, 2.85, -3.4), r: 0.13, mat: 'pearl', drift: 0.25 },
  { pos: new THREE.Vector3(1.6, 0.55, 3.4), r: 0.04, mat: 'lime', drift: 0.6 },
  { pos: new THREE.Vector3(0.35, 1.05, -9.2), r: 0.11, mat: 'raspberry', drift: 0.3 },
  { pos: new THREE.Vector3(4.7, 1.4, -1.6), r: 0.16, mat: 'chrome', drift: 0.2 },
  { pos: new THREE.Vector3(1.0, 3.2, -7.5), r: 0.14, mat: 'pearl', drift: 0.25 },
] as const;

export function pearlOffset(drift: number, p: number) {
  return easeInOut(range(p, 0, PHASE.camera[1])) * drift;
}

/** 0 = sunk below the runway, 1 = standing */
export function panelRise(i: number, p: number) {
  const [a, b] = PANEL_RUNWAY[i].rise;
  if (a === b) return 1;
  return easeOut(range(p, a, b));
}

/** 0 = on the runway, 1 = locked to its HTML card */
export function panelResolve(i: number, p: number) {
  const stagger = i * 0.02;
  return easeInOut(range(p, PHASE.resolve[0] + stagger, PHASE.resolve[1] - 0.04 + stagger));
}

/** ivory veil that softens the gallery behind the lookbook */
export function veilOpacity(p: number) {
  return easeInOut(range(p, PHASE.resolve[0], PHASE.resolve[1])) * 0.9;
}

/** WebGL panels hide once HTML cards are fully opaque on top of them */
export function glPanelsVisible(p: number) {
  return p < PHASE.handoff[1];
}
