import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { useSequenceDriver } from '../motion/useSequenceDriver';
import { buildSequenceTimeline } from '../motion/domTimeline';
import { CHAPTERS } from '../motion/phases';
import { HeroCopy, HeroTicker } from './HeroCopy';
import { LookbookPreview } from './Lookbook';

const SceneCanvas = lazy(() => import('../scene/SceneCanvas'));

type Props = {
  parallax: boolean;
  capture: boolean;
  onFailure: (reason: string) => void;
};

/**
 * The pinned hero sequence. A tall section with a CSS-sticky stage: native scrolling,
 * no hijacking. The stage holds one canvas plus the HTML layers it hands off to.
 */
export function Sequence({ parallax, capture, onFailure }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useSequenceDriver({ sectionRef, stageRef, buildTimeline: buildSequenceTimeline, parallax });

  return (
    <section ref={sectionRef} className="sequence" id="top" aria-label="Introduction">
      <div ref={stageRef} className="stage">
        <div className={ready ? 'stage-canvas is-ready' : 'stage-canvas'} aria-hidden="true">
          <Suspense fallback={null}>
            <SceneCanvas onFailure={onFailure} onReady={onReady} capture={capture} />
          </Suspense>
        </div>

        <HeroCopy immersive />

        <HeroTicker />

        <div className="scroll-cue" data-anim="cue" aria-hidden="true">
          <span>Scroll</span>
          <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
            <path d="M1 1l10 9 10-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="chapter-rail" data-anim="rail" data-chapter="0" aria-hidden="true">
          <span className="rail-track">
            <span className="rail-fill" data-anim="rail-fill" />
          </span>
          <span className="rail-labels">
            {CHAPTERS.map((c, i) => (
              <span className="rail-label" key={c.label} data-index={i}>
                <span className="rail-num">0{i + 1}</span> {c.label}
              </span>
            ))}
          </span>
        </div>

        <LookbookPreview immersive />

        <p className="demo-note">Concept demo · Imagery is illustrative</p>
      </div>
      {/* Anchor sits exactly where the sequence resolves (progress = 1). */}
      <div id="lookbook" className="sequence-end" tabIndex={-1} aria-label="Style edits" />
    </section>
  );
}
