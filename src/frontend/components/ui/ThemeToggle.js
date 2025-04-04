import React from 'react';
import styles from './ThemeToggle.module.css';
import { useTheme, THEME_MODES } from '../../contexts/ThemeContext';

/**
 * ThemeToggle component - Toggle button for switching between light and dark mode
 */
const ThemeToggle = () => {
  const { themePreference, setTheme, isDarkMode } = useTheme();
  
  const handleToggle = () => {
    // Cycle through theme options
    if (themePreference === THEME_MODES.LIGHT) {
      setTheme(THEME_MODES.DARK);
    } else if (themePreference === THEME_MODES.DARK) {
      setTheme(THEME_MODES.SYSTEM);
    } else {
      setTheme(THEME_MODES.LIGHT);
    }
  };
  
  const getToggleLabel = () => {
    switch (themePreference) {
      case THEME_MODES.LIGHT:
        return 'Light';
      case THEME_MODES.DARK:
        return 'Dark';
      default:
        return 'System';
    }
  };
  
  const getToggleIcon = () => {
    if (themePreference === THEME_MODES.SYSTEM) {
      return isDarkMode ? '🌙' : '☀️';
    }
    return themePreference === THEME_MODES.DARK ? '🌙' : '☀️';
  };
  
  return (
    <button 
      onClick={handleToggle}
      className={styles.themeToggle}
      aria-label={`Toggle theme, current: ${getToggleLabel()}`}
      title={`Theme: ${getToggleLabel()}`}
    >
      <span className={styles.themeIcon}>{getToggleIcon()}</span>
      <span className={styles.themeLabel}>{getToggleLabel()}</span>
    </button>
  );
};

export default ThemeToggle; 