import * as THREE from 'three';

/* --------------------------------------------------------------- curved runway */
export const RUNWAY_CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-4.2, 0, 10),
    new THREE.Vector3(-1.4, 0, 5),
    new THREE.Vector3(1.0, 0, 1.6),
    new THREE.Vector3(1.45, 0, -1.2),
    new THREE.Vector3(1.7, 0, -4.6),
    new THREE.Vector3(1.15, 0, -8.5),
    new THREE.Vector3(-0.6, 0, -13.5),
  ],
  false,
  'centripetal',
);

/** Extruded band with soft bevelled edges following RUNWAY_CURVE. */
export function makeRunwayGeometry(width = 1.85, thickness = 0.1) {
  const samples = 160;
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    RUNWAY_CURVE.getPointAt(u, p);
    RUNWAY_CURVE.getTangentAt(u, t);
    // normal in the xz-plane
    const nx = -t.z;
    const nz = t.x;
    const len = Math.hypot(nx, nz) || 1;
    const hw = width / 2;
    // shape space: (x, y) where y = -z_world (see rotation below)
    left.push(new THREE.Vector2(p.x + (nx / len) * hw, -(p.z + (nz / len) * hw)));
    right.push(new THREE.Vector2(p.x - (nx / len) * hw, -(p.z - (nz / len) * hw)));
  }
  const shape = new THREE.Shape([...left, ...right.reverse()]);
  const bevel = 0.035;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thickness - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 1,
  });
  // rotateX(-90deg): shape (x, y, depth) -> world (x, depth, -y)
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  return g;
}

/* --------------------------------------------------------------- pedestal */
export function makePedestalGeometry(radius: number, height: number) {
  const r = radius;
  const e = 0.045; // edge radius
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(r - 0.01, 0), new THREE.Vector2(r, 0.01)];
  pts.push(new THREE.Vector2(r, height - e));
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - e + Math.cos(a) * e, height - e + Math.sin(a) * e));
  }
  pts.push(new THREE.Vector2(0, height));
  return new THREE.LatheGeometry(pts, 96);
}

/* --------------------------------------------------------------- chrome arch */
export function makeArchGeometry(innerWidth: number, legHeight: number, tube = 0.032) {
  const r = innerWidth / 2;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(-r, (i / 12) * legHeight, 0));
  for (let i = 1; i < 48; i++) {
    const a = Math.PI - (i / 48) * Math.PI;
    pts.push(new THREE.Vector3(Math.cos(a) * r, legHeight + Math.sin(a) * r, 0));
  }
  for (let i = 12; i >= 0; i--) pts.push(new THREE.Vector3(r, (i / 12) * legHeight, 0));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  return new THREE.TubeGeometry(curve, 260, tube, 14, false);
}

/* --------------------------------------------------------------- arcade wall
 * A thick ivory wall with a row of arched openings. Built in shape space (x along the wall).
 */
export function makeArcadeGeometry(length: number, height: number, archW: number, archH: number, spacing: number, depth = 0.45) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(length, 0);
  shape.lineTo(length, height);
  shape.lineTo(0, height);
  shape.closePath();
  const count = Math.floor((length - 0.6) / spacing);
  const start = (length - (count - 1) * spacing) / 2;
  for (let i = 0; i < count; i++) {
    const cx = start + i * spacing;
    const r = archW / 2;
    const hole = new THREE.Path();
    hole.moveTo(cx - r, 0.001);
    hole.lineTo(cx - r, archH - r);
    hole.absarc(cx, archH - r, r, Math.PI, 0, true);
    hole.lineTo(cx + r, 0.001);
    hole.closePath();
    shape.holes.push(hole);
  }
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 28 });
}

/** A single wall spanning the path, with one large arched opening centred at `openingX`. */
export function makePortalGeometry(width: number, height: number, openingX: number, openW: number, openH: number, depth = 0.6) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(width, 0);
  shape.lineTo(width, height);
  shape.lineTo(0, height);
  shape.closePath();
  const r = openW / 2;
  const hole = new THREE.Path();
  hole.moveTo(openingX - r, 0.001);
  hole.lineTo(openingX - r, openH - r);
  hole.absarc(openingX, openH - r, r, Math.PI, 0, true);
  hole.lineTo(openingX + r, 0.001);
  hole.closePath();
  shape.holes.push(hole);
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 40 });
}
