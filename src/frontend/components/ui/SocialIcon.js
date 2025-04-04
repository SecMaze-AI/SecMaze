import React from 'react';
import PropTypes from 'prop-types';

/**
 * SocialIcon component - Renders icons for social media platforms using unicode characters
 */
const SocialIcon = ({ type }) => {
  const getIcon = () => {
    switch (type.toLowerCase()) {
      case 'twitter':
      case 'x':
        return '𝕏';
      case 'facebook':
        return 'f';
      case 'whatsapp':
        return '✆';
      case 'linkedin':
        return 'in';
      case 'email':
        return '✉';
      case 'telegram':
        return '✈';
      case 'share':
        return '↗';
      default:
        return '•';
    }
  };
  
  return <span className="social-icon">{getIcon()}</span>;
};

SocialIcon.propTypes = {
  type: PropTypes.string.isRequired
};

export default SocialIcon; 