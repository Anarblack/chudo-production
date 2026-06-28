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
