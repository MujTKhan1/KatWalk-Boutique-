import gsap from 'gsap';
import { PHASE, CHAPTERS } from './phases';

/**
 * HTML side of the sequence. A paused timeline whose total duration is exactly 1,
 * so `tl.progress(p)` lines up 1:1 with the WebGL choreography. Only opacity,
 * transforms and pointer-events are animated, and each property on each element is
 * owned by a single tween, so scrubbing in either direction is lossless.
 */
export function buildSequenceTimeline(stage: HTMLElement) {
  const q = gsap.utils.selector(stage);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  // anchor total duration to 1
  tl.set({}, {}, 1);

  /* ---- Establish -> Approach: hero copy exits gracefully */
  tl.fromTo(q('[data-anim="cue"]'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 12, duration: 0.05 }, 0.01);
  tl.fromTo(
    q('[data-anim="headline-line"]'),
    { yPercent: 0, opacity: 1 },
    { yPercent: -105, opacity: 0.2, duration: 0.16, stagger: 0.035, ease: 'power2.in' },
    PHASE.approach[0] + 0.02,
  );
  tl.fromTo(
    q('[data-anim="hero-sub"]'),
    { y: 0, opacity: 1 },
    { y: -24, opacity: 0, duration: 0.12, ease: 'power1.in' },
    PHASE.approach[0],
  );
  tl.fromTo(
    q('[data-anim="hero-ctas"]'),
    { y: 0, opacity: 1 },
    { y: -24, opacity: 0, duration: 0.12, ease: 'power1.in' },
    PHASE.approach[0] + 0.03,
  );
  tl.set(q('[data-anim="hero-copy"]'), { pointerEvents: 'none' }, PHASE.approach[0] + 0.14);

  /* ---- Chapter rail: active chapter is a pure function of progress (CSS handles the swap) */
  const rail = q('[data-anim="rail"]')[0] as HTMLElement | undefined;
  let lastChapter = -1;
  tl.eventCallback('onUpdate', () => {
    const p = tl.progress();
    let idx = 0;
    CHAPTERS.forEach((c, i) => {
      if (p >= c.at) idx = i;
    });
    if (idx !== lastChapter && rail) {
      lastChapter = idx;
      rail.dataset.chapter = String(idx);
    }
  });
  tl.fromTo(q('[data-anim="rail-fill"]'), { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
  tl.fromTo(q('[data-anim="rail"]'), { opacity: 1 }, { opacity: 0, duration: 0.05 }, PHASE.resolve[0] + 0.02);

  /* ---- Resolve: lookbook heading rises from its masks */
  tl.fromTo(
    q('[data-anim="lb-line"]'),
    { yPercent: 110 },
    { yPercent: 0, duration: 0.1, stagger: 0.02, ease: 'power3.out' },
    PHASE.resolve[0] + 0.02,
  );
  tl.fromTo(
    q('[data-anim="lb-meta"]'),
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
    PHASE.resolve[0] + 0.06,
  );

  /* ---- Handoff: HTML cards fade in exactly over the WebGL panels (same image, same rect) */
  tl.fromTo(q('[data-anim="card-media"]'), { opacity: 0 }, { opacity: 1, duration: PHASE.handoff[1] - PHASE.handoff[0] }, PHASE.handoff[0]);
  tl.fromTo(
    q('[data-anim="card-caption"]'),
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.07, stagger: 0.015, ease: 'power2.out' },
    PHASE.resolve[1] - 0.06,
  );
  tl.set(q('[data-anim="lookbook-layer"]'), { pointerEvents: 'auto' }, PHASE.handoff[0]);

  return tl;
}
