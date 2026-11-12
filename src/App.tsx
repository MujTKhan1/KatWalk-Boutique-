import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useExperienceMode } from './hooks/useExperienceMode';
import { Header, SkipLink } from './components/Header';
import { Sequence } from './components/Sequence';
import { StaticExperience } from './components/StaticExperience';
import { PlannedSections } from './components/PlannedSections';

export default function App() {
  const { mode, reason, reportFailure, parallax, capture } = useExperienceMode();

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    // layout changes with mode: let ScrollTrigger re-measure after paint
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [mode]);

  return (
    <>
      <SkipLink />
      <Header />
      <main>
        {mode === 'immersive' ? (
          <Sequence parallax={parallax} capture={capture} onFailure={reportFailure} />
        ) : (
          <StaticExperience reason={reason} />
        )}
        <PlannedSections />
      </main>
    </>
  );
}
