
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Searching for experts...</p>
  </div>
);

export default LoadingSpinner;
