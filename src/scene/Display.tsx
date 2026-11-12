import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LAYOUT, handbagRotation } from '../motion/choreography';
import { store } from '../motion/store';
import { FABRICS, fabric, mats } from './materials';
import { makeBagGeometries, makeGarmentGeometries, makePedestalGeometry, makeRoundedBox } from './geometry';
import { BlobShadow } from './Environment';

function useDispose(items: Record<string, unknown>) {
  useEffect(
    () => () =>
      Object.values(items).forEach((g) => {
        if (g instanceof THREE.BufferGeometry || g instanceof THREE.Material) g.dispose();
      }),
    [items],
  );
}

/* ------------------------------------------------------------------ featured accessory */
/** Custom 3D structured top-handle bag (unbranded): pebbled leather, saddle stitching, brass hardware. */
function Handbag() {
  const group = useRef<THREE.Group>(null);
  const stitchMesh = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => makeBagGeometries(), []);
  useDispose(geo as unknown as Record<string, unknown>);

  useLayoutEffect(() => {
    const im = stitchMesh.current;
    if (!im) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    geo.stitches.forEach((s, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), s.a);
      m.compose(s.p, q, one);
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
  }, [geo]);

  useFrame(() => {
    if (group.current) group.current.rotation.y = handbagRotation(store.p);
  });
  const m = mats();
  const { dims } = geo;
  const top = LAYOUT.platformHeight + LAYOUT.plinthHeight;
  return (
    <group ref={group} position={[LAYOUT.display.x, top + 0.004, LAYOUT.display.z]} scale={LAYOUT.bagScale}>
      <mesh geometry={geo.body} material={m.leather} castShadow receiveShadow />
      <mesh geometry={geo.flap} material={m.leather} castShadow receiveShadow />
      <mesh geometry={geo.edge} material={m.leatherEdge} />
      <instancedMesh ref={stitchMesh} args={[geo.stitch, m.stitch, geo.stitches.length]} />
      <mesh geometry={geo.handle} material={m.leather} castShadow />
      {[-0.09, 0.09].map((x) => (
        <group key={x}>
          <mesh geometry={geo.tab} material={m.leather} position={[x, dims.handleY - 0.006, 0]} castShadow />
          <mesh geometry={geo.ring} material={m.gold} position={[x, dims.handleY + 0.016, 0]} />
        </group>
      ))}
      <mesh geometry={geo.clasp} material={m.gold} position={[0, dims.flapY + 0.03, dims.front + 0.002]} />
      <mesh geometry={geo.knob} material={m.gold} position={[0, dims.flapY + 0.03, dims.front + 0.009]} rotation-x={Math.PI / 2} />
      {[-0.15, 0.15].map((x) =>
        [-0.045, 0.045].map((z) => <mesh key={`${x}${z}`} geometry={geo.foot} material={m.gold} position={[x, 0.003, z]} />),
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ boutique life */
export const RAIL = { x0: 3.15, x1: 5.75, z: -8.3, h: 1.78 };
const HANGING = [
  { type: 'coat', color: FABRICS[4] },
  { type: 'shirt', color: FABRICS[0] },
  { type: 'dress', color: FABRICS[2] },
  { type: 'jacket', color: FABRICS[3] },
  { type: 'dress', color: FABRICS[6] },
  { type: 'trousers', color: FABRICS[7] },
  { type: 'jacket', color: FABRICS[1] },
] as const;

function CollectionRail() {
  const g = useMemo(() => makeGarmentGeometries(), []);
  const parts = useMemo(
    () => ({
      upright: new THREE.CylinderGeometry(0.014, 0.014, RAIL.h, 16),
      bar: new THREE.CylinderGeometry(0.012, 0.012, RAIL.x1 - RAIL.x0 + 0.1, 16),
      foot: new THREE.CylinderGeometry(0.16, 0.18, 0.02, 32),
    }),
    [],
  );
  const fabricMats = useMemo(() => Object.fromEntries(FABRICS.map((c) => [c, fabric(c)])), []);
  useDispose(g as unknown as Record<string, unknown>);
  useDispose(parts);
  useDispose(fabricMats);
  const m = mats();
  const step = (RAIL.x1 - RAIL.x0 - 0.3) / (HANGING.length - 1);
  return (
    <group>
      {[RAIL.x0, RAIL.x1].map((x) => (
        <group key={x}>
          <mesh geometry={parts.upright} material={m.chrome} position={[x, RAIL.h / 2, RAIL.z]} castShadow />
          <mesh geometry={parts.foot} material={m.chrome} position={[x, 0.01, RAIL.z]} castShadow receiveShadow />
        </group>
      ))}
      <mesh geometry={parts.bar} material={m.chrome} position={[(RAIL.x0 + RAIL.x1) / 2, RAIL.h, RAIL.z]} rotation-z={Math.PI / 2} castShadow />
      {HANGING.map((it, i) => (
        <group key={i} position={[RAIL.x0 + 0.15 + i * step, RAIL.h - 0.02, RAIL.z + (i % 2) * 0.03]} rotation-y={0.32 - i * 0.07}>
          <mesh geometry={g.hook} material={m.chrome} position={[0, 0.02, 0]} rotation-z={-0.4} />
          <mesh geometry={g.hanger} material={m.chrome} position={[0, -0.03, 0]} />
          <mesh geometry={g[it.type]} material={fabricMats[it.color]} position={[0, -0.03, 0]} castShadow receiveShadow />
        </group>
      ))}
      <BlobShadow position={[(RAIL.x0 + RAIL.x1) / 2, 0.005, RAIL.z]} scale={[3.4, 1.1]} opacity={0.7} />
    </group>
  );
}

const TABLE = { pos: new THREE.Vector3(0.75, 0, -9.3), w: 1.5, h: 0.44, d: 0.66 };
function FoldedTable() {
  const parts = useMemo(
    () => ({
      top: makeRoundedBox(TABLE.w, 0.06, TABLE.d, 0.02),
      base: makeRoundedBox(TABLE.w - 0.24, TABLE.h - 0.06, TABLE.d - 0.2, 0.02),
      fold: makeRoundedBox(0.4, 0.068, 0.3, 0.022),
    }),
    [],
  );
  const fabricMats = useMemo(() => Object.fromEntries(FABRICS.map((c) => [c, fabric(c)])), []);
  useDispose(parts);
  useDispose(fabricMats);
  const stacks = [
    { x: -0.44, z: 0.04, colors: [FABRICS[5], FABRICS[0], FABRICS[1], FABRICS[0]], r: 0.08 },
    { x: 0.04, z: -0.06, colors: [FABRICS[2], FABRICS[2], FABRICS[6]], r: -0.06 },
    { x: 0.48, z: 0.05, colors: [FABRICS[4], FABRICS[3], FABRICS[5], FABRICS[7], FABRICS[0]], r: 0.14 },
  ];
  const m = mats();
  return (
    <group position={TABLE.pos} rotation-y={0.12}>
      <mesh geometry={parts.base} material={m.table} position={[0, (TABLE.h - 0.06) / 2, 0]} castShadow receiveShadow />
      <mesh geometry={parts.top} material={m.table} position={[0, TABLE.h - 0.03, 0]} castShadow receiveShadow />
      {stacks.map((s, si) => (
        <group key={si} position={[s.x, TABLE.h, s.z]} rotation-y={s.r}>
          {s.colors.map((c, i) => (
            <mesh key={i} geometry={parts.fold} material={fabricMats[c]} position={[(i % 2) * 0.008, 0.034 + i * 0.07, 0]} rotation-y={(i % 3) * 0.03} castShadow receiveShadow />
          ))}
        </group>
      ))}
      <BlobShadow position={[0, 0.004, 0]} scale={[2.2, 1.3]} opacity={0.8} />
    </group>
  );
}

/** Leaning full-length mirror and a blush bench: the fitting-room corner. */
function MirrorCorner() {
  const parts = useMemo(
    () => ({
      frame: makeRoundedBox(0.84, 2.0, 0.04, 0.015),
      glass: new THREE.PlaneGeometry(0.76, 1.92),
      bench: makeRoundedBox(1.3, 0.16, 0.46, 0.05),
      leg: new THREE.CylinderGeometry(0.018, 0.018, 0.3, 12),
    }),
    [],
  );
  useDispose(parts);
  const m = mats();
  return (
    <group>
      <group position={[8.85, 1.0, -5.6]} rotation={[0, -Math.PI / 2 + 0.25, -0.07]}>
        <mesh geometry={parts.frame} material={m.nickel} castShadow />
        <mesh geometry={parts.glass} material={m.mirror} position={[0, 0, 0.022]} />
      </group>
      <group position={[7.6, 0, -6.5]} rotation-y={-0.3}>
        <mesh geometry={parts.bench} material={m.platform} position={[0, 0.38, 0]} castShadow receiveShadow />
        {[-0.55, 0.55].map((x) =>
          [-0.16, 0.16].map((z) => <mesh key={`${x}${z}`} geometry={parts.leg} material={m.nickel} position={[x, 0.15, z]} castShadow />),
        )}
      </group>
      <BlobShadow position={[7.6, 0.004, -6.5]} scale={[1.8, 0.9]} opacity={0.6} />
    </group>
  );
}

/* ------------------------------------------------------------------ featured display */
export function Display() {
  const geo = useMemo(
    () => ({
      platform: makePedestalGeometry(LAYOUT.platformRadius, LAYOUT.platformHeight, 0.025),
      plinth: makePedestalGeometry(LAYOUT.plinthRadius, LAYOUT.plinthHeight, 0.02),
    }),
    [],
  );
  useDispose(geo);
  const m = mats();
  const d = LAYOUT.display;
  const top = LAYOUT.platformHeight + LAYOUT.plinthHeight;

  return (
    <group>
      <mesh geometry={geo.platform} material={m.platform} position={d} castShadow receiveShadow />
      <mesh geometry={geo.plinth} material={m.plinth} position={[d.x, LAYOUT.platformHeight, d.z]} castShadow receiveShadow />
      <BlobShadow position={[d.x, 0.004, d.z]} scale={[2.8, 2.8]} opacity={0.85} />
      <BlobShadow position={[d.x, top + 0.003, d.z]} scale={[0.85, 0.45]} opacity={1} />
      <Handbag />
      <CollectionRail />
      <FoldedTable />
      <MirrorCorner />
    </group>
  );
}
