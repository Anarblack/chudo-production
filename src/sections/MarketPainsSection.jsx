import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { painScenes, painItemVariants } from '../data/painScenes.js';

export default function MarketPainsSection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activePain = painScenes[activeIndex] ?? painScenes[0];
  const progress = `${((activeIndex + 1) / painScenes.length) * 100}%`;
  const questionWords = activePain.question.split(' ');
  const isLongQuestion = questionWords.length > 10;

  useEffect(() => {
    let frame = 0;

    const updateActiveQuestion = () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const nextStep = Math.min(Math.max(-rect.top / viewportHeight, 0), painScenes.length);
      const nextIndex = Math.min(painScenes.length - 1, Math.floor(nextStep));

      setActiveIndex(nextIndex);
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveQuestion);
    };

    updateActiveQuestion();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="market-pains"
      className="pains-section"
      aria-label="Боли целевой аудитории"
      style={{
        '--pains-scroll-height': `${painScenes.length * 100}svh`,
        '--pains-progress': progress,
        '--pains-accent': activePain.accent,
      }}
    >
      <div className="pains-sticky">
        <div className="pains-noise" aria-hidden="true" />
        <div className="pains-viewfinder" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="pains-rec" aria-hidden="true">
          <i />
          Market scan
        </div>
        <header className="pains-heading">
          <p>02 / Проблемы рынка</p>
        </header>

        <div className="pain-stage" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.article
              className={isLongQuestion ? 'pain-question is-long' : 'pain-question'}
              variants={painItemVariants}
              custom={activeIndex}
              initial="hidden"
              animate="visible"
              exit="exit"
              key={activePain.id}
              aria-label={activePain.question}
            >
              <div className="pain-question__meta">
                <span>{String(activeIndex + 1).padStart(2, '0')}</span>
                <em>{activePain.label}</em>
              </div>
              <h3 className="pain-question__text">
                {questionWords.map((word, index) => (
                  <motion.span
                    className="pain-question__word"
                    key={`${activePain.id}-${word}-${index}`}
                    initial={{ opacity: 0, y: 18, filter: 'blur(14px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.34,
                      delay: 0.04 + index * 0.028,
                      ease: [0.2, 0.8, 0.2, 1],
                    }}
                  >
                    {word}{index < questionWords.length - 1 ? ' ' : ''}
                  </motion.span>
                ))}
              </h3>
              <div className="pain-question__signal" aria-hidden="true">
                <span>{activePain.signal}</span>
                <i />
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <footer className="pains-footer">
          <div className="pains-progress" aria-hidden="true">
            <span />
          </div>
          <div className="pains-steps" aria-label={`Проблема ${activeIndex + 1} из ${painScenes.length}`}>
            {painScenes.map((scene, index) => (
              <span className={index === activeIndex ? 'is-active' : ''} key={scene.id} />
            ))}
          </div>
        </footer>
      </div>
    </section>
  );
}
