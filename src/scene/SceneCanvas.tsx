import { Component, useEffect, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { store } from '../motion/store';
import { PALETTE } from './materials';
import { CameraRig } from './CameraRig';
import { Gallery, Lighting } from './Environment';
import { Display } from './Display';
import { Panels } from './Panels';

type Props = {
  onFailure: (reason: string) => void;
  onReady?: () => void;
  capture?: boolean;
};

/** Catches render-time failures inside the scene and drops to the static hero. */
class SceneBoundary extends Component<{ onFailure: (r: string) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('[katwalk] 3D scene failed, using static hero', error);
    this.props.onFailure('scene-error');
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Bridge({ onFailure, onReady, capture }: Props) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    store.invalidate = invalidate;
    invalidate();
    const lost = (e: Event) => {
      e.preventDefault();
      onFailure('context-lost');
    };
    gl.domElement.addEventListener('webglcontextlost', lost);
    // first frame is rendered on the next rAF; reveal the canvas after it
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    if (capture) {
      // dev helper: POST a still of the current frame to the Vite capture endpoint
      (window as unknown as { __katwalkCapture: (name?: string) => Promise<unknown> }).__katwalkCapture = (name = 'hero-still') =>
        new Promise((resolve) => {
          invalidate();
          requestAnimationFrame(() =>
            gl.domElement.toBlob(
              async (blob) => {
                if (!blob) return resolve('no-blob');
                const res = await fetch(`/__capture?name=${name}`, { method: 'POST', body: blob });
                resolve(await res.json());
              },
              'image/webp',
              0.86,
            ),
          );
        });
    }
    return () => {
      cancelAnimationFrame(id);
      gl.domElement.removeEventListener('webglcontextlost', lost);
      store.invalidate = () => {};
    };
  }, [gl, invalidate, onFailure, onReady, capture]);
  return null;
}

export default function SceneCanvas(props: Props) {
  return (
    <SceneBoundary onFailure={props.onFailure}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        camera={{ fov: 30, near: 0.1, far: 60, position: [0.15, 1.55, 7.4] }}
        gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!props.capture, alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.0;
          scene.background = new THREE.Color(PALETTE.air);
          scene.fog = new THREE.Fog(PALETTE.air, 11, 34);
        }}
      >
        <CameraRig />
        <Bridge {...props} />
        <Lighting />
        <Gallery />
        <Display />
        <Panels />
      </Canvas>
    </SceneBoundary>
  );
}
