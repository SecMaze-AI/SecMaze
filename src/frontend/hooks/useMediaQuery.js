import { useState, useEffect } from 'react';

/**
 * Custom hook to check if a media query matches
 * @param {string} query - The media query to check
 * @returns {boolean} True if the media query matches
 */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check if window is available (for SSR)
    if (typeof window === 'undefined') {
      return;
    }
    
    // Create a media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Define event listener
    const handleChange = (event) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    if (mediaQuery.addEventListener) {
      // Modern browsers
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Older browsers
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);
  
  return matches;
};

export default useMediaQuery; 