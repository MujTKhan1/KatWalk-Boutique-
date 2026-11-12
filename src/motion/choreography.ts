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
 * Outside the facade -> through the arch -> a sideways arc round the featured display
 * -> step back and face the collection (rail, folded table, framed prints).
 * Keyframes are reached at explicit times (KEY_T), so pacing is authored, not accidental.
 */
const CAM_KEYS = [
  new THREE.Vector3(1.15, 1.75, 13.6), // opening view of the facade
  new THREE.Vector3(1.85, 1.64, 6.4), // approach
  new THREE.Vector3(2.2, 1.58, 0.9), // crossing the arch
  new THREE.Vector3(3.6, 1.55, -1.2), // sideways reveal begins
  new THREE.Vector3(5.15, 1.55, -3.0), // side view of the featured bag, rail behind
  new THREE.Vector3(4.4, 1.7, -1.5), // step back, facing the collection
];
const LOOK_KEYS = [
  new THREE.Vector3(-0.55, 2.05, 0),
  new THREE.Vector3(1.6, 1.6, -3),
  new THREE.Vector3(2.35, 1.2, -5),
  new THREE.Vector3(2.4, 1.1, -5.05),
  new THREE.Vector3(2.2, 1.15, -5.3),
  new THREE.Vector3(2.65, 1.78, -13),
];
/** when (in eased camera progress 0..1) each keyframe is reached */
const KEY_T = [0, 0.24, 0.46, 0.62, 0.79, 1];
const camRail = new THREE.CatmullRomCurve3(CAM_KEYS, false, 'centripetal');
const lookRail = new THREE.CatmullRomCurve3(LOOK_KEYS, false, 'centripetal');

export function cameraU(p: number) {
  return easeInOut(range(p, PHASE.camera[0], PHASE.camera[1]));
}

/** map authored time -> spline parameter (one spline segment per keyframe gap) */
function keyParam(u: number) {
  let i = 0;
  while (i < KEY_T.length - 2 && u > KEY_T[i + 1]) i++;
  const local = range(u, KEY_T[i], KEY_T[i + 1]);
  return (i + local) / (KEY_T.length - 1);
}

export function cameraPose(p: number, pos: THREE.Vector3, look: THREE.Vector3) {
  const t = keyParam(cameraU(p));
  camRail.getPoint(t, pos);
  lookRail.getPoint(t, look);
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
/** the bag turns to keep its face toward the visitor as the camera arcs round it */
export function handbagRotation(p: number) {
  return -0.08 + easeInOut(range(p, PHASE.approach[0] + 0.08, 0.6)) * 0.72;
}

/**
 * Editorial prints hung on the back wall, indexed like LOOKBOOK.
 * After-Dark (index 2) hangs on the entrance axis, so it is framed by the arch in the opening view.
 */
export const PANEL_WALL = [
  { pos: new THREE.Vector3(-1.0, 2.25, -13.9), height: 2.3 },
  { pos: new THREE.Vector3(6.0, 2.25, -13.9), height: 2.3 },
  { pos: new THREE.Vector3(2.6, 2.4, -13.9), height: 2.7 },
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

/** ivory veil: fully opaque before the lookbook heading arrives, so nothing of the room shows under the cards */
export function veilOpacity(p: number) {
  return easeInOut(range(p, PHASE.resolve[0], PHASE.resolve[0] + 0.09));
}

/** WebGL prints hide once HTML cards are fully opaque on top of them */
export function glPanelsVisible(p: number) {
  return p < PHASE.handoff[1];
}
