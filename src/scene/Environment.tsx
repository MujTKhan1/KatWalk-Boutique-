import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mats, blobShadowTexture } from './materials';
import { makeArchTrimGeometry, makeFacadeGeometry, makeRunwayGeometry, makeSlab } from './geometry';
import { LAYOUT } from '../motion/choreography';

/**
 * Directional daylight with soft real-time shadows (one shadow-casting light only),
 * a warm sky/ground fill, and procedural reflections for chrome. No HDR download.
 */
export function Lighting() {
  const { gl, scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.32;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    const l = sun.current;
    if (!l) return;
    l.target.position.set(2, 0, -4.5);
    l.target.updateMatrixWorld();
    const cam = l.shadow.camera as THREE.OrthographicCamera;
    cam.left = -13;
    cam.right = 13;
    cam.top = 13;
    cam.bottom = -13;
    cam.near = 1;
    cam.far = 48;
    cam.updateProjectionMatrix();
  }, []);

  return (
    <>
      <hemisphereLight args={['#FFF5EA', '#E6D8CC', 1.05]} />
      {/* late-morning sun from front-left: it rakes across the plaster and pours through the arch */}
      <directionalLight
        ref={sun}
        position={[-11, 11, 6]}
        intensity={2.9}
        color="#FFF0DC"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={5}
      />
      {/* soft interior bounce, no shadows */}
      <directionalLight position={[4, 9, -8]} intensity={0.55} color="#FFE6DE" />
    </>
  );
}

/** Warm ivory plaster boutique: facade with one entrance arch, interior room, curved runway. */
export function Architecture() {
  const { facadeDepth: fd, entranceX, entranceW, entranceH, room } = LAYOUT;
  const geo = useMemo(() => {
    const facadeLeft = -12;
    const facadeW = 26;
    return {
      facade: makeFacadeGeometry(facadeW, 7.6, entranceX - facadeLeft, entranceW, entranceH, fd),
      facadeLeft,
      // stone base band either side of the entrance
      baseL: makeSlab(entranceX - entranceW / 2 - facadeLeft, 0.34, 0.06),
      baseR: makeSlab(facadeLeft + facadeW - (entranceX + entranceW / 2), 0.34, 0.06),
      trim: makeArchTrimGeometry(entranceW - 0.04, entranceH - 0.02, 0.016),
      side: makeSlab(-room.back + 0.3, 7.6, 0.3),
      back: makeSlab(room.right - room.left + 0.6, 7.6, 0.3),
      runway: makeRunwayGeometry(),
      // shallow pilasters + lintel band framing the entrance: they catch the raking sun
      pilaster: makeSlab(0.46, 5.5, 0.12),
      lintel: makeSlab(entranceW + 2.6, 0.42, 0.14),
    };
  }, [entranceX, entranceW, entranceH, fd, room]);
  useEffect(
    () => () =>
      Object.values(geo).forEach((g) => {
        if (g instanceof THREE.BufferGeometry) g.dispose();
      }),
    [geo],
  );
  const m = mats();

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} material={m.floor} receiveShadow>
        <planeGeometry args={[90, 90]} />
      </mesh>
      <mesh geometry={geo.runway} material={m.runway} receiveShadow />

      {/* facade */}
      <mesh geometry={geo.facade} material={m.facade} position={[geo.facadeLeft, 0, -fd / 2]} castShadow receiveShadow />
      <mesh geometry={geo.baseL} material={m.wallBack} position={[geo.facadeLeft, 0, fd / 2]} receiveShadow />
      <mesh geometry={geo.baseR} material={m.wallBack} position={[entranceX + entranceW / 2, 0, fd / 2]} receiveShadow />
      {/* one strong entrance arch, lined with a fine chrome trim */}
      <mesh geometry={geo.trim} material={m.chrome} position={[entranceX, 0, fd / 2 + 0.012]} />
      <mesh geometry={geo.pilaster} material={m.facade} position={[entranceX - entranceW / 2 - 0.86, 0, fd / 2]} castShadow receiveShadow />
      <mesh geometry={geo.pilaster} material={m.facade} position={[entranceX + entranceW / 2 + 0.4, 0, fd / 2]} castShadow receiveShadow />
      <mesh geometry={geo.lintel} material={m.facade} position={[entranceX - entranceW / 2 - 1.3, 5.5, fd / 2]} castShadow receiveShadow />

      {/* interior */}
      <mesh geometry={geo.side} material={m.wall} position={[room.left - 0.3, 0, -fd / 2]} rotation-y={Math.PI / 2} castShadow receiveShadow />
      <mesh geometry={geo.side} material={m.wall} position={[room.right + 0.3, 0, room.back - 0.3]} rotation-y={-Math.PI / 2} castShadow receiveShadow />
      <mesh geometry={geo.back} material={m.wallBack} position={[room.left - 0.3, 0, room.back - 0.3]} receiveShadow />
    </group>
  );
}

export function BlobShadow({ position, scale, opacity = 1 }: { position: [number, number, number]; scale: [number, number]; opacity?: number }) {
  return (
    <mesh position={position} rotation-x={-Math.PI / 2} scale={[scale[0], scale[1], 1]} renderOrder={1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={blobShadowTexture()} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
