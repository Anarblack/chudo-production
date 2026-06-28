import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import InlineVideoPlayer from '../components/InlineVideoPlayer.jsx';
import VideoPlaylistTabs from '../components/VideoPlaylistTabs.jsx';
import DriveIcon from '../components/DriveIcon.jsx';
import ProjectMedia from '../components/ProjectMedia.jsx';
import { services } from '../data/services.js';
import { portfolioItems } from '../data/portfolioItems.js';
import { getVideoList, getPlayableVideo } from '../lib/video.js';
import { useIsMobile } from '../lib/hooks.js';
import { getServiceMatches, getSphericalPoint, rotatePoint, getFrontPortfolioItem } from '../lib/sphere.js';

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
      const opacity = 1;
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
      onOpenVideo(item);
    } else {
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

function ServicesList({ activeService, selectedService, onServiceSelect, onServicePreview, onServicePreviewEnd }) {
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

export default function OfferSection() {
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
