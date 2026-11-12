import * as THREE from 'three';

/**
 * Restrained boutique palette: warm ivory plaster dominates, blush only on display
 * platforms and the runway, chrome as fine trim, deep rose leather as the one rich accent.
 */
export const PALETTE = {
  ivory: '#FFF9F4',
  plaster: '#F2E9DF',
  blush: '#EFC9CF',
  rose: '#A8344F',
  coral: '#FF786B',
  lime: '#C7EF8B',
  charcoal: '#242124',
  /** daylight air: clear colour + fog */
  air: '#F5EEE6',
};

/* ------------------------------------------------------------------ procedural plaster */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

let _plaster: THREE.CanvasTexture | null = null;
/**
 * Tileable mottled-plaster texture (soft trowel clouds + fine grain), generated once.
 * Used as both colour modulation and bump, so daylight rakes across a believable surface.
 */
export function plasterTexture() {
  if (_plaster) return _plaster;
  const N = 512;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f7f7f7';
  g.fillRect(0, 0, N, N);
  const rand = seeded(7);
  // trowel clouds, drawn wrapped so the tile is seamless
  for (let i = 0; i < 220; i++) {
    const x = rand() * N;
    const y = rand() * N;
    const r = 30 + rand() * 120;
    const light = rand() > 0.45;
    const a = 0.006 + rand() * 0.014;
    for (const dx of [-N, 0, N]) {
      for (const dy of [-N, 0, N]) {
        const grad = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
        grad.addColorStop(0, light ? `rgba(255,255,255,${a})` : `rgba(150,140,130,${a})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
      }
    }
  }
  // fine grain
  const img = g.getImageData(0, 0, N, N);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 6;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  _plaster = new THREE.CanvasTexture(c);
  _plaster.wrapS = _plaster.wrapT = THREE.RepeatWrapping;
  _plaster.colorSpace = THREE.SRGBColorSpace;
  // geometry UVs are in metres: one tile per 2.5 m
  _plaster.repeat.set(0.4, 0.4);
  _plaster.anisotropy = 4;
  return _plaster;
}

function plaster(color: string, roughness = 0.94) {
  const t = plasterTexture();
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, map: t, bumpMap: t, bumpScale: 0.35 });
}

let _mats: ReturnType<typeof createMaterials> | null = null;
function createMaterials() {
  const floorTex = plasterTexture().clone();
  floorTex.needsUpdate = true;
  floorTex.repeat.set(0.25, 0.25);
  return {
    facade: plaster('#F7F0E7'),
    wall: plaster('#F5ECE2'),
    wallBack: plaster('#F1E6DB'),
    floor: new THREE.MeshStandardMaterial({ color: '#EDE4D9', roughness: 0.38, metalness: 0, map: floorTex }),
    runway: new THREE.MeshStandardMaterial({ color: '#E8C8C8', roughness: 0.6, metalness: 0 }),
    platform: new THREE.MeshStandardMaterial({ color: '#EFCAD0', roughness: 0.5, metalness: 0 }),
    plinth: new THREE.MeshStandardMaterial({ color: '#F8F0EA', roughness: 0.72, metalness: 0 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#F4F4F4', roughness: 0.12, metalness: 1 }),
    nickel: new THREE.MeshStandardMaterial({ color: '#D9D6D2', roughness: 0.32, metalness: 1 }),
    gold: new THREE.MeshStandardMaterial({ color: '#D8B26A', roughness: 0.25, metalness: 1 }),
    leather: new THREE.MeshPhysicalMaterial({
      color: '#A8344F',
      roughness: 0.42,
      metalness: 0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
      sheen: 0.4,
      sheenColor: new THREE.Color('#F2A9B9'),
    }),
    leatherEdge: new THREE.MeshStandardMaterial({ color: '#7E2038', roughness: 0.5 }),
    mat: new THREE.MeshStandardMaterial({ color: '#FBF7F2', roughness: 0.9 }),
  };
}
/** Shared materials, created lazily (they need `document` for the plaster texture). */
export function mats() {
  if (!_mats) _mats = createMaterials();
  return _mats;
}

/** Fabric colours for the collection rail and folded stacks. */
export const FABRICS = ['#F3E7DA', '#E9BFC6', '#2B2729', '#5F7491', '#C9A27E', '#F7F2EA', '#B9566F'];
export function fabric(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, side: THREE.DoubleSide });
}

let _blob: THREE.Texture | null = null;
/** Soft radial contact shadow; layered under objects in addition to real shadow maps. */
export function blobShadowTexture() {
  if (_blob) return _blob;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(70,50,45,0.5)');
  grad.addColorStop(0.45, 'rgba(70,50,45,0.2)');
  grad.addColorStop(1, 'rgba(70,50,45,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  _blob = new THREE.CanvasTexture(c);
  _blob.colorSpace = THREE.SRGBColorSpace;
  return _blob;
}
