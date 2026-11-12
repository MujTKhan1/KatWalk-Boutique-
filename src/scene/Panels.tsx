import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LOOKBOOK, PANEL_ASPECT } from '../content/lookbook';
import { PANEL_WALL, galleryLight, glPanelsVisible, panelResolve, veilOpacity } from '../motion/choreography';
import { store } from '../motion/store';
import { PALETTE, mats } from './materials';

/** Distance in front of the camera at which prints lock to their HTML cards. */
const LOCK_DEPTH = 2.4;
const VEIL_DEPTH = 2.6;

/** Load a print texture without suspending; a flat blush fallback keeps the scene intact on failure. */
function usePrintTexture(src: string) {
  const { gl, invalidate } = useThree();
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let loaded: THREE.Texture | null = null;
    new THREE.TextureLoader().load(
      src,
      (t) => {
        if (!alive) return t.dispose();
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        loaded = t;
        setTex(t);
        invalidate();
      },
      undefined,
      () => {
        if (!alive) return;
        const c = document.createElement('canvas');
        c.width = 4;
        c.height = 5;
        const g = c.getContext('2d')!;
        g.fillStyle = PALETTE.blush;
        g.fillRect(0, 0, 4, 5);
        loaded = new THREE.CanvasTexture(c);
        loaded.colorSpace = THREE.SRGBColorSpace;
        setTex(loaded);
        invalidate();
        console.warn(`[katwalk] print image failed to load: ${src}`);
      },
    );
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [src, gl, invalidate]);
  return tex;
}

let _wash: THREE.Texture | null = null;
/** Soft cone of warm light from a picture lamp, as a texture (no extra real-time lights). */
function washTexture() {
  if (_wash) return _wash;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 0, 4, 64, 40, 230);
  grad.addColorStop(0, 'rgba(255,236,214,0.95)');
  grad.addColorStop(0.5, 'rgba(255,236,214,0.25)');
  grad.addColorStop(1, 'rgba(255,236,214,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 256);
  _wash = new THREE.CanvasTexture(c);
  _wash.colorSpace = THREE.SRGBColorSpace;
  return _wash;
}

/** Static wall frame: brushed-nickel moulding, ivory mat, picture lamp + light wash. */
function Frame({ index }: { index: number }) {
  const cfg = PANEL_WALL[index];
  const h = cfg.height;
  const w = h * PANEL_ASPECT;
  const wash = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (wash.current) (wash.current.material as THREE.MeshBasicMaterial).opacity = 0.32 * galleryLight(store.p);
  });
  const m = mats();
  return (
    <group position={[cfg.pos.x, cfg.pos.y, cfg.pos.z]}>
      <mesh position={[0, 0, -0.03]} material={m.nickel} castShadow>
        <boxGeometry args={[w + 0.16, h + 0.16, 0.05]} />
      </mesh>
      <mesh position={[0, 0, -0.002]} material={m.mat} receiveShadow>
        <boxGeometry args={[w + 0.1, h + 0.1, 0.03]} />
      </mesh>
      {/* picture lamp */}
      <mesh position={[0, h / 2 + 0.28, 0.14]} rotation-z={Math.PI / 2} material={m.nickel}>
        <cylinderGeometry args={[0.025, 0.025, Math.min(0.9, w * 0.6), 20]} />
      </mesh>
      <mesh position={[0, h / 2 + 0.2, 0.06]} material={m.nickel}>
        <boxGeometry args={[0.02, 0.16, 0.02]} />
      </mesh>
      <mesh ref={wash} position={[0, 0.25, 0.02]} renderOrder={2}>
        <planeGeometry args={[w + 0.9, h + 0.9]} />
        <meshBasicMaterial map={washTexture()} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

const _wallPos = new THREE.Vector3();
const _wallQuat = new THREE.Quaternion();
const _lockPos = new THREE.Vector3();

/** The print itself: hangs in its frame, then lifts out and flies onto its HTML card. */
function Print({ index }: { index: number }) {
  const edit = LOOKBOOK[index];
  const cfg = PANEL_WALL[index];
  const tex = usePrintTexture(edit.src);
  const mesh = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  useFrame(() => {
    const me = mesh.current;
    if (!me) return;
    const p = store.p;
    const cam = camera as THREE.PerspectiveCamera;
    const h = cfg.height;
    _wallPos.set(cfg.pos.x, cfg.pos.y, cfg.pos.z + 0.016);
    _wallQuat.identity();

    const t = panelResolve(index, p);
    let scale = h;
    if (t > 0) {
      const el = store.cardEls[index];
      const canvasRect = gl.domElement.getBoundingClientRect();
      if (el && canvasRect.width > 0) {
        const r = el.getBoundingClientRect();
        const halfH = LOCK_DEPTH * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
        const halfW = halfH * cam.aspect;
        const nx = ((r.left + r.width / 2 - canvasRect.left) / canvasRect.width) * 2 - 1;
        const ny = -(((r.top + r.height / 2 - canvasRect.top) / canvasRect.height) * 2 - 1);
        _lockPos.set(nx * halfW, ny * halfH, -LOCK_DEPTH);
        cam.localToWorld(_lockPos);
        const lockScale = (r.height / canvasRect.height) * 2 * halfH;
        me.position.lerpVectors(_wallPos, _lockPos, t);
        me.quaternion.slerpQuaternions(_wallQuat, cam.quaternion, t);
        scale = THREE.MathUtils.lerp(h, lockScale, t);
      }
    } else {
      me.position.copy(_wallPos);
      me.quaternion.copy(_wallQuat);
    }
    me.scale.setScalar(scale);
    me.visible = glPanelsVisible(p);
    const flying = t > 0.001;
    (me.material as THREE.MeshBasicMaterial).depthTest = !flying;
    me.renderOrder = flying ? 20 + index : 3;
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[PANEL_ASPECT, 1]} />
      {/* unlit + no tone mapping: renders pixel-identical to the HTML <img> at the handoff */}
      <meshBasicMaterial key={tex ? tex.uuid : 'none'} map={tex} color={tex ? '#ffffff' : PALETTE.blush} toneMapped={false} fog={false} transparent />
    </mesh>
  );
}

/** Ivory veil that settles in front of the room so the lookbook reads on a calm ground. */
function Veil() {
  const mesh = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const cam = camera as THREE.PerspectiveCamera;
    const o = veilOpacity(store.p);
    (m.material as THREE.MeshBasicMaterial).opacity = o;
    m.visible = o > 0.001;
    if (!m.visible) return;
    tmp.set(0, 0, -VEIL_DEPTH);
    cam.localToWorld(tmp);
    m.position.copy(tmp);
    m.quaternion.copy(cam.quaternion);
    const hh = VEIL_DEPTH * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * 2.4;
    m.scale.set(hh * cam.aspect, hh, 1);
  });
  return (
    <mesh ref={mesh} renderOrder={15}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={PALETTE.ivory} transparent depthTest={false} depthWrite={false} toneMapped={false} fog={false} />
    </mesh>
  );
}

export function Panels() {
  return (
    <>
      {LOOKBOOK.map((e, i) => (
        <group key={e.id}>
          <Frame index={i} />
          <Print index={i} />
        </group>
      ))}
      <Veil />
    </>
  );
}
