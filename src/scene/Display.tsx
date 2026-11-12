import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LAYOUT, handbagRotation } from '../motion/choreography';
import { store } from '../motion/store';
import { FABRICS, fabric, mats } from './materials';
import { makeBagGeometries, makeGarmentGeometries, makePedestalGeometry, makeRoundedBox } from './geometry';
import { BlobShadow } from './Environment';

/* ------------------------------------------------------------------ featured accessory */
/** Custom 3D structured top-handle bag (unbranded). Turns gently toward the visitor on approach. */
function Handbag() {
  const group = useRef<THREE.Group>(null);
  const geo = useMemo(() => makeBagGeometries(), []);
  useEffect(
    () => () =>
      Object.values(geo).forEach((g) => {
        if (g instanceof THREE.BufferGeometry) g.dispose();
      }),
    [geo],
  );
  useFrame(() => {
    if (group.current) group.current.rotation.y = handbagRotation(store.p);
  });
  const m = mats();
  const { dims } = geo;
  const top = LAYOUT.platformHeight + LAYOUT.plinthHeight;
  return (
    <group ref={group} position={[LAYOUT.display.x, top + 0.004, LAYOUT.display.z]} scale={LAYOUT.bagScale}>
      <mesh geometry={geo.body} material={m.leather} castShadow />
      <mesh geometry={geo.flap} material={m.leather} castShadow />
      <mesh geometry={geo.handle} material={m.leather} castShadow />
      <mesh geometry={geo.ring} material={m.gold} position={[-0.09, dims.handleY + 0.004, 0]} />
      <mesh geometry={geo.ring} material={m.gold} position={[0.09, dims.handleY + 0.004, 0]} />
      <mesh geometry={geo.clasp} material={m.gold} position={[0, dims.flapY + 0.035, dims.front]} />
      {[-0.15, 0.15].map((x) =>
        [-0.045, 0.045].map((z) => <mesh key={`${x}${z}`} geometry={geo.foot} material={m.gold} position={[x, 0.002, z]} />),
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ collection displays */
const RAIL = { x0: -3.95, x1: -2.05, z: -9.7, h: 1.78 };
const HANGING = [
  { type: 'jacket', color: FABRICS[1], x: -3.65 },
  { type: 'dress', color: FABRICS[2], x: -3.22 },
  { type: 'trousers', color: FABRICS[3], x: -2.82 },
  { type: 'jacket', color: FABRICS[0], x: -2.4 },
] as const;

function CollectionRail() {
  const g = useMemo(() => makeGarmentGeometries(), []);
  const upright = useMemo(() => new THREE.CylinderGeometry(0.014, 0.014, RAIL.h, 16), []);
  const bar = useMemo(() => new THREE.CylinderGeometry(0.012, 0.012, RAIL.x1 - RAIL.x0 + 0.1, 16), []);
  const foot = useMemo(() => new THREE.CylinderGeometry(0.16, 0.18, 0.02, 32), []);
  const fabricMats = useMemo(() => Object.fromEntries(FABRICS.map((c) => [c, fabric(c)])), []);
  useEffect(
    () => () => {
      Object.values(g).forEach((x) => x.dispose());
      upright.dispose();
      bar.dispose();
      foot.dispose();
      Object.values(fabricMats).forEach((x) => x.dispose());
    },
    [g, upright, bar, foot, fabricMats],
  );
  const m = mats();
  return (
    <group>
      {[RAIL.x0, RAIL.x1].map((x) => (
        <group key={x}>
          <mesh geometry={upright} material={m.chrome} position={[x, RAIL.h / 2, RAIL.z]} castShadow />
          <mesh geometry={foot} material={m.chrome} position={[x, 0.01, RAIL.z]} castShadow />
        </group>
      ))}
      <mesh geometry={bar} material={m.chrome} position={[(RAIL.x0 + RAIL.x1) / 2, RAIL.h, RAIL.z]} rotation-z={Math.PI / 2} castShadow />
      {HANGING.map((it, i) => (
        <group key={i} position={[it.x, RAIL.h - 0.02, RAIL.z]} rotation-y={0.18 - i * 0.1}>
          <mesh geometry={g.hook} material={m.chrome} position={[0, 0.02, 0]} rotation-z={-0.4} />
          <mesh geometry={g.hanger} material={m.chrome} position={[0, -0.03, 0]} />
          <mesh geometry={g[it.type]} material={fabricMats[it.color]} position={[0, -0.03, 0]} castShadow receiveShadow />
        </group>
      ))}
      <BlobShadow position={[(RAIL.x0 + RAIL.x1) / 2, 0.005, RAIL.z]} scale={[2.6, 0.9]} opacity={0.6} />
    </group>
  );
}

const STACK_POS = new THREE.Vector3(5.7, 0, -8.6);
function FoldedStacks() {
  const fold = useMemo(() => makeRoundedBox(0.44, 0.07, 0.32, 0.02), []);
  const platform = useMemo(() => makePedestalGeometry(0.95, 0.24, 0.025), []);
  const fabricMats = useMemo(() => Object.fromEntries(FABRICS.map((c) => [c, fabric(c)])), []);
  useEffect(
    () => () => {
      fold.dispose();
      platform.dispose();
      Object.values(fabricMats).forEach((x) => x.dispose());
    },
    [fold, platform, fabricMats],
  );
  const stacks = [
    { x: -0.4, z: 0.12, colors: [FABRICS[5], FABRICS[0], FABRICS[1], FABRICS[0]], r: 0.1 },
    { x: 0.12, z: -0.18, colors: [FABRICS[2], FABRICS[2], FABRICS[6]], r: -0.08 },
    { x: 0.42, z: 0.28, colors: [FABRICS[4], FABRICS[3], FABRICS[5], FABRICS[1], FABRICS[0]], r: 0.25 },
  ];
  const m = mats();
  return (
    <group position={STACK_POS}>
      <mesh geometry={platform} material={m.platform} castShadow receiveShadow />
      {stacks.map((s, si) => (
        <group key={si} position={[s.x, 0.24, s.z]} rotation-y={s.r}>
          {s.colors.map((c, i) => (
            <mesh key={i} geometry={fold} material={fabricMats[c]} position={[(i % 2) * 0.008, 0.035 + i * 0.072, 0]} rotation-y={(i % 3) * 0.03} castShadow receiveShadow />
          ))}
        </group>
      ))}
      <BlobShadow position={[0, 0.004, 0]} scale={[2.4, 2.4]} opacity={0.7} />
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
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  const m = mats();
  const d = LAYOUT.display;
  const top = LAYOUT.platformHeight + LAYOUT.plinthHeight;

  return (
    <group>
      <mesh geometry={geo.platform} material={m.platform} position={d} castShadow receiveShadow />
      <mesh geometry={geo.plinth} material={m.plinth} position={[d.x, LAYOUT.platformHeight, d.z]} castShadow receiveShadow />
      <BlobShadow position={[d.x, 0.004, d.z]} scale={[2.6, 2.6]} opacity={0.75} />
      <BlobShadow position={[d.x, top + 0.003, d.z]} scale={[0.8, 0.42]} opacity={0.9} />
      <Handbag />
      <CollectionRail />
      <FoldedStacks />
    </group>
  );
}
