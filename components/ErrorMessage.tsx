
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="p-6 my-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg dark:bg-red-900/20 dark:border-red-600">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-lg font-medium text-red-800 dark:text-red-200">{message}</p>
      </div>
    </div>
  </div>
);

export default ErrorMessage;
