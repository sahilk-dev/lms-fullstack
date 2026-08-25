export const getYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/
  );
  return match ? match[1] : url.split('/').pop();
};