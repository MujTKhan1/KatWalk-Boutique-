import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { store, resetStore } from './store';

gsap.registerPlugin(ScrollTrigger);

/** Scroll damping: higher = snappier. Pure exponential smoothing, so it never overshoots. */
const SCROLL_DAMPING = 5.5;
const POINTER_DAMPING = 2.6;

type Options = {
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLElement | null>;
  /** builds a PAUSED timeline of duration 1 whose progress mirrors store.p */
  buildTimeline: (stage: HTMLElement) => gsap.core.Timeline;
  parallax: boolean;
};

/**
 * Wires native scroll -> ScrollTrigger -> damped progress -> (HTML timeline + WebGL scene).
 * No scroll hijacking: the section is pinned with CSS `position: sticky`; ScrollTrigger only
 * reports progress. Everything is torn down on unmount (mode switches, HMR).
 */
export function useSequenceDriver({ sectionRef, stageRef, buildTimeline, parallax }: Options) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    resetStore();
    store.parallaxEnabled = parallax;

    const ctx = gsap.context(() => {
      const tl = buildTimeline(stage);
      tl.pause();

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          store.target = self.progress;
        },
        onRefresh: (self) => {
          store.target = self.progress;
        },
      });

      // Resize while inside the sequence: the section height is vh-based, so keep the
      // same *progress* rather than the same pixel offset.
      let keepProgress: number | null = null;
      const onRefreshInit = () => {
        keepProgress = st.isActive ? st.progress : null;
      };
      const onRefreshed = () => {
        if (keepProgress === null) return;
        const y = st.start + keepProgress * (st.end - st.start);
        keepProgress = null;
        window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
        store.target = st.progress;
      };
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.addEventListener('refresh', onRefreshed);

      // Refresh / restore mid-sequence: jump straight to the current state, no fly-through.
      store.target = st.progress;
      store.p = st.progress;
      store.initialised = true;
      tl.progress(store.p);

      // The entrance only plays when the page opens at the very start of the sequence.
      if (st.progress > 0.005) {
        stage.classList.add('no-intro');
        store.intro = 1;
      } else {
        gsap.to(store, { intro: 1, duration: 1.6, ease: 'power2.out', delay: 0.1 });
      }

      const tick = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs / 1000, 0.1);
        let changed = false;

        const d = store.target - store.p;
        if (Math.abs(d) > 0.00002) {
          store.p += d * (1 - Math.exp(-dt * SCROLL_DAMPING));
          changed = true;
        } else if (d !== 0) {
          store.p = store.target;
          changed = true;
        }
        if (changed) tl.progress(store.p);

        if (store.parallaxEnabled) {
          const kp = 1 - Math.exp(-dt * POINTER_DAMPING);
          const dx = store.pointer.x - store.pointerSmooth.x;
          const dy = store.pointer.y - store.pointerSmooth.y;
          if (Math.abs(dx) + Math.abs(dy) > 0.0005) {
            store.pointerSmooth.x += dx * kp;
            store.pointerSmooth.y += dy * kp;
            changed = true;
          }
        }

        if ((changed || store.intro < 1) && store.visible) store.invalidate();
      };
      gsap.ticker.add(tick);

      store.snap = () => {
        ScrollTrigger.update();
        store.target = st.progress;
        store.p = st.progress;
        tl.progress(store.p);
        store.invalidate();
      };

      if (import.meta.env.DEV) {
        // verification helper: snap the damped value to the scroll target (used when the
        // preview browser throttles rAF); has no effect on normal behaviour
        (window as unknown as { __katwalkSettle: () => number }).__katwalkSettle = () => {
          store.p = store.target;
          tl.progress(store.p);
          store.invalidate();
          return store.p;
        };
      }
      return () => {
        gsap.ticker.remove(tick);
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
        ScrollTrigger.removeEventListener('refresh', onRefreshed);
        store.snap = () => {};
      };
    }, stage);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (parallax) window.addEventListener('pointermove', onPointer, { passive: true });

    // Pause WebGL rendering entirely while the pinned stage is offscreen.
    const io = new IntersectionObserver(
      ([entry]) => {
        store.visible = entry.isIntersecting;
        if (store.visible) store.invalidate();
      },
      { rootMargin: '0px' },
    );
    io.observe(stage);

    if (import.meta.env.DEV) (window as unknown as { __katwalk: typeof store }).__katwalk = store;

    return () => {
      window.removeEventListener('pointermove', onPointer);
      io.disconnect();
      ctx.revert();
    };
    // buildTimeline is a stable module-level function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parallax]);
}
