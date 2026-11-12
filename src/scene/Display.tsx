import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LAYOUT, PEARLS, handbagLift, pearlOffset } from '../motion/choreography';
import { store } from '../motion/store';
import { MAT } from './materials';
import { makeArchGeometry, makePedestalGeometry } from './geometry';
import { BlobShadow } from './Environment';

export const BAG_SRC = '/media/hero-bag.svg';
/** world height of the bag artwork plane (square) */
const BAG_SIZE = 1.12;

/**
 * The hero accessory is a crisp static illustration (public/media/hero-bag.svg), shown on a
 * camera-facing plane. It reads as a defined product shot from every angle on the camera rail,
 * with no geometric approximation of a real bag.
 */
function BagIllustration() {
  const { gl, camera, invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    let t: THREE.Texture | null = null;
    new THREE.TextureLoader().load(
      BAG_SRC,
      (loaded) => {
        if (!alive) return loaded.dispose();
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        t = loaded;
        setTex(loaded);
        invalidate();
      },
      undefined,
      () => console.warn('[katwalk] hero accessory image failed to load'),
    );
    return () => {
      alive = false;
      t?.dispose();
    };
  }, [gl, invalidate]);

  const base = LAYOUT.pedestal;
  const topY = LAYOUT.pedestalHeight + LAYOUT.plinthHeight;

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    // upright billboard: turn around Y only to face the camera
    g.rotation.y = Math.atan2(camera.position.x - base.x, camera.position.z - base.z);
    g.position.y = topY + handbagLift(store.p);
  });

  if (!tex) return null;
  return (
    <group ref={group} position={[base.x, topY, base.z]}>
      <mesh position={[0, BAG_SIZE / 2, 0]} renderOrder={4}>
        <planeGeometry args={[BAG_SIZE, BAG_SIZE]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} />
      </mesh>
    </group>
  );
}

const PEARL_MAT = {
  pearl: MAT.pearl,
  raspberry: MAT.pearlRaspberry,
  lime: MAT.pearlLime,
  chrome: MAT.chrome,
} as const;

/** Glossy floating pearls: depth cues that parallax naturally as the camera travels. */
function Pearls() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 40, 28), []);
  useEffect(() => () => sphere.dispose(), [sphere]);
  useFrame(() => {
    PEARLS.forEach((cfg, i) => {
      const m = refs.current[i];
      if (m) m.position.y = cfg.pos.y + pearlOffset(cfg.drift, store.p);
    });
  });
  return (
    <>
      {PEARLS.map((cfg, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          geometry={sphere}
          material={PEARL_MAT[cfg.mat]}
          position={cfg.pos}
          scale={cfg.r}
        />
      ))}
    </>
  );
}

/** Two-tone pedestal + illustrated handbag + delicate chrome arch. */
export function Display() {
  const geo = useMemo(
    () => ({
      plinth: makePedestalGeometry(LAYOUT.pedestalRadius + 0.2, LAYOUT.plinthHeight),
      pedestal: makePedestalGeometry(LAYOUT.pedestalRadius, LAYOUT.pedestalHeight),
      arch: makeArchGeometry(LAYOUT.archInnerWidth, LAYOUT.archLegHeight, 0.03),
      archInner: makeArchGeometry(LAYOUT.archInnerWidth - 0.22, LAYOUT.archLegHeight, 0.012),
      foot: new THREE.CylinderGeometry(0.075, 0.085, 0.025, 32),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const { pedestal, arch } = { pedestal: LAYOUT.pedestal, arch: LAYOUT.arch };
  const r = LAYOUT.archInnerWidth / 2;

  return (
    <group>
      {/* raspberry plinth + blush pedestal */}
      <mesh geometry={geo.plinth} material={MAT.plinth} position={pedestal} />
      <mesh geometry={geo.pedestal} material={MAT.pedestal} position={[pedestal.x, LAYOUT.plinthHeight, pedestal.z]} />
      <BlobShadow position={[pedestal.x, 0.004, pedestal.z]} scale={[2.3, 2.3]} />
      {/* layered contact shadow: soft spread + tight core so the bag sits, not floats */}
      <BlobShadow position={[pedestal.x, LAYOUT.pedestalHeight + LAYOUT.plinthHeight + 0.003, pedestal.z]} scale={[1.0, 0.5]} opacity={0.9} />
      <BlobShadow position={[pedestal.x, LAYOUT.pedestalHeight + LAYOUT.plinthHeight + 0.004, pedestal.z + 0.02]} scale={[0.7, 0.22]} opacity={1} />

      <BagIllustration />
      <Pearls />

      {/* chrome arch with a fine inner rose-gold line */}
      <group position={arch}>
        <mesh geometry={geo.arch} material={MAT.chrome} />
        <mesh geometry={geo.archInner} material={MAT.roseGold} position={[0, 0, 0.02]} />
        <mesh geometry={geo.foot} material={MAT.chrome} position={[-r, 0.012, 0]} />
        <mesh geometry={geo.foot} material={MAT.chrome} position={[r, 0.012, 0]} />
      </group>
      <BlobShadow position={[arch.x - r, 0.006, arch.z]} scale={[0.45, 0.45]} />
      <BlobShadow position={[arch.x + r, 0.006, arch.z]} scale={[0.45, 0.45]} />
    </group>
  );
}
