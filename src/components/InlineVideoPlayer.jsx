import { getPlayableVideo, isDirectVideoUrl } from '../lib/video.js';

export default function InlineVideoPlayer({ video, poster, title, autoPlay = false }) {
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
