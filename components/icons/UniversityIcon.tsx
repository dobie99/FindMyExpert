
import React from 'react';

const UniversityIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
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
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M12 21v-4" />
    <path d="M10 13h4" />
    <path d="M10 9h4" />
    <path d="M12 17v-4" />
  </svg>
);

export default UniversityIcon;
