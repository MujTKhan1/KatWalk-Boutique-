import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SOCIAL_HANDLE, SOCIAL_TILES } from '../content/site';
import { SocialGallery } from './Sections';

gsap.registerPlugin(ScrollTrigger);

const N = SOCIAL_TILES.length;
const STEP = 360 / N;
/** total ring travel: brings every card to the front once */
const TRAVEL = STEP * (N - 1);
const pad = (n: number) => String(n).padStart(2, '0');

/** Orbit only where it helps: wide screens without reduced motion. Otherwise the plain grid. */
function useOrbitEnabled() {
  const query = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';
  const [on, setOn] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = () => setOn(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return on;
}

/**
 * "From the boutique feed" as a pinned orbit: six photographs ride a tilted 3D ring (CSS 3D,
 * no WebGL) between two giant words. Scroll turns the ring; every visual is a pure function of
 * one scrubbed progress value, so scrolling back reverses it exactly.
 */
export function SocialOrbit() {
  const enabled = useOrbitEnabled();
  const track = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const wordTop = useRef<HTMLSpanElement>(null);
  const wordBottom = useRef<HTMLSpanElement>(null);
  const info = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!enabled || !track.current) return;
    let active = -1;
    const apply = (p: number) => {
      const rot = -p * TRAVEL;
      if (ring.current) ring.current.style.transform = `rotateX(7deg) rotateZ(-5deg) rotateY(${rot}deg)`;
      cards.current.forEach((el, i) => {
        if (!el) return;
        const c = Math.cos(((i * STEP + rot) * Math.PI) / 180);
        const front = (c + 1) / 2; // 1 = facing the visitor, 0 = far side of the ring
        el.style.setProperty('--front', front.toFixed(3));
      });
      if (wordTop.current) wordTop.current.style.transform = `translate3d(${(-p * 7).toFixed(2)}vw,0,0)`;
      if (wordBottom.current) wordBottom.current.style.transform = `translate3d(${(p * 7).toFixed(2)}vw,0,0)`;
      const idx = (((Math.round(-rot / STEP) % N) + N) % N) as number;
      if (idx !== active && info.current) {
        active = idx;
        const t = SOCIAL_TILES[idx];
        const q = (sel: string) => info.current!.querySelector(sel)!;
        q('[data-count]').textContent = `${pad(idx + 1)} / ${pad(N)}`;
        q('[data-code]').textContent = `KW-${pad(idx + 1)}`;
        q('[data-title]').textContent = t.title;
        q('[data-caption]').textContent = t.caption;
        info.current.classList.remove('is-swap');
        void info.current.offsetWidth; // restart the swap animation
        info.current.classList.add('is-swap');
        cards.current.forEach((el, i) => el?.classList.toggle('is-active', i === idx));
      }
    };

    const state = { p: 0 };
    const ctx = gsap.context(() => {
      gsap.to(state, {
        p: 1,
        ease: 'none',
        onUpdate: () => apply(state.p),
        scrollTrigger: { trigger: track.current, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
      });
    });
    apply(0);
    // verification helper (dev only): drive the same pure function directly
    if (import.meta.env.DEV) (window as unknown as { __orbitApply: (p: number) => void }).__orbitApply = apply;
    return () => ctx.revert();
  }, [enabled]);

  if (!enabled) return <SocialGallery />;

  return (
    <section className="orbit" id="social" aria-labelledby="social-title">
      <div className="orbit-track" ref={track}>
        <div className="orbit-stage">
          <div className="orbit-bar">
            <p className="orbit-eyebrow">Social / From the boutique feed</p>
          </div>
          <h2 className="sr-only" id="social-title">
            From the boutique feed
          </h2>
          <span className="orbit-word orbit-word--top" ref={wordTop} aria-hidden="true">
            Boutique
          </span>
          <span className="orbit-word orbit-word--bottom" ref={wordBottom} aria-hidden="true">
            Feed.
          </span>
          <p className="orbit-note">
            <span className="orbit-handle">{SOCIAL_HANDLE}</span>
            Illustrative stock photos. The live feed and link activate once account ownership is confirmed.
          </p>

          <div className="orbit-scene">
            <div className="orbit-ring" ref={ring}>
              <div className="orbit-line" aria-hidden="true" />
              <ul className="orbit-cards">
                {SOCIAL_TILES.map((t, i) => (
                  <li
                    key={t.src}
                    className="orbit-card"
                    ref={(el) => {
                      cards.current[i] = el;
                    }}
                    style={{ ['--a' as string]: `${i * STEP}deg` }}
                  >
                    <img src={t.src} alt={t.alt} style={{ objectPosition: t.pos }} loading="eager" decoding="async" width={1000} height={1250} />
                    <span className="orbit-card-code" aria-hidden="true">
                      KW-{pad(i + 1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="orbit-info" ref={info} aria-live="polite">
            <span className="orbit-count" data-count>
              01 / {pad(N)}
            </span>
            <span className="orbit-code" data-code>
              KW-01
            </span>
            <span className="orbit-title" data-title>
              {SOCIAL_TILES[0].title}
            </span>
            <span className="orbit-caption" data-caption>
              {SOCIAL_TILES[0].caption}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
