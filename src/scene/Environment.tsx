import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MAT, beamTexture, blobShadowTexture, sunTexture } from './materials';
import { makeArcadeGeometry, makePortalGeometry, makeRunwayGeometry } from './geometry';
import { sunState } from '../motion/choreography';
import { store } from '../motion/store';

/** Coral sun disc framed by the far portal; a pure function of scroll progress. */
function Sun() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const s = sunState(store.p);
    m.position.y = s.y;
    m.scale.setScalar(5.2 * s.scale);
  });
  return (
    <mesh ref={mesh} position={[0.4, 3.4, -17.8]} renderOrder={0}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={sunTexture()} transparent depthWrite={false} toneMapped={false} fog={false} />
    </mesh>
  );
}

/** Procedural reflections for chrome + soft ambient, no HDR download. */
export function Lighting() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.5;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return (
    <>
      {/* lower ambient + stronger warm key from front-left = real form on pedestal and runway */}
      <hemisphereLight args={['#FFF3EE', '#E9A5B8', 0.78]} />
      <directionalLight position={[-9, 6, 2.5]} intensity={2.0} color="#FFF0E4" />
      <directionalLight position={[7, 3, -5]} intensity={0.45} color="#FFC9D6" />
    </>
  );
}

function Beam({ position, rotation, scale }: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} renderOrder={2}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={beamTexture()} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}

/** Ivory gallery: floor, curved blush runway, side arcades, portal and back wall. */
export function Gallery() {
  const geo = useMemo(
    () => ({
      runway: makeRunwayGeometry(),
      arcadeL: makeArcadeGeometry(26, 7.5, 2.3, 4.6, 3.3),
      arcadeR: makeArcadeGeometry(26, 7.5, 2.3, 4.6, 3.3),
      portal: makePortalGeometry(22, 8, 11.2, 3.8, 5.6),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} material={MAT.floor}>
        <planeGeometry args={[80, 80]} />
      </mesh>

      {/* runway */}
      <mesh geometry={geo.runway} material={MAT.runway} />

      {/* left arcade: wall runs along -z; shape x -> world -z */}
      <mesh geometry={geo.arcadeL} material={MAT.wall} position={[-4.6, 0, 9]} rotation-y={Math.PI / 2} />
      <mesh material={MAT.wallShade} position={[-7.2, 3.75, -4]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[26, 7.5]} />
      </mesh>

      {/* right arcade */}
      <mesh geometry={geo.arcadeR} material={MAT.wall} position={[6.9, 0, -17]} rotation-y={-Math.PI / 2} />
      <mesh material={MAT.wallShade} position={[9.6, 3.75, -4]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[26, 7.5]} />
      </mesh>

      {/* portal across the path, opening centred on the far runway */}
      <mesh geometry={geo.portal} material={MAT.wallRose} position={[-11.2 + 0.4, 0, -12.2]} />
      {/* back wall, peach, with the coral sun in front of it */}
      <mesh material={MAT.backWall} position={[0, 4, -18]}>
        <planeGeometry args={[30, 8]} />
      </mesh>
      <Sun />

      {/* sunlight shafts */}
      <Beam position={[-2.4, 2.6, -2.5]} rotation={[0, 0.5, -0.55]} scale={[1.6, 7, 1]} />
      <Beam position={[4.6, 2.8, -5.5]} rotation={[0, -0.6, -0.5]} scale={[1.3, 6.5, 1]} />
      <Beam position={[-1.0, 3.0, -10]} rotation={[0, 0.2, -0.45]} scale={[1.8, 7, 1]} />
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
