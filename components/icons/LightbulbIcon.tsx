import React from 'react';

const LightbulbIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
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
    <path d="M15.09 16.05A6.5 6.5 0 0 1 8.91 9.95" />
    <path d="M9 9a6.5 6.5 0 0 1 6.14 7.05" />
    <path d="M12 21a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2Z" />
    <path d="M8.5 8.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5Z" />
    <path d="M12 3a1 1 0 0 0 1-1V1a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1Z" />
    <path d="M20 12a1 1 0 0 0-1 1h0a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1h0a1 1 0 0 0-1-1Z" />
    <path d="M4 12a1 1 0 0 0-1 1h0a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1h0a1 1 0 0 0-1-1Z" />
    <path d="M18.36 5.64a1 1 0 0 0 .71-.29l.7-.71a1 1 0 0 0-1.41-1.41l-.71.7a1 1 0 0 0 .7 1.71Z" />
    <path d="M5.64 18.36a1 1 0 0 0 .71-.29l.7-.71a1 1 0 0 0-1.41-1.41l-.71.7a1 1 0 0 0 .7 1.71Z" />
  </svg>
);

export default LightbulbIcon;