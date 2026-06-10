import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  { id: 'idea',    label: 'Идея'      },
  { id: 'script',  label: 'Сценарий'  },
  { id: 'shoot',   label: 'Съёмка'    },
  { id: 'edit',    label: 'Монтаж'    },
  { id: 'result',  label: 'Результат' },
];

// Node centers at 10%, 30%, 50%, 70%, 90% (5 equal flex-1 columns)
const STEP_POS   = STEPS.map((_, i) => 0.1 + i * 0.2);
const LIT_RADIUS = 0.15;

const WA_HREF = 'https://wa.me/996500669763';
const TG_HREF = 'https://t.me/+996500669763';
const PHONE   = '+996 500 669 763';

function lerp(a, b, t) { return a + (b - a) * t; }

function ProcessLine() {
  const containerRef = useRef(null);
  const beamRef      = useRef(null);
  const fillRef      = useRef(null);
  const stepsRef     = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    const beam      = beamRef.current;
    const fill      = fillRef.current;
    if (!container || !beam) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      beam.style.left = '50%';
      if (fill) fill.style.width = '50%';
      stepsRef.current.forEach((el, i) =>
        el?.style.setProperty('--step-lit', STEP_POS[i] === 0.5 ? '1' : '0.4'));
      return;
    }

    let targetP  = 0.5;
    let currentP = 0.5;
    let autoT    = Math.PI / 2;
    let hasPointer = false;
    let rafId;

    function tick() {
      if (!hasPointer) {
        autoT   += 0.004;
        targetP  = 0.5 + 0.44 * Math.sin(autoT);
      }
      currentP = lerp(currentP, targetP, 0.07);

      beam.style.left = `${currentP * 100}%`;
      if (fill) fill.style.width = `${currentP * 100}%`;

      stepsRef.current.forEach((el, i) => {
        if (!el) return;
        const dist = Math.abs(currentP - STEP_POS[i]);
        el.style.setProperty('--step-lit', Math.max(0, 1 - dist / LIT_RADIUS).toFixed(3));
      });

      rafId = requestAnimationFrame(tick);
    }

    function getP(clientX) {
      const rect = container.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    }

    function onMove(e)  { targetP = getP(e.clientX); hasPointer = true; }
    function onLeave()  { hasPointer = false; }
    function onTouch(e) {
      const t = e.touches[0];
      if (t) { targetP = getP(t.clientX); hasPointer = true; }
    }
    function onTouchEnd() { hasPointer = false; }

    document.addEventListener('mousemove',  onMove,     { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('touchmove',  onTouch,    { passive: true });
    document.addEventListener('touchend',   onTouchEnd);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('touchmove',  onTouch);
      document.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  return (
    <div ref={containerRef} className="ct-process" aria-hidden="true">
      {/* Track */}
      <div className="ct-process__line-wrap">
        <div className="ct-process__line-bg" />
        <div ref={fillRef}  className="ct-process__line-fill" />
        <div className="ct-process__line-pulse" />
        <div ref={beamRef}  className="ct-process__beam" />
      </div>

      {/* Nodes + labels */}
      <div className="ct-process__steps">
        {STEPS.map((step, i) => (
          <div
            key={step.id}
            className="ct-step"
            ref={el => { stepsRef.current[i] = el; }}
          >
            <div className="ct-step__node">
              <span className="ct-step__num">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <span className="ct-step__label">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// WA icon
function IconWA() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L.057 23.082a.75.75 0 0 0 .921.921l5.224-1.476A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.953-1.357l-.355-.211-3.676 1.039 1.04-3.594-.23-.37A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
    </svg>
  );
}

// TG icon
function IconTG() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

export default function ContactSection() {
  return (
    <section id="contact" className="ct-section" aria-labelledby="ct-title">
      {/* Decorative layers */}
      <div className="grain"       aria-hidden="true" />
      <div className="ct-ambient"  aria-hidden="true" />
      <div className="ct-grid-bg"  aria-hidden="true" />
      <div className="ct-bg-text"  aria-hidden="true">NEXT</div>

      <div className="ct-inner">
        {/* Eyebrow */}
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          Начнём проект
        </motion.p>

        {/* Headline */}
        <motion.h2
          id="ct-title"
          className="ct-headline"
          initial={{ opacity: 0, y: 40, filter: 'blur(20px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          Ваш проект —<br />следующий
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="ct-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        >
          Расскажите задачу — мы предложим идею, сценарий,{' '}
          визуальный стиль и формат реализации.
        </motion.p>

        {/* Process LED line */}
        <motion.div
          className="ct-process-wrap"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="ct-process-eyebrow">Процесс создания</p>
          <ProcessLine />
        </motion.div>

        {/* Contact cards */}
        <motion.div
          className="ct-cards"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.85, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* WhatsApp */}
          <a
            className="ct-card ct-card--wa"
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Написать в WhatsApp: ${PHONE}`}
          >
            <div className="ct-card__shine"  aria-hidden="true" />
            <div className="ct-card__glow"   aria-hidden="true" />
            <div className="ct-card__top-border ct-card__top-border--wa" aria-hidden="true" />
            <div className="ct-card__icon ct-card__icon--wa" aria-hidden="true">
              <IconWA />
            </div>
            <div className="ct-card__content">
              <span className="ct-card__label">WhatsApp</span>
              <span className="ct-card__phone">{PHONE}</span>
              <span className="ct-card__cta">Написать сейчас →</span>
            </div>
          </a>

          {/* Telegram */}
          <a
            className="ct-card ct-card--tg"
            href={TG_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Написать в Telegram: ${PHONE}`}
          >
            <div className="ct-card__shine"  aria-hidden="true" />
            <div className="ct-card__glow"   aria-hidden="true" />
            <div className="ct-card__top-border ct-card__top-border--tg" aria-hidden="true" />
            <div className="ct-card__icon ct-card__icon--tg" aria-hidden="true">
              <IconTG />
            </div>
            <div className="ct-card__content">
              <span className="ct-card__label">Telegram</span>
              <span className="ct-card__phone">{PHONE}</span>
              <span className="ct-card__cta">Написать сейчас →</span>
            </div>
          </a>
        </motion.div>
      </div>

      {/* Footer tagline */}
      <motion.footer
        className="ct-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.9 }}
        transition={{ duration: 1.4, delay: 0.1 }}
      >
        <span>CHUDO PRODUCTION</span>
        <span className="ct-footer__sep" aria-hidden="true">·</span>
        <span>Бишкек</span>
        <span className="ct-footer__sep" aria-hidden="true">·</span>
        <span>Видео, сценарии и визуальные решения для брендов</span>
      </motion.footer>
    </section>
  );
}
