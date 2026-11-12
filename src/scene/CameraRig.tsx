import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraPose, cameraRoll, easeOut, parallaxWeight } from '../motion/choreography';
import { store } from '../motion/store';

/**
 * Must be mounted FIRST inside the canvas so its useFrame runs before panels read the camera.
 * Camera = f(progress) + restrained pointer parallax + a one-shot entrance settle.
 */
export function CameraRig() {
  const { camera } = useThree();
  const v = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }), []);

  useFrame(() => {
    const p = store.p;
    cameraPose(p, v.pos, v.look);

    // entrance: a gentle 0.6 m settle toward the first frame (time-based, finishes in ~1.6 s)
    const intro = 1 - easeOut(store.intro);
    v.pos.z += intro * 0.6;
    v.pos.y += intro * 0.12;

    if (store.parallaxEnabled) {
      const w = parallaxWeight(p);
      v.pos.x += store.pointerSmooth.x * 0.16 * w;
      v.pos.y += -store.pointerSmooth.y * 0.07 * w;
      v.look.x += store.pointerSmooth.x * 0.05 * w;
    }

    camera.position.copy(v.pos);
    camera.lookAt(v.look);
    camera.rotateZ(cameraRoll(p));
    camera.updateMatrixWorld();
  });

  return null;
}
