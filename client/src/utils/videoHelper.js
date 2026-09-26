/**
 * Converts a YouTube watch URL to an embeddable URL
 * e.g. https://www.youtube.com/watch?v=abc123
 *      becomes https://www.youtube.com/embed/abc123
 */
export const getEmbedUrl = (url) => {
  if (!url) return null;

  try {
    // Handle youtu.be short links
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    // Handle standard youtube.com/watch?v= links
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Handle already embedded URLs
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // Return original URL for non-YouTube links
    return url;
  } catch {
    return url;
  }
};

export const isYouTubeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};
