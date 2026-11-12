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
  const rc = 0.04; // corner radius
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
  // softer, rounder edges than before
  const bevel = 0.026;
  const bodyGeo = new THREE.ExtrudeGeometry(body, {
    depth: d - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.85,
    bevelSegments: 10,
    curveSegments: 16,
  });
  bodyGeo.translate(0, bevel * 0.85, -(d - bevel * 2) / 2);
  const front = d / 2; // front face of the body

  // front flap: follows the tapered sides, curved lower edge
  const fy = 0.11;
  const flap = new THREE.Shape();
  const ft = halfWidthAt(h) - 0.006;
  const fb = halfWidthAt(fy + 0.05) - 0.006;
  flap.moveTo(-ft, h + 0.006);
  flap.lineTo(ft, h + 0.006);
  flap.lineTo(fb, fy + 0.05);
  flap.quadraticCurveTo(0, fy - 0.035, -fb, fy + 0.05);
  flap.closePath();
  const fBevel = 0.008;
  const flapGeo = new THREE.ExtrudeGeometry(flap, {
    depth: 0.004,
    bevelEnabled: true,
    bevelThickness: fBevel,
    bevelSize: 0.006,
    bevelSegments: 6,
    curveSegments: 32,
  });
  const yOff = bevel * 0.85;
  flapGeo.translate(0, yOff, front + 0.002);
  const flapFront = front + 0.002 + 0.004 + fBevel;

  // painted edge along the flap's curved lower edge
  const edgeCurve = new THREE.CatmullRomCurve3(
    new THREE.QuadraticBezierCurve(new THREE.Vector2(fb + 0.004, fy + 0.05), new THREE.Vector2(0, fy - 0.039), new THREE.Vector2(-fb - 0.004, fy + 0.05))
      .getSpacedPoints(40)
      .map((p) => new THREE.Vector3(p.x, p.y + yOff, front + 0.008)),
  );
  const edgeGeo = new THREE.TubeGeometry(edgeCurve, 80, 0.0032, 8, false);

  // saddle stitching: flap (sides + curved hem) and the base seam of the body
  const stitches: { p: THREE.Vector3; a: number }[] = [];
  const addRun = (pts: THREE.Vector2[], z: number) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const c = pts[i + 1];
      stitches.push({ p: new THREE.Vector3((a.x + c.x) / 2, (a.y + c.y) / 2 + yOff, z), a: Math.atan2(c.y - a.y, c.x - a.x) });
    }
  };
  const inset = 0.014;
  addRun(
    new THREE.QuadraticBezierCurve(
      new THREE.Vector2(fb - inset, fy + 0.05 + 0.01),
      new THREE.Vector2(0, fy - 0.035 + inset + 0.004),
      new THREE.Vector2(-fb + inset, fy + 0.05 + 0.01),
    ).getSpacedPoints(64),
    flapFront + 0.0006,
  );
  addRun(new THREE.LineCurve(new THREE.Vector2(fb - inset, fy + 0.06), new THREE.Vector2(ft - inset, h - 0.004)).getSpacedPoints(28), flapFront + 0.0006);
  addRun(new THREE.LineCurve(new THREE.Vector2(-fb + inset, fy + 0.06), new THREE.Vector2(-ft + inset, h - 0.004)).getSpacedPoints(28), flapFront + 0.0006);
  addRun(new THREE.LineCurve(new THREE.Vector2(-b + 0.05, 0.02), new THREE.Vector2(b - 0.05, 0.02)).getSpacedPoints(70), front + 0.0012);
  const stitchGeo = new THREE.BoxGeometry(0.0042, 0.0013, 0.0012);

  // arched top handle with leather tabs
  const hy = h + bevel * 0.85;
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.09, hy + 0.012, 0),
    new THREE.Vector3(-0.088, hy + 0.08, 0),
    new THREE.Vector3(-0.055, hy + 0.142, 0),
    new THREE.Vector3(0, hy + 0.158, 0),
    new THREE.Vector3(0.055, hy + 0.142, 0),
    new THREE.Vector3(0.088, hy + 0.08, 0),
    new THREE.Vector3(0.09, hy + 0.012, 0),
  ]);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 120, 0.011, 20, false);
  const tabGeo = makeRoundedBox(0.026, 0.05, 0.016, 0.006);

  // hardware: thicker D-rings, a turn-lock style clasp plate with a knob, gold feet
  const ringGeo = new THREE.TorusGeometry(0.015, 0.0045, 16, 40);
  const claspGeo = makeRoundedBox(0.074, 0.03, 0.008, 0.004);
  const knobGeo = new THREE.CylinderGeometry(0.009, 0.0105, 0.01, 32);
  const footGeo = new THREE.CylinderGeometry(0.011, 0.012, 0.009, 24);

  return {
    body: bodyGeo,
    flap: flapGeo,
    edge: edgeGeo,
    handle: handleGeo,
    tab: tabGeo,
    ring: ringGeo,
    clasp: claspGeo,
    knob: knobGeo,
    foot: footGeo,
    stitch: stitchGeo,
    stitches,
    dims: { ...BAG, flapY: fy + yOff, handleY: hy, front: flapFront },
  };
}

/* --------------------------------------------------------------- collection rail garments
 * Garment silhouettes (hanging from y = 0), extruded with soft bevels and given a gentle
 * drape: the hem swings forward and the body curves, so they read as cloth, not cut-outs.
 */
function garment(shape: THREE.Shape, drape = 0.06) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.024, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.012, bevelSegments: 3, curveSegments: 20 });
  g.translate(0, 0, -0.012);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const down = Math.max(0, -v.y);
    // body curvature across the width + forward swing toward the hem
    v.z += -0.08 * v.x * v.x + drape * down * down * 0.6;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
export function makeGarmentGeometries() {
  const dress = new THREE.Shape();
  dress.moveTo(-0.12, -0.06);
  dress.lineTo(0.12, -0.06);
  dress.lineTo(0.17, -0.32);
  dress.quadraticCurveTo(0.23, -0.7, 0.3, -1.08);
  dress.quadraticCurveTo(0, -1.12, -0.3, -1.08);
  dress.quadraticCurveTo(-0.23, -0.7, -0.17, -0.32);
  dress.closePath();

  const jacket = new THREE.Shape();
  jacket.moveTo(-0.16, -0.05);
  jacket.lineTo(0.16, -0.05);
  jacket.quadraticCurveTo(0.27, -0.08, 0.31, -0.16);
  jacket.lineTo(0.35, -0.62);
  jacket.lineTo(0.25, -0.63);
  jacket.lineTo(0.235, -0.32);
  jacket.lineTo(0.225, -0.68);
  jacket.quadraticCurveTo(0, -0.7, -0.225, -0.68);
  jacket.lineTo(-0.235, -0.32);
  jacket.lineTo(-0.25, -0.63);
  jacket.lineTo(-0.35, -0.62);
  jacket.lineTo(-0.31, -0.16);
  jacket.quadraticCurveTo(-0.27, -0.08, -0.16, -0.05);

  const coat = new THREE.Shape();
  coat.moveTo(-0.16, -0.05);
  coat.lineTo(0.16, -0.05);
  coat.quadraticCurveTo(0.27, -0.08, 0.3, -0.16);
  coat.lineTo(0.33, -0.7);
  coat.lineTo(0.25, -0.7);
  coat.lineTo(0.24, -0.36);
  coat.lineTo(0.27, -1.12);
  coat.quadraticCurveTo(0, -1.15, -0.27, -1.12);
  coat.lineTo(-0.24, -0.36);
  coat.lineTo(-0.25, -0.7);
  coat.lineTo(-0.33, -0.7);
  coat.lineTo(-0.3, -0.16);
  coat.quadraticCurveTo(-0.27, -0.08, -0.16, -0.05);

  const shirt = new THREE.Shape();
  shirt.moveTo(-0.15, -0.05);
  shirt.lineTo(0.15, -0.05);
  shirt.lineTo(0.26, -0.12);
  shirt.lineTo(0.3, -0.36);
  shirt.lineTo(0.22, -0.38);
  shirt.lineTo(0.21, -0.2);
  shirt.lineTo(0.21, -0.74);
  shirt.quadraticCurveTo(0, -0.79, -0.21, -0.74);
  shirt.lineTo(-0.21, -0.2);
  shirt.lineTo(-0.22, -0.38);
  shirt.lineTo(-0.3, -0.36);
  shirt.lineTo(-0.26, -0.12);
  shirt.closePath();

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
    dress: garment(dress, 0.08),
    jacket: garment(jacket),
    coat: garment(coat, 0.07),
    shirt: garment(shirt),
    trousers: garment(trousers, 0.04),
    hanger: new THREE.TubeGeometry(hangerCurve, 24, 0.006, 8, false),
    hook: new THREE.TorusGeometry(0.03, 0.005, 8, 24, Math.PI * 1.4),
  };
}
