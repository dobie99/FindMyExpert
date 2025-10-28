
import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface AISuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12 p-6 bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-lg dark:bg-gray-800/70 dark:border-gray-700/80">
      <div className="flex items-center mb-4">
        <SparklesIcon className="w-6 h-6 text-blue-500 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Refine Your Search
        </h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-4 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;