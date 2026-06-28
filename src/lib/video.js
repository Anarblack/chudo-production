export function driveVideo(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function driveView(fileId) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function driveThumbnail(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

export function makeDriveVideo(fileId, options = {}) {
  return {
    provider: 'drive',
    fileId,
    full: driveVideo(fileId),
    external: driveView(fileId),
    thumbnail: driveThumbnail(fileId),
    ...options,
  };
}

export function makeVideoSet(videos, options = {}) {
  const firstVideo = videos[0] ?? {};
  return {
    ...firstVideo,
    ...options,
    playlist: videos.map((video) => ({
      ...video,
      poster: video.poster ?? options.poster,
    })),
  };
}

export function makeDriveVideos(entries) {
  return entries.map(([fileId, label]) => makeDriveVideo(fileId, { label }));
}

export function isDirectVideoUrl(url) {
  return /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(url);
}

export function getDriveFileId(url) {
  return url?.match(/drive\.google\.com\/file\/d\/([^/]+)/i)?.[1] ?? null;
}

export function normalizeVideoSource(video) {
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

export function getPrimaryVideoSource(source) {
  if (!source) return null;

  if (source.full || source.src || source.preview) {
    return source;
  }

  return source.playlist?.[0] ?? source.videos?.[0] ?? null;
}

export function getVideoList(video, fallbackPoster) {
  const source = normalizeVideoSource(video);
  const list = source?.playlist ?? source?.videos ?? (source ? [source] : []);

  return list.map((clip, index) => ({
    ...clip,
    label: clip.label ?? `Видео ${index + 1}`,
    poster: clip.poster ?? source?.poster ?? fallbackPoster,
  }));
}

export function getPreviewMedia(video, fallbackImage) {
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

export function getPlayableVideo(video, fallbackPoster) {
  const source = getPrimaryVideoSource(normalizeVideoSource(video));
  const src = source?.full ?? source?.src ?? source?.preview;

  if (!src) return null;

  const fileId = source?.fileId ?? getDriveFileId(src);
  const isDrive = source?.provider === 'drive' || Boolean(fileId);

  let embed = null;
  if (isDrive && fileId) {
    embed = driveVideo(fileId);
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

export function getProjectMedia(item) {
  return getPreviewMedia(item.media, item.image) ?? {
    type: 'image',
    src: item.image,
  };
}
