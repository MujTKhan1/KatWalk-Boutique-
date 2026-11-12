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
      {immersive && <EditBadge />}
    </div>
  );
}

/**
 * Circular "new season edit" badge. Its outer ring is rotated by the scroll timeline
 * (reversible); the inner idle spin is decorative and disabled for reduced motion.
 */
function EditBadge() {
  return (
    <a className="edit-badge" href="#lookbook" data-anim="badge" aria-label="Explore the new season edit">
      <span className="edit-badge-ring" data-anim="badge-ring" aria-hidden="true">
        <svg viewBox="0 0 120 120" className="edit-badge-text">
          <defs>
            <path id="badge-circle" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1 -92 0" />
          </defs>
          <text>
            <textPath href="#badge-circle" startOffset="0" textLength="286" lengthAdjust="spacing">
              New season edit · Street to runway ·
            </textPath>
          </text>
        </svg>
      </span>
      <span className="edit-badge-core" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 3v15M4.5 11.5 11 18l6.5-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

/** Slow editorial ticker along the base of the hero (decorative; content is repeated elsewhere). */
export function HeroTicker() {
  const items = ['Street Chic', 'Statement Pieces', 'After-Dark Looks', 'Your Street. Your Runway.'];
  const row = (
    <span className="ticker-row">
      {items.map((t) => (
        <span key={t} className="ticker-item">
          {t}
          <span className="ticker-star">✦</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="hero-ticker" data-anim="ticker" aria-hidden="true">
      <div className="ticker-track">
        {row}
        {row}
      </div>
    </div>
  );
}
