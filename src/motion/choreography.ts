import * as THREE from 'three';

import { PHASE, range, easeInOut } from './phases';

export * from './phases';
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------------------------------------------------------- layout (metres) */
export const LAYOUT = {
  /** facade plane (front face at z = +facadeDepth/2) */
  facadeDepth: 0.6,
  entranceX: 2.2,
  entranceW: 3.0,
  entranceH: 4.5,
  /** interior room */
  room: { left: -4.6, right: 9.2, back: -14 },
  /** featured display, inside on the axis of the entrance */
  display: new THREE.Vector3(2.35, 0, -5),
  platformRadius: 0.95,
  platformHeight: 0.16,
  plinthRadius: 0.4,
  plinthHeight: 0.86,
  /** scale applied to the bag model (real size x1.5 for presence) */
  bagScale: 1.5,
};

/* ---------------------------------------------------------------- camera rail
 * Outside the facade -> through the arch -> toward the featured display -> turn to the
 * back wall where the editorial prints hang. Arc-length sampled, so speed is even.
 */
const camRail = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(1.15, 1.75, 13.6),
    new THREE.Vector3(1.85, 1.64, 6.4),
    new THREE.Vector3(2.2, 1.58, 1.4),
    new THREE.Vector3(1.75, 1.58, -1.0),
    new THREE.Vector3(0.75, 1.66, -1.8),
  ],
  false,
  'centripetal',
);
const lookRail = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-0.55, 2.05, 0),
    new THREE.Vector3(1.6, 1.6, -3),
    new THREE.Vector3(2.35, 1.2, -5),
    new THREE.Vector3(2.6, 1.55, -9),
    new THREE.Vector3(2.95, 1.95, -13.5),
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

/** a whisper of roll as we pass the threshold */
export function cameraRoll(p: number) {
  const t = range(p, PHASE.approach[0], PHASE.frame[1]);
  return Math.sin(t * Math.PI) * -0.012;
}

/** restrained pointer parallax, faded out before the DOM handoff */
export function parallaxWeight(p: number) {
  return 1 - range(p, 0.68, PHASE.resolve[0]);
}

/* ---------------------------------------------------------------- objects */
/** the bag turns ~30 degrees toward the visitor as they approach */
export function handbagRotation(p: number) {
  return -0.42 + easeInOut(range(p, PHASE.approach[0], PHASE.frame[1])) * 0.55;
}

/**
 * Editorial prints hung on the back wall, indexed like LOOKBOOK.
 * After-Dark (index 2) hangs on the entrance axis, so it is framed by the arch in the opening view.
 */
export const PANEL_WALL = [
  { pos: new THREE.Vector3(-0.9, 2.25, -13.62), height: 2.3 },
  { pos: new THREE.Vector3(7.0, 2.25, -13.62), height: 2.3 },
  { pos: new THREE.Vector3(3.15, 2.4, -13.62), height: 2.7 },
];

/** prints are already hanging; this is kept for API compatibility (always 1) */
export function panelRise() {
  return 1;
}

/** 0 = on the wall, 1 = locked to its HTML card */
export function panelResolve(i: number, p: number) {
  const stagger = i * 0.02;
  return easeInOut(range(p, PHASE.resolve[0] + stagger, PHASE.resolve[1] - 0.04 + stagger));
}

/** gallery picture lights brighten as the interior is revealed */
export function galleryLight(p: number) {
  return 0.35 + easeInOut(range(p, PHASE.frame[0], PHASE.reveal[0] + 0.1)) * 0.65;
}

/** ivory veil that softens the room behind the lookbook */
export function veilOpacity(p: number) {
  return easeInOut(range(p, PHASE.resolve[0], PHASE.resolve[1])) * 0.92;
}

/** WebGL prints hide once HTML cards are fully opaque on top of them */
export function glPanelsVisible(p: number) {
  return p < PHASE.handoff[1];
}
