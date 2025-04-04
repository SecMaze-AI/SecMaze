import { useEffect, useRef } from 'react';

/**
 * Custom hook to get the previous value of a state variable
 * @param {any} value - The value to track
 * @returns {any} The previous value
 */
const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

export default usePrevious; 