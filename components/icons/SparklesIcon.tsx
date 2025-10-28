import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"/>
    <path d="M5 3l-1 2-2 1 2 1 1 2 1-2 2-1-2-1z"/>
    <path d="M19 13l-1 2-2 1 2 1 1 2 1-2 2-1-2-1z"/>
  </svg>
);

export default SparklesIcon;