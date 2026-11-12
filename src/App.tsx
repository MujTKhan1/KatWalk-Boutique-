import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useExperienceMode } from './hooks/useExperienceMode';
import { Header, SkipLink } from './components/Header';
import { Sequence } from './components/Sequence';
import { StaticExperience } from './components/StaticExperience';
import { FeaturedDrop, PageCurtain, SiteFooter, SocialGallery, Story, Visit } from './components/Sections';
import { useReveals } from './motion/useReveals';
import { usePageTransitions } from './motion/usePageTransitions';

export default function App() {
  const { mode, reason, reportFailure, parallax, capture } = useExperienceMode();

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    // layout changes with mode: let ScrollTrigger re-measure after paint
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [mode]);

  useReveals([mode]);
  usePageTransitions();

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
        <FeaturedDrop />
        <Story />
        <SocialGallery />
        <Visit />
      </main>
      <SiteFooter />
      <PageCurtain />
    </>
  );
}
