import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'framer-motion';
import logo from '../assets/chudo-logo-new.png';

const CameraSceneLazy = React.lazy(() => import('./CameraScene.jsx'));
import CustomCursor from './components/CustomCursor.jsx';
import BlurText from './components/BlurText.jsx';
import PartnersSection from './components/PartnersSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import IntroAnimation from './components/IntroAnimation.jsx';
import { shouldShowIntro, markIntroSeen } from './lib/intro.js';
import { navItems } from './data/navItems.js';
import { cameraTags } from './data/cameraTags.js';
import { painScenes, painMotionProfiles, painItemVariants } from './data/painScenes.js';
import { services } from './data/services.js';
import { projectVideos } from './data/projectVideos.js';
import { portfolioItems } from './data/portfolioItems.js';
import { comparisonItems } from './data/comparisonItems.js';
import { caseFilters } from './data/caseFilters.js';
import { cases } from './data/cases.js';
import { workflowSteps } from './data/workflowSteps.js';
import { workflowStats } from './data/workflowStats.js';
import { driveVideo, driveView, driveThumbnail } from './lib/video.js';

// Prevents IntersectionObserver from changing accordion state during anchor-scroll,
// which would shift the page height and cause smooth scroll to land at the wrong target.
let _anchorScrollActive = false;
let _anchorScrollTimer = null;

function _startAnchorScroll() {
  _anchorScrollActive = true;
  clearTimeout(_anchorScrollTimer);
  // 1300ms covers any smooth-scroll distance on this page; unblocks IntersectionObserver after landing
  _anchorScrollTimer = setTimeout(() => { _anchorScrollActive = false; }, 1300);
}

function AnchorNav({ compact = false }) {
  return (
    <nav className={compact ? 'anchor-nav anchor-nav--compact' : 'anchor-nav'} aria-label="Навигация по предложению">
      {navItems.map((item) => (
        <a key={item.href} href={item.href} onClick={_startAnchorScroll}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function StickyNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`sticky-nav${visible ? ' sticky-nav--visible' : ''}`}
      aria-hidden={!visible}
    >
      <AnchorNav compact />
    </div>
  );
}

function MarketPainsSection() {
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
                    {word}{index < questionWords.length - 1 ? '\u00a0' : ''}
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener('change', update);

    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

  return isMobile;
}

function getServiceMatches(serviceTitle) {
  const matches = portfolioItems.filter((item) => item.serviceType === serviceTitle);
  return matches.length ? matches : portfolioItems;
}

function getSphericalPoint(index, total) {
  if (total <= 1) {
    return { x: 0, y: 0, z: 1 };
  }

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / (total - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = index * goldenAngle;

  return {
    x: Math.cos(theta) * radius,
    y,
    z: Math.sin(theta) * radius,
  };
}

function rotatePoint(point, rotation) {
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);

  const x1 = point.x * cosY + point.z * sinY;
  const z1 = -point.x * sinY + point.z * cosY;
  const y2 = point.y * cosX - z1 * sinX;
  const z2 = point.y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

function getFrontPortfolioItem(rotation) {
  return portfolioItems.reduce(
    (front, item, index) => {
      const point = rotatePoint(getSphericalPoint(index, portfolioItems.length), rotation);

      if (point.z > front.z) {
        return { item, z: point.z };
      }

      return front;
    },
    { item: portfolioItems[0], z: -Infinity },
  ).item;
}

function isDirectVideoUrl(url) {
  return /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(url);
}

function getDriveFileId(url) {
  return url?.match(/drive\.google\.com\/file\/d\/([^/]+)/i)?.[1] ?? null;
}

function normalizeVideoSource(video) {
  if (!video) return null;

  if (Array.isArray(video)) {
    return { playlist: video };
  }

  if (typeof video === 'string') {
    return {
      full: video,
      preview: video,
    };
  }

  return video;
}

function getPrimaryVideoSource(source) {
  if (!source) return null;

  if (source.full || source.src || source.preview) {
    return source;
  }

  return source.playlist?.[0] ?? source.videos?.[0] ?? null;
}

function getVideoList(video, fallbackPoster) {
  const source = normalizeVideoSource(video);
  const list = source?.playlist ?? source?.videos ?? (source ? [source] : []);

  return list.map((clip, index) => ({
    ...clip,
    label: clip.label ?? `Видео ${index + 1}`,
    poster: clip.poster ?? source?.poster ?? fallbackPoster,
  }));
}

function getPreviewMedia(video, fallbackImage) {
  const normalizedSource = normalizeVideoSource(video);
  const source = getPrimaryVideoSource(normalizedSource);
  const poster = source?.thumbnail ?? normalizedSource?.thumbnail ?? source?.poster ?? normalizedSource?.poster ?? fallbackImage;
  const preview = source?.preview ?? (source?.provider === 'drive' ? null : source?.src ?? source?.full);

  if (preview && isDirectVideoUrl(preview)) {
    return {
      type: 'video',
      src: preview,
      poster,
    };
  }

  if (poster) {
    return {
      type: 'image',
      src: poster,
    };
  }

  return null;
}

function getPlayableVideo(video, fallbackPoster) {
  const source = getPrimaryVideoSource(normalizeVideoSource(video));
  const src = source?.full ?? source?.src ?? source?.preview;

  if (!src) return null;

  const fileId = source?.fileId ?? getDriveFileId(src);
  const isDrive = source?.provider === 'drive' || Boolean(fileId);

  // Готовый URL для встраивания: iframe для Drive, прямой URL для нативного <video>
  let embed = null;
  if (isDrive && fileId) {
    embed = driveVideo(fileId); // /preview iframe
  } else if (isDirectVideoUrl(src)) {
    embed = src;
  }

  return {
    src,
    poster: source?.poster ?? fallbackPoster,
    provider: isDrive ? 'drive' : source?.provider,
    external: source?.external ?? (fileId ? driveView(fileId) : src),
    embed,
    fileId,
    label: source?.label,
    thumbnail: source?.thumbnail ?? (fileId ? driveThumbnail(fileId) : null),
  };
}

function getProjectMedia(item) {
  return getPreviewMedia(item.media, item.image) ?? {
    type: 'image',
    src: item.image,
  };
}

function ProjectMedia({ item, mode = 'preview', loading = 'lazy', draggable = false }) {
  const [imgError, setImgError] = useState(false);
  const media = getProjectMedia(item);
  const isPlayer = mode === 'player';

  if (!media) return null;

  if (media.type === 'video') {
    return (
      <video
        src={media.src}
        poster={media.poster}
        muted={!isPlayer}
        loop={!isPlayer}
        autoPlay={!isPlayer}
        playsInline
        controls={isPlayer}
        preload={isPlayer ? 'auto' : 'metadata'}
      />
    );
  }

  if (imgError) return null;

  return <img src={media.src} alt="" loading={loading} draggable={draggable} onError={() => setImgError(true)} />;
}


// SVG-иконка треугольника Drive — лёгкая, без зависимостей
function DriveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M7.71 3.5L1.15 15l3.42 5.5h7.86L8.85 15l3.58-11.5H7.71zm6.43 0L19.57 15h-7.14L6.93 3.5h7.21zM12.85 15l3.58-5.5h6.42L19.43 15h-6.58z" />
    </svg>
  );
}

// Встроенный плеер: iframe для Drive, нативный <video> для прямых ссылок,
// плейсхолдер если ничего нет. Управляется снаружи — родитель решает, какой клип показать.
function InlineVideoPlayer({ video, poster, title, autoPlay = false }) {
  const playable = getPlayableVideo(video, poster);

  if (!playable) {
    return (
      <div className="inline-player inline-player--empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
        </svg>
        <p>Видео скоро появится</p>
      </div>
    );
  }

  // Google Drive — встраиваем iframe /preview
  if (playable.provider === 'drive' && playable.embed) {
    return (
      <iframe
        src={playable.embed}
        title={title || 'Видео'}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  // Прямой mp4/webm — нативный <video> с контролами
  if (isDirectVideoUrl(playable.src)) {
    return (
      <video
        src={playable.src}
        poster={playable.poster}
        controls
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
      />
    );
  }

  // Совсем экзотика — показываем постер и даём ссылку наружу как последнее средство
  return (
    <div className="inline-player inline-player--fallback">
      {playable.poster && <img src={playable.poster} alt="" />}
      <a
        className="button button--primary"
        href={playable.external}
        target="_blank"
        rel="noopener noreferrer"
      >
        Открыть видео
      </a>
    </div>
  );
}

// Табы плейлиста — переключают активный клип внутри модала.
// Если ролик один — компонент сам решает не рендериться.
function VideoPlaylistTabs({ videos, activeIndex, onSelect, className = '' }) {
  if (!videos || videos.length <= 1) return null;
  return (
    <div className={`video-playlist ${className}`.trim()} role="tablist" aria-label="Список видео">
      {videos.map((clip, i) => (
        <button
          key={`${clip.full ?? clip.src ?? i}`}
          type="button"
          role="tab"
          aria-selected={i === activeIndex}
          className={`video-playlist__tab${i === activeIndex ? ' is-active' : ''}`}
          onClick={() => onSelect(i)}
        >
          <span className="video-playlist__num">{String(i + 1).padStart(2, '0')}</span>
          <span className="video-playlist__label">{clip.label ?? `Ролик ${i + 1}`}</span>
        </button>
      ))}
    </div>
  );
}

function VideoModal({ item, onClose }) {
  const videos = getVideoList(item?.media, item?.image);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeClip = videos[activeIndex] ?? videos[0] ?? null;
  const activePlayable = getPlayableVideo(activeClip ?? item?.media, item?.image);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="video-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      >
        <motion.div
          className="video-modal-box"
          initial={{ scale: 0.9, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="video-modal-close"
            onClick={onClose}
            aria-label="Закрыть"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="video-modal-meta">
            <span className="video-modal-category">{item.category}</span>
            <strong className="video-modal-title">{item.title}</strong>
          </div>
          <div className="video-modal-poster">
            <InlineVideoPlayer
              key={activeIndex}
              video={activeClip ?? item?.media}
              poster={item?.image}
              title={`${item.title}${activeClip?.label ? ` — ${activeClip.label}` : ''}`}
            />
          </div>
          <VideoPlaylistTabs
            videos={videos}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            className="video-modal-playlist"
          />
          {activePlayable?.external && (
            <div className="video-modal-actions">
              <a
                className="video-modal-drive-link"
                href={activePlayable.external}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DriveIcon />
                Открыть в Google Drive
              </a>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PortfolioCard({ item, style, isActive, isDimmed, onSelect }) {
  return (
    <motion.button
      type="button"
      className={[
        'portfolio-card',
        isActive ? 'is-active' : '',
        isDimmed ? 'is-dimmed' : '',
      ].join(' ')}
      style={style}
      // Если активная — останавливаем propagation на mousedown/pointerdown
      // чтобы stage не начинал drag при клике на активную карточку
      onPointerDown={(e) => { if (isActive) e.stopPropagation(); }}
      onPointerUp={(e) => {
        if (isActive) {
          e.stopPropagation();
          onSelect();
        }
      }}
      onMouseDown={(e) => { if (isActive) e.stopPropagation(); }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      aria-pressed={isActive}
      aria-label={`${item.title}. ${item.category}${isActive ? ' — нажмите для просмотра' : ''}`}
      initial={false}
      animate={{ opacity: isDimmed ? 0.24 : 1 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      <ProjectMedia item={item} draggable={false} />
      <span className="portfolio-card__shade" />
      {isActive && (
        <span className="portfolio-card__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none' }}>
            <circle cx="12" cy="12" r="12" fillOpacity="0.55" />
            <path d="M10 8l6 4-6 4V8z" />
          </svg>
        </span>
      )}
      <span className="portfolio-card__meta" style={{ pointerEvents: 'none' }}>
        <span>{item.category}</span>
        <strong>{item.title}</strong>
        <small>{item.serviceType}</small>
      </span>
    </motion.button>
  );
}

function PortfolioSphere({ activeService, activeItem, onSelectItem, onOpenVideo }) {
  const isMobile = useIsMobile();
  const stageRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0, rotation: { x: -0.16, y: 0.34 } });
  const dragMoved = useRef(false);
  const isDraggingRef = useRef(false);
  const lastInteraction = useRef(0);
  const [rotation, setRotation] = useState({ x: -0.16, y: 0.34 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const relatedItems = useMemo(() => getServiceMatches(activeService.title), [activeService.title]);
  const relatedIds = useMemo(() => new Set(relatedItems.map((item) => item.id)), [relatedItems]);
  const serviceHasMatches = relatedItems.length > 0;

  useEffect(() => {
    let frameId = 0;
    let previous = performance.now();
    const tick = (now) => {
      const delta = Math.min(48, now - previous);
      previous = now;
      if (!isHovering && !isDraggingRef.current && now - lastInteraction.current > 3600) {
        setRotation((cur) => ({ x: cur.x, y: cur.y + delta * 0.00013 }));
      }
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [isHovering]);

  const cards = useMemo(() => {
    const width = isMobile ? 0 : 250;
    const height = isMobile ? 0 : 150;
    return portfolioItems.map((item, index) => {
      const point = rotatePoint(getSphericalPoint(index, portfolioItems.length), rotation);
      const depth = (point.z + 1) / 2;
      const isActive = item.id === activeItem.id;
      const matchesService = !serviceHasMatches || relatedIds.has(item.id);
      const screenX = isActive ? point.x * width * 0.16 : point.x * width;
      const screenY = isActive ? point.y * height * 0.14 : point.y * height;
      const scale = isActive ? 1.16 : 0.58 + depth * 0.34;
      const opacity = 1; // все карточки непрозрачные
      const rotateY = isActive ? 0 : point.x * -24;
      const rotateX = isActive ? 0 : point.y * 14;
      return {
        item, isActive,
        isDimmed: serviceHasMatches && !matchesService,
        style: {
          '--card-x': `${screenX}px`, '--card-y': `${screenY}px`,
          '--card-z': `${Math.round(point.z * 120)}px`, '--card-scale': scale,
          '--card-opacity': opacity, '--card-rotate-x': `${rotateX}deg`,
          '--card-rotate-y': `${rotateY}deg`,
          zIndex: isActive ? 80 : Math.round(depth * 60),
        },
      };
    });
  }, [activeItem.id, isMobile, relatedIds, rotation, serviceHasMatches]);

  const markInteraction = () => { lastInteraction.current = performance.now(); };

  const handleCardClick = (item, isActive) => {
    markInteraction();
    if (isActive) {
      // Активная карточка — всегда открываем видео
      // (drag уже заблокирован через stopPropagation в PortfolioCard)
      onOpenVideo(item);
    } else {
      // Неактивная — только если не было drag
      if (dragMoved.current) return;
      onSelectItem(item);
    }
  };

  const handlePointerDown = (e) => {
    if (isMobile) return;
    isDraggingRef.current = true;
    dragMoved.current = false;
    setIsDragging(true);
    markInteraction();
    dragStart.current = { x: e.clientX, y: e.clientY, rotation };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || isMobile) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved.current = true;
    const nextRotation = {
      x: Math.max(-0.72, Math.min(0.72, dragStart.current.rotation.x - dy * 0.006)),
      y: dragStart.current.rotation.y + dx * 0.008,
    };
    const frontItem = getFrontPortfolioItem(nextRotation);
    setRotation(nextRotation);
    if (frontItem.id !== activeItem.id) onSelectItem(frontItem);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    markInteraction();
    requestAnimationFrame(() => { dragMoved.current = false; });
  };

  if (isMobile) {
    return (
      <div className="portfolio-mobile">
        <div className="portfolio-mobile__rail" aria-label="Портфолио Chudo Prod">
          {relatedItems.map((item) => (
            <button
              type="button"
              className={item.id === activeItem.id ? 'portfolio-mobile-card is-active' : 'portfolio-mobile-card'}
              key={item.id}
              onClick={() => handleCardClick(item, item.id === activeItem.id)}
            >
              <ProjectMedia item={item} />
              <span>{item.category}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={isDragging ? 'portfolio-sphere is-dragging' : 'portfolio-sphere'}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => { setIsHovering(false); handlePointerUp(); }}
    >
      <div className="portfolio-orbits" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div
        className="portfolio-sphere__stage"
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Интерактивная 3D-галерея портфолио Chudo Prod"
      >
        {cards.map(({ item, style, isActive, isDimmed }) => (
          <PortfolioCard
            item={item}
            style={style}
            isActive={isActive}
            isDimmed={isDimmed}
            key={item.id}
            onSelect={() => handleCardClick(item, isActive)}
          />
        ))}
      </div>
    </div>
  );
}

function ServicesList({
  activeService,
  selectedService,
  onServiceSelect,
  onServicePreview,
  onServicePreviewEnd,
}) {
  return (
    <div className="services-list" role="list">
      {services.map((service, index) => {
        const isActive = activeService.title === service.title;
        const isSelected = selectedService.title === service.title;

        return (
          <motion.button
            className={isActive ? 'service-item is-active' : 'service-item'}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onServiceSelect(service)}
            onFocus={() => onServicePreview(service)}
            onBlur={onServicePreviewEnd}
            onPointerEnter={() => onServicePreview(service)}
            onPointerLeave={onServicePreviewEnd}
            onMouseEnter={() => onServicePreview(service)}
            onMouseLeave={onServicePreviewEnd}
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.42, delay: index * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
            key={service.title}
          >
            <span className="service-item__number">{String(index + 1).padStart(2, '0')}</span>
            <span className="service-item__content">
              <span className="service-item__title">{service.title}</span>
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    className="service-item__description"
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  >
                    {service.description}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function OfferSection() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [hoveredService, setHoveredService] = useState(null);
  const [activeItemId, setActiveItemId] = useState(portfolioItems[0].id);
  const [videoItem, setVideoItem] = useState(null);
  const activeService = hoveredService ?? selectedService;
  const activeItem = portfolioItems.find((item) => item.id === activeItemId) ?? portfolioItems[0];
  const activeVideoCount = getVideoList(activeItem.media, activeItem.image).length;

  useEffect(() => {
    const matches = getServiceMatches(activeService.title);

    if (!matches.some((item) => item.id === activeItemId)) {
      setActiveItemId(matches[0].id);
    }
  }, [activeItemId, activeService.title]);

  const selectPortfolioItem = (item) => {
    const linkedService = services.find((service) => service.title === item.serviceType);

    setActiveItemId(item.id);
    setHoveredService(null);

    if (linkedService) {
      setSelectedService(linkedService);
    }
  };

  return (
    <section
      id="offer"
      className="offer-section"
      aria-labelledby="offer-title"
      style={{
        '--service-accent': activeService.visualTheme.accent,
        '--service-glow': activeService.visualTheme.glow,
      }}
    >
      <motion.div
        className="offer-showreel"
        initial={{ opacity: 0, y: 28, filter: 'blur(18px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.34 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <PortfolioSphere
          activeService={activeService}
          activeItem={activeItem}
          onSelectItem={selectPortfolioItem}
          onOpenVideo={setVideoItem}
        />
      </motion.div>

      <div className="offer-panel">
        <motion.div
          className="offer-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.44 }}
          transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <p className="eyebrow">Наши решения</p>
          <h2 id="offer-title">Решения под задачу</h2>
          <p>
            Закрываем не только съёмку, но и задачу: продвижение, продажи, соцсети, имидж
            и регулярный контент.
          </p>
        </motion.div>

        <ServicesList
          activeService={activeService}
          selectedService={selectedService}
          onServiceSelect={setSelectedService}
          onServicePreview={setHoveredService}
          onServicePreviewEnd={() => setHoveredService(null)}
        />

        <button
          type="button"
          className="offer-video-cta"
          onClick={() => setVideoItem(activeItem)}
        >
          <span>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 7.5v9l7-4.5-7-4.5z" />
            </svg>
            Смотреть ролики
          </span>
          <em>{activeVideoCount} видео</em>
        </button>
      </div>
      {videoItem && <VideoModal item={videoItem} onClose={() => setVideoItem(null)} />}
    </section>
  );
}

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
      {/* Левая карточка — обычная съёмка */}
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

      {/* Стрелка-трансформ */}
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

      {/* Правая карточка — подход ChuDo */}
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

function UniqueValueSection() {
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

function CaseFilters({ activeFilter, onFilterChange }) {
  return (
    <motion.div
      className="case-filters"
      role="tablist"
      aria-label="Фильтры кейсов"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.52, delay: 0.12, ease: 'easeOut' }}
    >
      {caseFilters.map((filter) => {
        const isActive = activeFilter === filter;

        return (
          <button
            type="button"
            className={isActive ? 'case-filter is-active' : 'case-filter'}
            role="tab"
            aria-selected={isActive}
            key={filter}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        );
      })}
    </motion.div>
  );
}

function CaseCard({ item, index, onSelect }) {
  const videoRef = useRef(null);
  const [thumbError, setThumbError] = useState(false);
  const previewMedia = getPreviewMedia(item.video, item.image);
  const videoCount = getVideoList(item.videos ?? item.video, item.image).length;

  return (
    <motion.button
      type="button"
      className="case-card"
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
      aria-label={`Смотреть кейс ${item.title}`}
    >
      {/* Превью */}
      <div className="case-card__thumb">
        {previewMedia?.type === 'video' ? (
          <video
            ref={videoRef}
            src={previewMedia.src}
            poster={previewMedia.poster}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : previewMedia?.type === 'image' && !thumbError ? (
          <img src={previewMedia.src} alt="" loading="lazy" draggable={false} onError={() => setThumbError(true)} />
        ) : (
          <div className="case-card__thumb-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/>
            </svg>
          </div>
        )}
        <div className="case-card__thumb-overlay">
          <svg className="case-card__play-icon" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="12" fillOpacity="0.5"/>
            <path d="M10 8l6 4-6 4V8z"/>
          </svg>
        </div>
      </div>

      {/* Контент */}
      <div className="case-card__body">
        <div className="case-card__header">
          <span className="case-card__category">{item.category}</span>
          <span className="case-card__type">{item.type}</span>
        </div>
        <strong className="case-card__title">{item.title}</strong>
        <div className="case-card__tags">
          {item.formats.slice(0, 3).map((f) => <em key={f}>{f}</em>)}
        </div>
        {videoCount > 1 && <span className="case-card__count">{videoCount} видео</span>}
      </div>

      {/* Стрелка */}
      <div className="case-card__arrow">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 10h12M12 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.button>
  );
}

function CaseModal({ item, onClose }) {
  const videos = getVideoList(item.videos ?? item.video, item.image);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeClip = videos[activeIndex] ?? videos[0] ?? null;
  const activePlayable = getPlayableVideo(activeClip ?? item.video, item.image);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <motion.div
      className="case-modal-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{ cursor: 'auto' }}
    >
      <button type="button" className="case-modal__close" onClick={onClose} aria-label="Закрыть">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <motion.article
        className="case-modal"
        role="dialog" aria-modal="true"
        aria-labelledby={`case-modal-title-${item.id}`}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="case-modal__media">
          <InlineVideoPlayer
            key={activeIndex}
            video={activeClip ?? item.video}
            poster={item.image}
            title={`${item.title}${activeClip?.label ? ` — ${activeClip.label}` : ''}`}
          />
        </div>
        <VideoPlaylistTabs
          videos={videos}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          className="case-modal__playlist"
        />

        <div className="case-modal__body">
          <p className="case-modal__kicker">{item.category} · {item.type}</p>
          <h3 id={`case-modal-title-${item.id}`}>{item.title}</h3>
          <div className="case-modal__section"><span>Задача</span><p>{item.task}</p></div>
          <div className="case-modal__section"><span>Решение</span><p>{item.solution}</p></div>
          <div className="case-modal__section">
            <span>Форматы</span>
            <div className="case-modal__formats">
              {item.formats.map((f) => <em key={f}>{f}</em>)}
            </div>
          </div>
          <div className="case-modal__ctas">
            <a className="button button--primary" href="#contact" onClick={onClose}>
              Обсудить похожий проект
            </a>
            {activePlayable?.external && (
              <a
                className="case-modal__drive-link"
                href={activePlayable.external}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DriveIcon />
                Открыть в Google Drive
              </a>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function CasesSection() {
  const [activeFilter, setActiveFilter] = useState('Все');
  const [selectedCase, setSelectedCase] = useState(null);

  const filtered = useMemo(() => {
    if (activeFilter === 'Все') return cases;
    return cases.filter((c) => c.category === activeFilter || c.tags.includes(activeFilter));
  }, [activeFilter]);

  return (
    <section id="cases" className="cases-section" aria-labelledby="cases-title">
      <div className="cases-grain" aria-hidden="true" />

      <motion.header
        className="cases-heading"
        initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="cases-heading__text">
          <p className="eyebrow">Наши работы</p>
          <h2 id="cases-title">Проекты, которые мы сделали</h2>
        </div>
        {/* Фильтры */}
        <div className="case-filters" role="group" aria-label="Фильтр по категории">
          {caseFilters.map((f) => (
            <button
              key={f}
              type="button"
              className={f === activeFilter ? 'case-filter is-active' : 'case-filter'}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Список кейсов */}
      <div className="cases-list">
        <AnimatePresence mode="wait">
          {filtered.map((item, index) => (
            <CaseCard key={item.id} item={item} index={index} onSelect={setSelectedCase} />
          ))}
        </AnimatePresence>
      </div>

      {/* Модал */}
      <AnimatePresence>
        {selectedCase && <CaseModal item={selectedCase} onClose={() => setSelectedCase(null)} />}
      </AnimatePresence>
    </section>
  );
}

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

function WorkflowStepCard({
  step,
  index,
  isActive,
  onSelect,
  registerStep,
  activeTab,
  onTabChange,
}) {
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

function WorkflowTimeline({
  activeIndex,
  activeTab,
  onStepSelect,
  onTabChange,
  progressScale,
  registerStep,
}) {
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

function WorkflowSection() {
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
        if (_anchorScrollActive) return;

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

function App() {
  const [introVisible, setIntroVisible] = useState(true);

  function handleIntroComplete() {
    setIntroVisible(false);
  }

  return (
    <main className="site-shell">
      {introVisible && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}
      <CustomCursor />
      <StickyNav />
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
              <a className="button button--ghost" href="#cases" onClick={_startAnchorScroll}>
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

      <MarketPainsSection />
      <OfferSection />
      <UniqueValueSection />
      <CasesSection />
      <WorkflowSection />
      <PartnersSection />
      <ContactSection />
    </main>
  );
}

export default App;
