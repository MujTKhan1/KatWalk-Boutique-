import type { FocusEvent, PointerEvent } from 'react';
import { store } from '../motion/store';

/** Magnetic pull toward the pointer (mouse only, off for reduced motion). Pure CSS variables. */
function magnet(e: PointerEvent<HTMLAnchorElement>) {
  if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
  const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  el.style.setProperty('--mx', `${(x * 7).toFixed(2)}px`);
  el.style.setProperty('--my', `${(y * 5).toFixed(2)}px`);
}
function release(e: PointerEvent<HTMLAnchorElement>) {
  e.currentTarget.style.setProperty('--mx', '0px');
  e.currentTarget.style.setProperty('--my', '0px');
}

/**
 * Accessible HTML hero copy. Lives above the canvas in both modes.
 * In the immersive sequence it exits on scroll; if a keyboard user focuses a CTA
 * after it has exited, we bring the hero back into view so focus is never invisible.
 */
export function HeroCopy({ immersive }: { immersive: boolean }) {
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (!immersive || !e.target.matches('a')) return;
    if (store.p > 0.05) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  return (
    <div className="hero-copy" data-anim="hero-copy" onFocus={onFocus}>
      <p className="hero-eyebrow" data-anim="hero-sub">
        <span className="hero-eyebrow-dot" aria-hidden="true" />
        The Katwalk edit
        <span className="hero-eyebrow-rule" aria-hidden="true" />
        Street to runway
      </p>
      <h1 className="hero-title">
        <span className="sr-only">Your Street. Your Runway.</span>
        <span className="line-mask" aria-hidden="true">
          <span className="line-intro">
            <span className="line" data-anim="headline-line">
              Your Street.
            </span>
          </span>
        </span>
        <span className="line-mask" aria-hidden="true">
          <span className="line-intro">
            <span className="line" data-anim="headline-line">
              Your <em>Runway.</em>
            </span>
          </span>
        </span>
      </h1>
      <p className="hero-sub" data-anim="hero-sub">
        Street-ready edits, styled with runway confidence.
      </p>
      <div className="hero-ctas" data-anim="hero-ctas">
        <a className="btn btn-primary" href="#lookbook" onPointerMove={magnet} onPointerLeave={release}>
          <span className="btn-label">Explore the Collection</span>
        </a>
        <a className="btn btn-link" href="#story">
          Discover Katwalk
        </a>
      </div>
    </div>
  );
}
