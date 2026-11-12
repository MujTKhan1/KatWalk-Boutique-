import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LOOKBOOK, PANEL_ASPECT } from '../content/lookbook';
import { PANEL_RUNWAY, glPanelsVisible, panelResolve, panelRise, veilOpacity } from '../motion/choreography';
import { store } from '../motion/store';
import { PALETTE, blobShadowTexture } from './materials';

/** Distance in front of the camera at which panels lock to their HTML cards. */
const LOCK_DEPTH = 2.4;
const VEIL_DEPTH = 2.6;

/**
 * Load a panel texture without suspending. On failure a flat blush texture is used,
 * so a missing image never breaks the scene (the HTML card shows its alt text).
 */
function usePanelTexture(src: string) {
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
        console.warn(`[katwalk] panel image failed to load: ${src}`);
      },
    );
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [src, gl, invalidate]);
  return tex;
}

const _runPos = new THREE.Vector3();
const _runQuat = new THREE.Quaternion();
const _lockPos = new THREE.Vector3();
const _euler = new THREE.Euler();

function Panel({ index }: { index: number }) {
  const edit = LOOKBOOK[index];
  const cfg = PANEL_RUNWAY[index];
  const tex = usePanelTexture(edit.src);
  const group = useRef<THREE.Group>(null);
  const image = useRef<THREE.Mesh>(null);
  const mount = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = store.p;
    const cam = camera as THREE.PerspectiveCamera;

    // --- runway pose (rise from below the runway surface; the floor hides the sunk part)
    const rise = panelRise(index, p);
    const h = cfg.height;
    _runPos.set(cfg.pos.x, h / 2 + 0.06 - (1 - rise) * (h + 0.25), cfg.pos.z);
    _runQuat.setFromEuler(_euler.set(0, cfg.rotY, 0));

    // --- lock pose: unproject the HTML card rect onto a plane LOCK_DEPTH in front of the camera
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
        g.position.lerpVectors(_runPos, _lockPos, t);
        g.quaternion.slerpQuaternions(_runQuat, cam.quaternion, t);
        scale = THREE.MathUtils.lerp(h, lockScale, t);
      }
    } else {
      g.position.copy(_runPos);
      g.quaternion.copy(_runQuat);
    }
    g.scale.setScalar(scale);
    g.visible = glPanelsVisible(p);

    // On the way to the card the panel must not be clipped by gallery geometry,
    // and the paper mount + floor shadow fade out so the result is exactly the card.
    const flying = t > 0.001;
    const im = image.current!.material as THREE.MeshBasicMaterial;
    im.depthTest = !flying;
    image.current!.renderOrder = flying ? 20 + index : 3;
    const mm = mount.current!.material as THREE.MeshBasicMaterial;
    mm.opacity = 1 - Math.min(1, t * 2.5);
    mm.depthTest = !flying;
    mount.current!.renderOrder = flying ? 19 : 3;
    mount.current!.visible = mm.opacity > 0.001;
    const sm = shadow.current!.material as THREE.MeshBasicMaterial;
    sm.opacity = 0.75 * rise * (1 - t);
    shadow.current!.position.set(cfg.pos.x, 0.008, cfg.pos.z + 0.15);
  });

  const w = PANEL_ASPECT;
  return (
    <>
      <group ref={group}>
        {/* thin ivory paper mount behind the print */}
        <mesh ref={mount} position={[0, 0, -0.004]}>
          <planeGeometry args={[w * 1.06, 1.045]} />
          <meshBasicMaterial color="#FFFDFB" transparent toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={image}>
          <planeGeometry args={[w, 1]} />
          {/* unlit + no tone mapping: renders the image pixel-identical to the HTML <img> */}
          {/* keyed so the shader recompiles when the map arrives */}
          <meshBasicMaterial key={tex ? tex.uuid : 'none'} map={tex} color={tex ? '#ffffff' : PALETTE.blush} toneMapped={false} fog={false} transparent />
        </mesh>
      </group>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} scale={[1.9, 0.7, 1]} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={blobShadowTexture()} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

/** Ivory veil that settles in front of the gallery so the lookbook reads on a calm ground. */
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
        <Panel key={e.id} index={i} />
      ))}
      <Veil />
    </>
  );
}
