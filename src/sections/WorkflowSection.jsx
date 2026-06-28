import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { workflowSteps } from '../data/workflowSteps.js';
import { workflowStats } from '../data/workflowStats.js';
import { isAnchorScrollActive } from '../lib/anchor.js';

function WorkflowDossier({ step }) {
  const artifacts = step.artifacts ?? [];
  const checks = step.checks ?? [];

  return (
    <div className="workflow-dossier">
      <div className="workflow-dossier__top">
        <span>Stage {String(step.id).padStart(2, '0')}</span>
        <strong>{step.title}</strong>
        <p>{step.result}</p>
      </div>

      <div className="workflow-dossier__flow" aria-label="Вход и выход этапа">
        <div>
          <span>Вход</span>
          <strong>{step.input}</strong>
        </div>
        <i aria-hidden="true" />
        <div>
          <span>Выход</span>
          <strong>{step.result}</strong>
        </div>
      </div>

      <div className="workflow-dossier__columns">
        <div className="workflow-dossier__column">
          <span>Артефакты</span>
          {artifacts.map((item) => (
            <em key={item}>{item}</em>
          ))}
        </div>
        <div className="workflow-dossier__column workflow-dossier__column--checks">
          <span>Контроль</span>
          {checks.map((item) => (
            <em key={item}>{item}</em>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowVisual({ step, compact = false }) {
  const baseClassName = compact ? 'workflow-visual workflow-visual--compact' : 'workflow-visual';

  const renderVisual = () => {
    switch (step.visualType) {
      case 'brief':
        return (
          <div className="workflow-brief">
            <div className="workflow-brief__header">
              <span>Brief session</span>
              <strong>48%</strong>
            </div>
            <div className="workflow-brief__cards">
              {step.tags.map((tag, index) => (
                <span key={tag} style={{ '--workflow-delay': `${index * 0.08}s` }}>
                  <i />
                  {tag}
                </span>
              ))}
            </div>
            <div className="workflow-meter">
              <span />
            </div>
          </div>
        );

      case 'concept':
        return (
          <div className="workflow-concept">
            <div className="workflow-moodboard">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="workflow-key-message">
              <small>Key message</small>
              <strong>Один смысл. Один визуальный вектор.</strong>
            </div>
          </div>
        );

      case 'storyboard':
        return (
          <div className="workflow-storyboard">
            {['Scene 01', 'Scene 02', 'Scene 03'].map((scene, index) => (
              <div className="workflow-scene" key={scene}>
                <span>{scene}</span>
                <i />
                <small>{index === 0 ? '15s' : index === 1 ? '30s' : '60s'}</small>
              </div>
            ))}
            <div className="workflow-storyline">
              <span />
              <span />
              <span />
            </div>
          </div>
        );

      case 'preproduction':
        return (
          <div className="workflow-preproduction">
            <div className="workflow-calendar">
              <span>Thu</span>
              <strong>24</strong>
              <small>shoot day</small>
            </div>
            <div className="workflow-call-sheet">
              <strong>Call sheet</strong>
              {['Location confirmed', 'Crew locked', 'Equipment ready'].map((item) => (
                <span key={item}>
                  <i />
                  {item}
                </span>
              ))}
            </div>
          </div>
        );

      case 'shooting':
        return (
          <div className="workflow-monitor">
            <div className="workflow-monitor__frame">
              <span className="workflow-rec"><i /> REC</span>
              <span className="workflow-timecode">00:01:24:08</span>
              <div className="workflow-safe-lines">
                <span />
                <span />
                <span />
              </div>
              <div className="workflow-shot-list">
                <span><i /> Hero shot</span>
                <span><i /> Detail shot</span>
                <span><i /> Sound check</span>
              </div>
            </div>
          </div>
        );

      case 'postproduction':
        return (
          <div className="workflow-post">
            <div className="workflow-timeline-ui">
              {['Video', 'Color', 'Sound'].map((track, index) => (
                <span key={track} style={{ '--track-width': `${82 - index * 14}%` }}>
                  <i>{track}</i>
                </span>
              ))}
            </div>
            <div className="workflow-export-grid">
              {['Main video', 'Reels', 'Stories', 'YouTube', 'WhatsApp', 'Presentation'].map((format) => (
                <em key={format}>{format}</em>
              ))}
            </div>
          </div>
        );

      case 'request':
      default:
        return (
          <div className="workflow-request">
            <div className="workflow-message">
              <small>Incoming message</small>
              <strong>Нужен ролик под запуск продукта</strong>
            </div>
            <div className="workflow-request-card">
              <span>Project request received</span>
              <div>
                {step.tags.map((tag) => (
                  <em key={tag}>{tag}</em>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      className={`${baseClassName} workflow-visual--${step.visualType}`}
      key={compact ? `${step.id}-compact` : step.id}
      initial={{ opacity: 0, y: 18, scale: 0.97, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -14, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="workflow-visual__chrome">
        <span />
        <span />
        <span />
      </div>
      <div className="workflow-visual__grid" aria-hidden="true" />
      <div className="workflow-visual__inner">
        {!compact && renderVisual()}
        <WorkflowDossier step={step} />
      </div>
    </motion.div>
  );
}

function WorkflowTabs({ step, activeTab, onTabChange }) {
  const content = activeTab === 'weDo' ? step.weDo : step.clientDoes;

  return (
    <div className="workflow-tabs">
      <div className="workflow-tabs__controls" role="tablist" aria-label={`Вкладки этапа ${step.title}`}>
        <button
          type="button"
          className={activeTab === 'weDo' ? 'is-active' : ''}
          role="tab"
          aria-selected={activeTab === 'weDo'}
          onClick={(event) => {
            event.stopPropagation();
            onTabChange('weDo');
          }}
        >
          Что делаем мы
        </button>
        <button
          type="button"
          className={activeTab === 'client' ? 'is-active' : ''}
          role="tab"
          aria-selected={activeTab === 'client'}
          onClick={(event) => {
            event.stopPropagation();
            onTabChange('client');
          }}
        >
          Что нужно от клиента
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          className="workflow-tabs__content"
          key={`${step.id}-${activeTab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {content}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function WorkflowStepCard({ step, index, isActive, onSelect, registerStep, activeTab, onTabChange }) {
  const stepNumber = String(index + 1).padStart(2, '0');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(index);
    }
  };

  return (
    <motion.article
      ref={(node) => registerStep(index, node)}
      data-workflow-index={index}
      className={isActive ? 'workflow-step is-active' : 'workflow-step'}
      onClick={() => onSelect(index)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.42, delay: index * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
      aria-label={`${stepNumber}. ${step.title}`}
    >
      <span className="workflow-step__dot" aria-hidden="true" />
      <div className="workflow-step__mobile-visual">
        <WorkflowVisual step={step} compact />
      </div>

      <div className="workflow-step__header">
        <span>{stepNumber}</span>
        <strong>{step.title}</strong>
      </div>
      <span className="workflow-step__result">{step.result}</span>
      <p>{step.description}</p>
      <div className="workflow-step__tags">
        {step.tags.map((tag) => (
          <em key={tag}>{tag}</em>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            className="workflow-step__details"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <WorkflowTabs step={step} activeTab={activeTab} onTabChange={onTabChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function WorkflowTimeline({ activeIndex, activeTab, onStepSelect, onTabChange, progressScale, registerStep }) {
  return (
    <div className="workflow-timeline">
      <div className="workflow-progress" aria-hidden="true">
        <motion.span style={{ scaleY: progressScale }} />
      </div>

      {workflowSteps.map((step, index) => (
        <WorkflowStepCard
          step={step}
          index={index}
          isActive={activeIndex === index}
          onSelect={onStepSelect}
          registerStep={registerStep}
          activeTab={activeTab}
          onTabChange={onTabChange}
          key={step.id}
        />
      ))}
    </div>
  );
}

export default function WorkflowSection() {
  const sectionRef = useRef(null);
  const stepRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('weDo');
  const activeStep = workflowSteps[activeIndex] ?? workflowSteps[0];
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center'],
  });
  const progressScale = useTransform(scrollYProgress, [0.02, 0.94], [0, 1]);

  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean);

    if (!nodes.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isAnchorScrollActive()) return;

        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const nextIndex = Number(visibleEntries[0].target.dataset.workflowIndex);

        if (Number.isFinite(nextIndex)) {
          setActiveIndex(nextIndex);
        }
      },
      {
        threshold: [0.22, 0.42, 0.62],
        rootMargin: '-34% 0px -42% 0px',
      },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActiveTab('weDo');
  }, [activeIndex]);

  const registerStep = (index, node) => {
    stepRefs.current[index] = node;
  };

  const handleStepSelect = (index) => {
    setActiveIndex(index);
  };

  return (
    <section ref={sectionRef} id="workflow" className="workflow-section" aria-labelledby="workflow-title">
      <div className="workflow-grain" aria-hidden="true" />

      <motion.header
        className="workflow-heading"
        initial={{ opacity: 0, y: 30, filter: 'blur(14px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.42 }}
        transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">Как мы работаем</p>
        <h2 id="workflow-title">От задачи до готового видеопродукта</h2>
        <div className="workflow-heading__side">
          <p>
            Мы заранее выстраиваем процесс: понимаем задачу, формулируем идею, готовим съёмку,
            производим материал и передаём версии под нужные площадки.
          </p>
          <div className="workflow-stats" aria-label="Ключевые параметры процесса">
            {workflowStats.map((item) => (
              <span key={item.label}>
                <strong>{item.value}</strong>
                <em>{item.label}</em>
              </span>
            ))}
          </div>
        </div>
      </motion.header>

      <div className="workflow-layout">
        <aside className="workflow-visual-column" aria-label="Визуал активного этапа">
          <div className="workflow-sticky">
            <div className="workflow-sticky__topline">
              <span>{String(activeIndex + 1).padStart(2, '0')} / {String(workflowSteps.length).padStart(2, '0')}</span>
              <em>{activeStep.title}</em>
            </div>
            <AnimatePresence mode="wait">
              <WorkflowVisual step={activeStep} key={activeStep.id} />
            </AnimatePresence>
          </div>
        </aside>

        <WorkflowTimeline
          activeIndex={activeIndex}
          activeTab={activeTab}
          onStepSelect={handleStepSelect}
          onTabChange={setActiveTab}
          progressScale={progressScale}
          registerStep={registerStep}
        />
      </div>

    </section>
  );
}
