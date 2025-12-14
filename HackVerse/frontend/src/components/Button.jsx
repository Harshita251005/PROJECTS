import React from 'react';

/**
 * Reusable button component with gradient background and hover animation.
 * Props:
 *  - children: button label
 *  - onClick: click handler
 *  - className: additional Tailwind classes
 */
const Button = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${className}`}
  >
    {children}
  </button>
);

export default Button;
