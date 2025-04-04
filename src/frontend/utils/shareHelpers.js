/**
 * Helper functions for sharing maze challenges on social media platforms
 */

/**
 * Generate share URLs for various social media platforms
 * @param {string} url - The URL to share
 * @param {Object} options - Sharing options
 * @param {string} options.seed - The maze seed
 * @param {number} options.difficulty - The maze difficulty level
 * @param {string} options.title - Optional custom title
 * @param {string} options.hashtags - Optional hashtags for platforms that support them
 * @returns {Object} Object containing sharing URLs for different platforms
 */
export const generateShareLinks = (url, options) => {
  const { seed, difficulty, title, hashtags } = options;
  
  // Default text
  const defaultText = `Can you solve this SecMaze challenge? Maze Seed: ${seed} Difficulty: ${difficulty}`;
  const shareText = title || defaultText;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  const encodedHashtags = hashtags ? encodeURIComponent(hashtags) : 'secmaze,cybersecurity,challenge';
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedHashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText} ${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent('Try this SecMaze Challenge')}&body=${encodedText} ${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };
};

/**
 * Copy text to clipboard with fallback for older browsers
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Generate a base URL for sharing a maze
 * @param {string} seed - The maze seed
 * @param {number} difficulty - The maze difficulty level
 * @returns {string} The shareable URL
 */
export const generateMazeShareUrl = (seed, difficulty) => {
  const baseUrl = window.location.origin + '/maze';
  return `${baseUrl}?seed=${seed}&difficulty=${difficulty}`;
}; 