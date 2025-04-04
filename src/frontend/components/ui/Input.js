import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

/**
 * Input component - Reusable input field with various states
 */
const Input = forwardRef(({
  type = 'text',
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  required = false,
  ...props
}, ref) => {
  const inputClasses = [
    styles.input,
    error ? styles.error : '',
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ');

  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={inputClasses}
        aria-invalid={!!error}
        {...props}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  required: PropTypes.bool
};

export default Input; 