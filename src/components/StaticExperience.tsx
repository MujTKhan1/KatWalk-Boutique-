import { useState } from 'react';
import { HERO_STILL, LOOKBOOK } from '../content/lookbook';
import type { StaticReason } from '../hooks/useExperienceMode';
import { HeroCopy } from './HeroCopy';
import { LookbookPreview } from './Lookbook';

const REASON_COPY: Partial<Record<NonNullable<StaticReason>, string>> = {
  'reduced-motion': 'Showing the still composition because reduced motion is on.',
  'no-webgl': 'Showing the still composition because 3D graphics are unavailable in this browser.',
  'scene-error': 'Showing the still composition because the 3D scene could not start.',
  'context-lost': 'Showing the still composition because the 3D scene was interrupted.',
};

/**
 * Composed static hero for mobile, reduced motion and WebGL failure.
 * Uses a pre-rendered still of the 3D display (public/media/hero-still.webp);
 * if that is missing it falls back to the first editorial illustration.
 */
export function StaticExperience({ reason }: { reason: StaticReason }) {
  const [stillFailed, setStillFailed] = useState(false);
  const note = reason ? REASON_COPY[reason] : undefined;

  return (
    <>
      <section className="static-hero" id="top" aria-label="Introduction">
        <div className="static-hero-media">
          {stillFailed ? (
            <img className="static-hero-fallback" src={LOOKBOOK[0].src} alt="" />
          ) : (
            <img
              src={HERO_STILL}
              alt=""
              onError={() => setStillFailed(true)}
              fetchPriority="high"
              width={1600}
              height={1000}
            />
          )}
        </div>
        <HeroCopy immersive={false} />
        <p className="demo-note">Concept demo · Imagery is illustrative</p>
      </section>
      <section className="static-lookbook" id="lookbook" aria-label="Style edits" tabIndex={-1}>
        <LookbookPreview immersive={false} />
        {note && <p className="mode-note">{note}</p>}
      </section>
    </>
  );
}
