import * as THREE from 'three';

/* All extruded geometry keeps UVs in metres so the plaster texture has true scale. */

/* --------------------------------------------------------------- curved runway */
export const RUNWAY_CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-3.6, 0, 12),
    new THREE.Vector3(-0.8, 0, 7.4),
    new THREE.Vector3(1.6, 0, 3.4),
    new THREE.Vector3(2.2, 0, 0),
    new THREE.Vector3(1.2, 0, -3.4),
    new THREE.Vector3(-0.5, 0, -7),
    new THREE.Vector3(-0.9, 0, -12.5),
  ],
  false,
  'centripetal',
);

export function makeRunwayGeometry(width = 1.6, thickness = 0.06) {
  const samples = 180;
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    RUNWAY_CURVE.getPointAt(u, p);
    RUNWAY_CURVE.getTangentAt(u, t);
    const nx = -t.z;
    const nz = t.x;
    const len = Math.hypot(nx, nz) || 1;
    const hw = width / 2;
    left.push(new THREE.Vector2(p.x + (nx / len) * hw, -(p.z + (nz / len) * hw)));
    right.push(new THREE.Vector2(p.x - (nx / len) * hw, -(p.z - (nz / len) * hw)));
  }
  const shape = new THREE.Shape([...left, ...right.reverse()]);
  const bevel = 0.02;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thickness - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 1,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  return g;
}

/* --------------------------------------------------------------- architecture */
/** Solid slab (wall) w x h, extruded `depth` along +z, origin bottom-left-back. */
export function makeSlab(w: number, h: number, depth: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(w, 0);
  s.lineTo(w, h);
  s.lineTo(0, h);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
}

/** Facade with one arched opening (centre openingX in shape space). */
export function makeFacadeGeometry(width: number, height: number, openingX: number, openW: number, openH: number, depth: number) {
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
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 64 });
}

/** Thin tube following an arched opening (legs + semicircle). */
export function makeArchTrimGeometry(innerWidth: number, totalHeight: number, tube = 0.018) {
  const r = innerWidth / 2;
  const leg = totalHeight - r;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(-r, (i / 12) * leg, 0));
  for (let i = 1; i < 64; i++) {
    const a = Math.PI - (i / 64) * Math.PI;
    pts.push(new THREE.Vector3(Math.cos(a) * r, leg + Math.sin(a) * r, 0));
  }
  for (let i = 12; i >= 0; i--) pts.push(new THREE.Vector3(r, (i / 12) * leg, 0));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  return new THREE.TubeGeometry(curve, 320, tube, 12, false);
}

/* --------------------------------------------------------------- display */
export function makePedestalGeometry(radius: number, height: number, edge = 0.03) {
  const r = radius;
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(r - 0.01, 0), new THREE.Vector2(r, 0.01)];
  pts.push(new THREE.Vector2(r, height - edge));
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - edge + Math.cos(a) * edge, height - edge + Math.sin(a) * edge));
  }
  pts.push(new THREE.Vector2(0, height));
  return new THREE.LatheGeometry(pts, 96);
}

/** Rounded box via bevelled extrusion (soft edges catch the daylight). */
export function makeRoundedBox(w: number, h: number, d: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2 + r;
  const y = -h / 2 + r;
  const iw = w - 2 * r;
  const ih = h - 2 * r;
  s.moveTo(x, y);
  s.lineTo(x + iw, y);
  s.lineTo(x + iw, y + ih);
  s.lineTo(x, y + ih);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4 });
  g.translate(0, 0, -(d - 2 * r) / 2);
  return g;
}

/* --------------------------------------------------------------- 3D handbag
 * Custom, unbranded structured top-handle bag. Units: metres, origin at the base centre.
 */
const BAG = { bw: 0.42, tw: 0.33, h: 0.27, d: 0.15 };
const halfWidthAt = (y: number) => BAG.bw / 2 - (y / BAG.h) * ((BAG.bw - BAG.tw) / 2);

export function makeBagGeometries() {
  const { h, d } = BAG;
  const rc = 0.035; // corner radius
  const body = new THREE.Shape();
  const b = BAG.bw / 2;
  const t = BAG.tw / 2;
  body.moveTo(-b + rc, 0);
  body.lineTo(b - rc, 0);
  body.quadraticCurveTo(b, 0, b - 0.004, rc);
  body.lineTo(t + 0.004, h - rc);
  body.quadraticCurveTo(t, h, t - rc, h);
  body.lineTo(-t + rc, h);
  body.quadraticCurveTo(-t, h, -t - 0.004, h - rc);
  body.lineTo(-b + 0.004, rc);
  body.quadraticCurveTo(-b, 0, -b + rc, 0);
  const bevel = 0.018;
  const bodyGeo = new THREE.ExtrudeGeometry(body, {
    depth: d - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.9,
    bevelSegments: 6,
    curveSegments: 12,
  });
  bodyGeo.translate(0, bevel * 0.9, -(d - bevel * 2) / 2);

  // front flap: follows the tapered sides, curved lower edge
  const fy = 0.11;
  const flap = new THREE.Shape();
  const ft = halfWidthAt(h) - 0.004;
  const fb = halfWidthAt(fy + 0.05) - 0.004;
  flap.moveTo(-ft, h + 0.004);
  flap.lineTo(ft, h + 0.004);
  flap.lineTo(fb, fy + 0.05);
  flap.quadraticCurveTo(0, fy - 0.035, -fb, fy + 0.05);
  flap.closePath();
  const flapGeo = new THREE.ExtrudeGeometry(flap, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 3,
    curveSegments: 24,
  });
  flapGeo.translate(0, bevel * 0.9, d / 2 + 0.002);

  // arched top handle
  const hy = h + bevel;
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.09, hy - 0.005, 0),
    new THREE.Vector3(-0.088, hy + 0.07, 0),
    new THREE.Vector3(-0.055, hy + 0.135, 0),
    new THREE.Vector3(0, hy + 0.152, 0),
    new THREE.Vector3(0.055, hy + 0.135, 0),
    new THREE.Vector3(0.088, hy + 0.07, 0),
    new THREE.Vector3(0.09, hy - 0.005, 0),
  ]);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 96, 0.011, 16, false);

  const ringGeo = new THREE.TorusGeometry(0.016, 0.0042, 12, 32);
  const claspGeo = makeRoundedBox(0.07, 0.024, 0.012, 0.005);
  const footGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.008, 20);

  return {
    body: bodyGeo,
    flap: flapGeo,
    handle: handleGeo,
    ring: ringGeo,
    clasp: claspGeo,
    foot: footGeo,
    dims: { ...BAG, flapY: fy, handleY: hy, front: d / 2 + 0.014 },
  };
}

/* --------------------------------------------------------------- collection rail garments
 * Simple garment silhouettes (hanging from y = 0), extruded with soft bevels.
 */
function garment(shape: THREE.Shape) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2, curveSegments: 16 });
  g.translate(0, 0, -0.01);
  return g;
}
export function makeGarmentGeometries() {
  const dress = new THREE.Shape();
  dress.moveTo(-0.12, -0.06);
  dress.lineTo(0.12, -0.06);
  dress.lineTo(0.17, -0.32);
  dress.quadraticCurveTo(0.23, -0.7, 0.3, -1.05);
  dress.lineTo(-0.3, -1.05);
  dress.quadraticCurveTo(-0.23, -0.7, -0.17, -0.32);
  dress.closePath();

  const jacket = new THREE.Shape();
  jacket.moveTo(-0.16, -0.05);
  jacket.lineTo(0.16, -0.05);
  jacket.lineTo(0.3, -0.14);
  jacket.lineTo(0.34, -0.62);
  jacket.lineTo(0.25, -0.62);
  jacket.lineTo(0.23, -0.32);
  jacket.lineTo(0.22, -0.66);
  jacket.lineTo(-0.22, -0.66);
  jacket.lineTo(-0.23, -0.32);
  jacket.lineTo(-0.25, -0.62);
  jacket.lineTo(-0.34, -0.62);
  jacket.lineTo(-0.3, -0.14);
  jacket.closePath();

  const trousers = new THREE.Shape();
  trousers.moveTo(-0.2, -0.06);
  trousers.lineTo(0.2, -0.06);
  trousers.lineTo(0.27, -1.0);
  trousers.lineTo(0.035, -1.0);
  trousers.lineTo(0, -0.42);
  trousers.lineTo(-0.035, -1.0);
  trousers.lineTo(-0.27, -1.0);
  trousers.closePath();

  const hangerCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.19, -0.07, 0),
    new THREE.Vector3(0, -0.005, 0),
    new THREE.Vector3(0.19, -0.07, 0),
  ]);
  return {
    dress: garment(dress),
    jacket: garment(jacket),
    trousers: garment(trousers),
    hanger: new THREE.TubeGeometry(hangerCurve, 24, 0.006, 8, false),
    hook: new THREE.TorusGeometry(0.03, 0.005, 8, 24, Math.PI * 1.4),
  };
}
