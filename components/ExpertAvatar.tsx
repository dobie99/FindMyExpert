import React, { useState } from 'react';
import { Expert } from '../types';
import RobotIcon from './icons/RobotIcon';

interface ExpertAvatarProps {
  expert: Expert;
  className?: string;
  context: 'card' | 'chat';
}

const getInitials = (name: string): string => {
  const names = name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const ExpertAvatar: React.FC<ExpertAvatarProps> = ({ expert, className = "w-12 h-12", context }) => {
  const [imageError, setImageError] = useState(false);

  const hasImage = expert.imageUrl && !imageError;

  const handleImageError = () => {
    setImageError(true);
  };
  
  const getFontSizeClass = (sizeClass: string) => {
    if (sizeClass.includes('w-16')) return 'text-2xl';
    if (sizeClass.includes('w-12')) return 'text-xl';
    if (sizeClass.includes('w-10')) return 'text-lg';
    if (sizeClass.includes('w-8')) return 'text-md';
    if (sizeClass.includes('w-6')) return 'text-sm';
    return 'text-base';
  };

  const Fallback = () => {
    if (context === 'chat') {
      return (
        <div className={`${className} flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700`}>
          <RobotIcon className="w-3/5 h-3/5 text-gray-500 dark:text-gray-400" />
        </div>
      );
    }
    return (
      <div className={`${className} flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700`}>
        <span className={`font-bold text-gray-600 dark:text-gray-300 ${getFontSizeClass(className)}`}>
          {getInitials(expert.name)}
        </span>
      </div>
    );
  };
  
  if (!hasImage) {
    return <Fallback />;
  }

  return (
    <img
      src={expert.imageUrl}
      alt={`Portrait of ${expert.name}`}
      className={`${className} rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm`}
      onError={handleImageError}
    />
  );
};

export default ExpertAvatar;
