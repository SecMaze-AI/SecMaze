import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks';

// Create theme context
const ThemeContext = createContext();

// Theme options
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

/**
 * Theme provider component for handling theme preferences
 */
export const ThemeProvider = ({ children }) => {
  // Store theme preference in localStorage
  const [themePreference, setThemePreference] = useLocalStorage('themePreference', THEME_MODES.SYSTEM);
  const [currentTheme, setCurrentTheme] = useState(THEME_MODES.DARK); // Default to dark for initial render
  
  // Handle system preference changes
  useEffect(() => {
    // If theme preference is 'system', detect OS preference
    if (themePreference === THEME_MODES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        setCurrentTheme(e.matches ? THEME_MODES.DARK : THEME_MODES.LIGHT);
      };
      
      // Set initial value
      handleChange(mediaQuery);
      
      // Listen for changes
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } else {
      // Use stored preference
      setCurrentTheme(themePreference);
    }
  }, [themePreference]);
  
  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme classes
    root.classList.remove(THEME_MODES.LIGHT, THEME_MODES.DARK);
    
    // Add new theme class
    root.classList.add(currentTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        currentTheme === THEME_MODES.DARK ? '#1a202c' : '#ffffff'
      );
    }
  }, [currentTheme]);
  
  // Change theme function
  const setTheme = (mode) => {
    if (Object.values(THEME_MODES).includes(mode)) {
      setThemePreference(mode);
    }
  };
  
  // Context value
  const value = {
    themePreference,
    currentTheme,
    setTheme,
    isDarkMode: currentTheme === THEME_MODES.DARK
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 