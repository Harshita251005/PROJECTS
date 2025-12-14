import React from 'react';

/**
 * Reusable Card component with glassmorphism styling.
 * Props:
 *   - children: content inside the card
 *   - className: additional Tailwind classes
 */
const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
);

export default Card;
