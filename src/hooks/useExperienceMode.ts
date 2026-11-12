import { useCallback, useEffect, useState } from 'react';

export type Mode = 'immersive' | 'static';
export type StaticReason = 'reduced-motion' | 'small-viewport' | 'no-webgl' | 'scene-error' | 'context-lost' | 'forced' | null;

const IMMERSIVE_MIN_WIDTH = 900;

function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function query() {
  const q = new URLSearchParams(window.location.search);
  return {
    forceStatic: q.get('mode') === 'static',
    forceImmersive: q.get('mode') === 'immersive',
    simulateNoWebGL: q.has('nowebgl'),
    capture: q.has('capture'),
  };
}

/**
 * Decides between the immersive WebGL sequence and the composed static hero.
 * Re-evaluates live on reduced-motion changes and viewport resizes.
 * Testing overrides: ?mode=static, ?mode=immersive, ?nowebgl
 */
export function useExperienceMode() {
  const [q] = useState(query);
  const [webgl] = useState(() => !q.simulateNoWebGL && detectWebGL());
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [wide, setWide] = useState(() => window.innerWidth >= IMMERSIVE_MIN_WIDTH);
  const [failure, setFailure] = useState<StaticReason>(null);
  const [finePointer] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener('change', onMq);
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWide(window.innerWidth >= IMMERSIVE_MIN_WIDTH));
    };
    window.addEventListener('resize', onResize);
    return () => {
      mq.removeEventListener('change', onMq);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const reportFailure = useCallback((r: string) => setFailure((r as StaticReason) ?? 'scene-error'), []);

  let reason: StaticReason = null;
  if (q.forceStatic) reason = 'forced';
  else if (!webgl) reason = 'no-webgl';
  else if (failure) reason = failure;
  else if (reduced) reason = 'reduced-motion';
  else if (!wide && !q.forceImmersive) reason = 'small-viewport';

  const mode: Mode = reason ? 'static' : 'immersive';
  return { mode, reason, reportFailure, parallax: finePointer && !reduced, capture: q.capture, reduced };
}
