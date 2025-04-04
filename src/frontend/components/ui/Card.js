import React from 'react';
import PropTypes from 'prop-types';
import styles from './Card.module.css';

/**
 * Card component - Container with styling for displaying content in a card format
 */
const Card = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'bordered', 'interactive']),
  className: PropTypes.string
};

export default Card; 