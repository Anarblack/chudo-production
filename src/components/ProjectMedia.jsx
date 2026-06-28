import { useState } from 'react';
import { getProjectMedia } from '../lib/video.js';

export default function ProjectMedia({ item, mode = 'preview', loading = 'lazy', draggable = false }) {
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
