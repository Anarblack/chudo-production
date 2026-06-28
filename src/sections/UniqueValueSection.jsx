import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { comparisonItems } from '../data/comparisonItems.js';

function ComparisonRow({ item, index, isActive, onActivate }) {
  return (
    <motion.article
      className={isActive ? 'comparison-row is-active' : 'comparison-row'}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.42 }}
      onViewportEnter={() => onActivate(index)}
      onPointerEnter={() => onActivate(index)}
      onClick={() => onActivate(index)}
      tabIndex={0}
      aria-label={`${item.ordinary} → ${item.chudo}`}
    >
      <motion.div
        className="comparison-card comparison-card--ordinary"
        variants={{
          hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
          visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } },
        }}
      >
        <span className="comparison-card__label">Обычная съёмка</span>
        <strong>{item.ordinary}</strong>
      </motion.div>

      <motion.div
        className="comparison-transform"
        variants={{
          hidden: { opacity: 0, scaleX: 0.5 },
          visible: { opacity: 1, scaleX: 1, transition: { duration: 0.38, delay: 0.18, ease: 'easeOut' } },
        }}
        aria-hidden="true"
      >
        <span className="comparison-transform__icon">{item.icon}</span>
        <i />
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      <motion.div
        className="comparison-card comparison-card--chudo"
        variants={{
          hidden: { opacity: 0, y: 24, x: -10, filter: 'blur(10px)' },
          visible: { opacity: 1, y: 0, x: 0, filter: 'blur(0px)', transition: { duration: 0.58, delay: 0.26, ease: [0.2, 0.8, 0.2, 1] } },
        }}
      >
        <span className="comparison-card__label comparison-card__label--chudo">Подход ChuDo</span>
        <strong>{item.chudo}</strong>

        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              className="comparison-card__detail"
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              <p>{item.description}</p>
              <div className="comparison-tags">
                {item.tags.map((tag) => (
                  <em key={tag}>{tag}</em>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.article>
  );
}

export default function UniqueValueSection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const progressScale = useTransform(scrollYProgress, [0.12, 0.88], [0, 1]);

  return (
    <section ref={sectionRef} id="usp" className="usp-section" aria-labelledby="usp-title">
      <div className="usp-grain" aria-hidden="true" />
      <motion.div className="usp-progress" aria-hidden="true">
        <motion.span style={{ scaleY: progressScale }} />
      </motion.div>

      <motion.header
        className="usp-heading"
        initial={{ opacity: 0, y: 28, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">Наш подход</p>
        <h2 id="usp-title">Не просто съёмка.<br />Продакшен под задачу бизнеса.</h2>
        <p>
          Мы не начинаем с вопроса «что снять?». Мы начинаем с вопроса:
          какую задачу должно решить видео после публикации?
        </p>
      </motion.header>

      <div className="comparison-board">
        {comparisonItems.map((item, index) => (
          <ComparisonRow
            item={item}
            index={index}
            isActive={activeIndex === index}
            onActivate={setActiveIndex}
            key={item.chudo}
          />
        ))}
      </div>
    </section>
  );
}
