import React, { Suspense, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/chudo-logo-new.png';
import BlurText from '../components/BlurText.jsx';
import { AnchorNav } from './StickyNav.jsx';
import { startAnchorScroll } from '../lib/anchor.js';

const CameraSceneLazy = React.lazy(() => import('../CameraScene.jsx'));

function CameraPoster() {
  return (
    <div className="camera-poster" aria-hidden="true">
      <img
        className="camera-poster__img"
        src="/camera-poster.webp"
        alt=""
        width="635"
        height="520"
        decoding="async"
      />
      <svg className="camera-poster__overlay" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 26 L10 10 L26 10" stroke="rgba(244,245,242,0.32)" strokeWidth="0.9"/>
        <path d="M214 10 L230 10 L230 26" stroke="rgba(244,245,242,0.32)" strokeWidth="0.9"/>
        <path d="M10 134 L10 150 L26 150" stroke="rgba(244,245,242,0.32)" strokeWidth="0.9"/>
        <path d="M214 150 L230 150 L230 134" stroke="rgba(244,245,242,0.32)" strokeWidth="0.9"/>
        <circle cx="155" cy="14" r="4" fill="#ff4a0a"/>
        <circle cx="155" cy="14" r="6" fill="rgba(255,74,10,0.18)"/>
        <text x="163" y="17" fontFamily="monospace" fontSize="7" fill="rgba(255,74,10,0.7)" letterSpacing="1">REC</text>
      </svg>
    </div>
  );
}

function HeroVisual() {
  const [showCanvas, setShowCanvas] = useState(
    () => !window.matchMedia('(max-width: 760px)').matches
  );
  const isInteracting = useRef(false);
  const idleTimer     = useRef(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setShowCanvas(!media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const resetIdle = () => {
    isInteracting.current = true;
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      isInteracting.current = false;
    }, 2000);
  };

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  return (
    <div
      className="hero-visual"
      aria-label={showCanvas
        ? '3D-камера RED. Вращайте и приближайте мышью. Без действий — медленно вращается сама.'
        : 'Камера RED'}
      onMouseDown={showCanvas ? resetIdle : undefined}
      onMouseMove={showCanvas ? (e) => { if (e.buttons > 0) resetIdle(); } : undefined}
      onWheel={showCanvas ? resetIdle : undefined}
      onTouchStart={showCanvas ? resetIdle : undefined}
      onTouchMove={showCanvas ? resetIdle : undefined}
    >
      <motion.div
        className="camera-stage"
        data-cursor={showCanvas ? 'camera' : undefined}
        initial={{ opacity: 0, scale: 0.88, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="camera-canvas">
          {showCanvas ? (
            <Suspense fallback={<CameraPoster />}>
              <CameraSceneLazy isInteracting={isInteracting} />
            </Suspense>
          ) : (
            <CameraPoster />
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="grain" aria-hidden="true" />

      <motion.header
        className="hero-header"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <a className="logo-link" href="/" aria-label="ChuDo Production">
          <img src={logo} alt="ChuDo" />
        </a>
        <AnchorNav />
        <div className="header-meta">Видеопродакшн · Бишкек</div>
      </motion.header>

      <div className="hero-grid">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <p className="eyebrow">ChuDo Production · Бишкек · 2026</p>
          <h1 id="hero-title">
            <BlurText text="Видео," delay={180} stepDelay={55} />{' '}
            <span><BlurText text="которое продаёт" delay={360} stepDelay={50} /></span>{' '}
            <BlurText text="за вас." delay={620} stepDelay={50} />
          </h1>
          <p className="lead">
            Рекламные ролики, имиджевые фильмы и контент для соцсетей —
            снимаем так, чтобы клиент понял ценность продукта с первого просмотра.
          </p>
          <div className="hero-actions">
            <a
              className="button button--whatsapp button--shimmer"
              href="https://wa.me/996500669763"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в WhatsApp"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L.057 23.082a.75.75 0 0 0 .921.921l5.224-1.476A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.953-1.357l-.355-.211-3.676 1.039 1.04-3.594-.23-.37A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
              WhatsApp
            </a>
            <a
              className="button button--telegram button--shimmer"
              href="https://t.me/+996500669763"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в Telegram"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </a>
            <a className="button button--ghost" href="#cases" onClick={startAnchorScroll}>
              Смотреть работы
            </a>
          </div>
        </motion.div>

        <HeroVisual />
      </div>

      <footer className="hero-footer">
        <AnchorNav compact />
        <a className="scroll-hint" href="#market-pains" aria-label="Перейти к следующему блоку">
          <span>scroll</span>
          <i />
        </a>
      </footer>
    </section>
  );
}
