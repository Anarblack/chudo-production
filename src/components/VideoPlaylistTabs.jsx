export default function VideoPlaylistTabs({ videos, activeIndex, onSelect, className = '' }) {
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
