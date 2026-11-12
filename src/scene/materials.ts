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

/* ------------------------------------------------------------------ stone floor */
let _stone: THREE.CanvasTexture | null = null;
/**
 * Large-format honed stone: 2 x 2 tiles per texture tile, each with its own faint tone and
 * veining, separated by fine joints. Tile = 1.2 m.
 */
export function stoneTexture() {
  if (_stone) return _stone;
  const N = 512;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d')!;
  const rand = seeded(23);
  const half = N / 2;
  const tones = ['#e4e2de', '#dedcd8', '#e1dfdb', '#dbd9d5'];
  for (let ty = 0; ty < 2; ty++) {
    for (let tx = 0; tx < 2; tx++) {
      g.fillStyle = tones[ty * 2 + tx];
      g.fillRect(tx * half, ty * half, half, half);
      // soft clouds + a few faint veins
      for (let i = 0; i < 40; i++) {
        const x = tx * half + rand() * half;
        const y = ty * half + rand() * half;
        const r = 10 + rand() * 60;
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${rand() > 0.5 ? '255,255,255' : '150,148,145'},${0.04 + rand() * 0.05})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      g.strokeStyle = 'rgba(160,156,150,0.12)';
      g.lineWidth = 0.8;
      for (let v = 0; v < 3; v++) {
        g.beginPath();
        let x = tx * half + rand() * half;
        let y = ty * half;
        g.moveTo(x, y);
        while (y < (ty + 1) * half) {
          x += (rand() - 0.5) * 18;
          y += 8 + rand() * 14;
          g.lineTo(x, y);
        }
        g.stroke();
      }
    }
  }
  // joints
  g.fillStyle = 'rgba(120,116,110,0.55)';
  g.fillRect(0, 0, N, 2);
  g.fillRect(0, half - 1, N, 2);
  g.fillRect(0, 0, 2, N);
  g.fillRect(half - 1, 0, 2, N);
  _stone = new THREE.CanvasTexture(c);
  _stone.wrapS = _stone.wrapT = THREE.RepeatWrapping;
  _stone.colorSpace = THREE.SRGBColorSpace;
  _stone.anisotropy = 8;
  return _stone;
}

/* ------------------------------------------------------------------ leather grain */
let _grain: THREE.CanvasTexture | null = null;
/** Fine pebbled leather grain used as bump + roughness variation (UVs in metres). */
export function leatherGrain() {
  if (_grain) return _grain;
  const N = 256;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d')!;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, N, N);
  const rand = seeded(91);
  for (let i = 0; i < 2600; i++) {
    const x = rand() * N;
    const y = rand() * N;
    const r = 1.2 + rand() * 2.6;
    const light = rand() > 0.5;
    for (const dx of [-N, 0, N]) {
      for (const dy of [-N, 0, N]) {
        g.fillStyle = light ? `rgba(255,255,255,${0.12 + rand() * 0.12})` : `rgba(0,0,0,${0.12 + rand() * 0.14})`;
        g.beginPath();
        g.ellipse(x + dx, y + dy, r, r * (0.7 + rand() * 0.5), rand() * Math.PI, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  _grain = new THREE.CanvasTexture(c);
  _grain.wrapS = _grain.wrapT = THREE.RepeatWrapping;
  // one tile per 7 cm of leather
  _grain.repeat.set(14, 14);
  return _grain;
}

let _fabricTex: THREE.CanvasTexture | null = null;
/** Soft woven/knit texture for garments (bump only). */
export function fabricTexture() {
  if (_fabricTex) return _fabricTex;
  const N = 128;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d')!;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, N, N);
  for (let y = 0; y < N; y += 4) {
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.fillRect(0, y, N, 2);
  }
  for (let x = 0; x < N; x += 4) {
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(x, 0, 2, N);
  }
  _fabricTex = new THREE.CanvasTexture(c);
  _fabricTex.wrapS = _fabricTex.wrapT = THREE.RepeatWrapping;
  _fabricTex.repeat.set(9, 9);
  return _fabricTex;
}

let _mats: ReturnType<typeof createMaterials> | null = null;
function createMaterials() {
  const floorTex = stoneTexture();
  // floor plane is 90 m with 0..1 UVs; texture tile = 2 stones of 1.2 m
  floorTex.repeat.set(90 / 2.4, 90 / 2.4);
  const grain = leatherGrain();
  return {
    facade: plaster('#F5EDE3'),
    /** deeper tone for the arch reveal and wall returns */
    reveal: plaster('#E2D3C4', 0.96),
    wall: plaster('#EEE3D7'),
    wallBack: plaster('#EAE0D4'),
    /** arched niches behind the prints */
    recess: plaster('#DCCDBD', 0.97),
    floor: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.32, metalness: 0, map: floorTex, envMapIntensity: 0.6 }),
    runway: new THREE.MeshStandardMaterial({ color: '#E4C4C5', roughness: 0.62, metalness: 0 }),
    platform: new THREE.MeshStandardMaterial({ color: '#E9C9CE', roughness: 0.5, metalness: 0 }),
    plinth: new THREE.MeshStandardMaterial({ color: '#F3EBE4', roughness: 0.72, metalness: 0 }),
    table: plaster('#E8DED3', 0.85),
    chrome: new THREE.MeshStandardMaterial({ color: '#F4F4F4', roughness: 0.12, metalness: 1 }),
    nickel: new THREE.MeshStandardMaterial({ color: '#D9D6D2', roughness: 0.32, metalness: 1 }),
    mirror: new THREE.MeshStandardMaterial({ color: '#E8ECEE', roughness: 0.03, metalness: 1 }),
    /** polished brass hardware: warm, slightly uneven reflection */
    gold: new THREE.MeshPhysicalMaterial({ color: '#D9B878', roughness: 0.2, metalness: 1, clearcoat: 0.4, clearcoatRoughness: 0.15 }),
    /** muted rose pebbled leather */
    leather: new THREE.MeshPhysicalMaterial({
      color: '#97465A',
      roughness: 0.55,
      roughnessMap: grain,
      bumpMap: grain,
      bumpScale: 0.6,
      metalness: 0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.45,
      sheen: 0.35,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color('#E8B7C2'),
    }),
    /** painted edges and piping, a touch darker */
    leatherEdge: new THREE.MeshStandardMaterial({ color: '#6E2A39', roughness: 0.45 }),
    stitch: new THREE.MeshStandardMaterial({ color: '#E9D9C6', roughness: 0.8 }),
    mat: new THREE.MeshStandardMaterial({ color: '#FBF7F2', roughness: 0.9 }),
  };
}
/** Shared materials, created lazily (they need `document` for the plaster texture). */
export function mats() {
  if (!_mats) _mats = createMaterials();
  return _mats;
}

/** Fabric colours for the collection rail and folded stacks. */
export const FABRICS = ['#EFE4D6', '#E4BCC3', '#2B2729', '#4F6585', '#B98E66', '#F7F2EA', '#A8434F', '#8A8F7A'];
export function fabric(color: string) {
  const t = fabricTexture();
  return new THREE.MeshStandardMaterial({ color, roughness: 0.94, metalness: 0, side: THREE.DoubleSide, bumpMap: t, bumpScale: 0.5 });
}

let _blob: THREE.Texture | null = null;
/** Soft radial contact shadow; layered under objects in addition to real shadow maps. */
export function blobShadowTexture() {
  if (_blob) return _blob;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(55,42,38,0.62)');
  grad.addColorStop(0.45, 'rgba(55,42,38,0.26)');
  grad.addColorStop(1, 'rgba(70,50,45,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  _blob = new THREE.CanvasTexture(c);
  _blob.colorSpace = THREE.SRGBColorSpace;
  return _blob;
}
