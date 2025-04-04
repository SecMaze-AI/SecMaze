import { useState, useEffect } from 'react';

/**
 * Custom hook to persist state in localStorage
 * @param {string} key - The localStorage key to store the value under
 * @param {any} initialValue - The initial value to use if no value is found in localStorage
 * @returns {[any, Function]} The current state value and a setter function
 */
const useLocalStorage = (key, initialValue) => {
  // Get stored value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return initialValue;
    }
  });
  
  // Update localStorage when the state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function like React's setState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update state
      setStoredValue(valueToStore);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  };
  
  // If the key changes, update the stored value
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? JSON.parse(item) : initialValue);
      } catch (error) {
        console.error(`Error updating ${key} in localStorage:`, error);
      }
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue];
};

export default useLocalStorage; 