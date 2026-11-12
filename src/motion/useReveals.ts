import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Lusion-style scroll reveals for the HTML sections. Every reveal is SCRUBBED to scroll
 * position (not fired once), so scrolling back up reverses it exactly. Reduced motion:
 * nothing is animated and content is simply shown.
 *
 *   data-reveal="lines"  masked lines rise into place (children `.line` inside `.line-mask`)
 *   data-reveal="clip"   image unveils bottom-up with a slight counter-zoom
 *   data-reveal="fade"   soft rise + fade
 *   data-reveal="words"  words fill from faint to full ink as you read (children `.w`)
 *   data-reveal="stagger" children `[data-item]` rise in sequence
 */
export function useReveals(deps: unknown[]) {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll('.line'),
          { yPercent: 110 },
          { yPercent: 0, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 55%', scrub: 0.6 } },
        );
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
        const img = el.querySelector('img');
        const st = { trigger: el, start: 'top 95%', end: 'top 45%', scrub: 0.6 };
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: st });
        if (img) gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { ...st, end: 'bottom 40%' } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top 94%', end: 'top 70%', scrub: 0.6 } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll('[data-item]'),
          { opacity: 0, y: 70 },
          { opacity: 1, y: 0, ease: 'none', stagger: 0.15, scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 35%', scrub: 0.6 } },
        );
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="statement"]').forEach((el) => {
        const st = { trigger: el, start: 'top 85%', end: 'bottom 50%', scrub: 0.6 };
        const tl = gsap.timeline({ scrollTrigger: st, defaults: { ease: 'none' } });
        tl.fromTo(el.querySelectorAll('.line'), { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.18 }, 0);
        el.querySelectorAll<HTMLElement>('.pill').forEach((pill, i) => {
          const at = 0.25 + i * 0.18;
          tl.fromTo(pill, { clipPath: 'inset(0% 50% 0% 50% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 0.45 }, at);
          tl.fromTo(pill.querySelector('img'), { scale: 1.35 }, { scale: 1, duration: 0.6 }, at);
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="words"]').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll('.w'),
          { opacity: 0.14 },
          { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: 0.4 } },
        );
      });
    });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Split a sentence into word spans for the "words" reveal (keeps text readable to AT). */
export function words(text: string) {
  return text.split(' ').map((w, i) => ({ w, key: `${i}-${w}` }));
}
