import * as THREE from 'three';

/**
 * Layered pink palette. Ivory stays the ground; pinks step from petal (lightest) through
 * blush and rose to raspberry, with coral as the warm accent and lime used sparingly.
 */
export const PALETTE = {
  ivory: '#FFF9F4',
  petal: '#FDEAEC',
  blush: '#F7CED8',
  rose: '#EE9AB0',
  raspberry: '#D6517D',
  peach: '#FFD3C4',
  coral: '#FF786B',
  lime: '#C7EF8B',
  charcoal: '#242124',
  /** gallery air: fog + clear colour */
  air: '#FCE7E6',
};

/** Shared, created once. Everything is lit by a procedural RoomEnvironment (no HDR download). */
export const MAT = {
  // light petal arcades against deeper rose voids: value contrast, not just hue
  floor: new THREE.MeshStandardMaterial({ color: '#FDF0EE', roughness: 0.5, metalness: 0 }),
  wall: new THREE.MeshStandardMaterial({ color: '#FFF1EF', roughness: 0.95, metalness: 0 }),
  wallRose: new THREE.MeshStandardMaterial({ color: '#F3B7C6', roughness: 0.95, metalness: 0 }),
  wallShade: new THREE.MeshStandardMaterial({ color: '#F1BACA', roughness: 1, metalness: 0 }),
  backWall: new THREE.MeshStandardMaterial({ color: '#FFD9CC', roughness: 1, metalness: 0 }),
  runway: new THREE.MeshStandardMaterial({ color: '#EE95AE', roughness: 0.38, metalness: 0 }),
  pedestal: new THREE.MeshStandardMaterial({ color: '#F4C0CD', roughness: 0.55, metalness: 0 }),
  plinth: new THREE.MeshStandardMaterial({ color: '#D9547F', roughness: 0.35, metalness: 0 }),
  chrome: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.07, metalness: 1 }),
  roseGold: new THREE.MeshStandardMaterial({ color: '#F2B7A3', roughness: 0.18, metalness: 1 }),
  pearl: new THREE.MeshPhysicalMaterial({ color: '#FFF6F4', roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, sheen: 1, sheenColor: new THREE.Color('#F7B6C8') }),
  pearlRaspberry: new THREE.MeshPhysicalMaterial({ color: '#D6517D', roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 }),
  pearlLime: new THREE.MeshPhysicalMaterial({ color: '#C7EF8B', roughness: 0.25, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1 }),
};

let _blob: THREE.Texture | null = null;
/** Soft radial contact-shadow texture (replaces real-time shadow maps). Rose-tinted, never grey. */
export function blobShadowTexture() {
  if (_blob) return _blob;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(120,30,60,0.42)');
  grad.addColorStop(0.45, 'rgba(120,30,60,0.17)');
  grad.addColorStop(1, 'rgba(120,30,60,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  _blob = new THREE.CanvasTexture(c);
  _blob.colorSpace = THREE.SRGBColorSpace;
  return _blob;
}

let _beam: THREE.Texture | null = null;
/** Diagonal soft light-shaft gradient for the "sunlit gallery" feel. */
export function beamTexture() {
  if (_beam) return _beam;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(255,240,236,0.0)');
  grad.addColorStop(0.3, 'rgba(255,240,236,0.9)');
  grad.addColorStop(1, 'rgba(255,240,236,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 256);
  const side = g.createLinearGradient(0, 0, 64, 0);
  side.addColorStop(0, 'rgba(0,0,0,1)');
  side.addColorStop(0.5, 'rgba(0,0,0,0)');
  side.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = side;
  g.fillRect(0, 0, 64, 256);
  _beam = new THREE.CanvasTexture(c);
  _beam.colorSpace = THREE.SRGBColorSpace;
  return _beam;
}

let _sun: THREE.Texture | null = null;
/** Coral-to-peach sun disc with a soft rim glow. */
export function sunTexture() {
  if (_sun) return _sun;
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const glow = g.createRadialGradient(256, 256, 150, 256, 256, 256);
  glow.addColorStop(0, 'rgba(255,140,120,0.35)');
  glow.addColorStop(1, 'rgba(255,140,120,0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, 512, 512);
  const disc = g.createLinearGradient(256, 70, 256, 442);
  disc.addColorStop(0, '#FFB39E');
  disc.addColorStop(0.55, '#FF8A78');
  disc.addColorStop(1, '#FF6F7E');
  g.fillStyle = disc;
  g.beginPath();
  g.arc(256, 256, 185, 0, Math.PI * 2);
  g.fill();
  _sun = new THREE.CanvasTexture(c);
  _sun.colorSpace = THREE.SRGBColorSpace;
  return _sun;
}
