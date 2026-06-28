import { useState, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import InlineVideoPlayer from '../components/InlineVideoPlayer.jsx';
import VideoPlaylistTabs from '../components/VideoPlaylistTabs.jsx';
import DriveIcon from '../components/DriveIcon.jsx';
import { cases } from '../data/cases.js';
import { caseFilters } from '../data/caseFilters.js';
import { getVideoList, getPreviewMedia, getPlayableVideo } from '../lib/video.js';

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

export default function CasesSection() {
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

      <div className="cases-list">
        <AnimatePresence mode="wait">
          {filtered.map((item, index) => (
            <CaseCard key={item.id} item={item} index={index} onSelect={setSelectedCase} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedCase && <CaseModal item={selectedCase} onClose={() => setSelectedCase(null)} />}
      </AnimatePresence>
    </section>
  );
}
