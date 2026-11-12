import { useEffect } from 'react';
import gsap from 'gsap';
import { store } from './store';

/**
 * Lusion-style curtain transition for in-page navigation. A plaster curtain sweeps up,
 * the page jumps (the 3D sequence snaps to its exact state for that position), focus moves
 * to the destination, and the curtain sweeps away. Reduced motion: native jump, no curtain.
 * Every link remains an ordinary href, so it works without JavaScript too.
 */
export function usePageTransitions() {
  useEffect(() => {
    const curtain = document.querySelector<HTMLElement>('.page-curtain');
    if (!curtain) return;
    let busy = false;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      if (busy) return;
      busy = true;

      const label = curtain.querySelector('.page-curtain-label');
      const html = document.documentElement;
      const tl = gsap.timeline({
        onComplete: () => {
          busy = false;
          html.style.scrollBehavior = '';
        },
      });
      tl.set(curtain, { visibility: 'visible', yPercent: 100 })
        .to(curtain, { yPercent: 0, duration: 0.6, ease: 'power3.inOut' })
        .fromTo(label, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, '-=0.25')
        .add(() => {
          html.style.scrollBehavior = 'auto';
          target.scrollIntoView({ block: 'start' });
          store.snap();
          history.replaceState(null, '', `#${id}`);
          if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        })
        .to(label, { yPercent: -120, opacity: 0, duration: 0.3, ease: 'power2.in' }, '+=0.12')
        .to(curtain, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' }, '-=0.1')
        .set(curtain, { visibility: 'hidden' });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
