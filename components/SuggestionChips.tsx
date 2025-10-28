import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onChipClick: (suggestion: string) => void;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onChipClick }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-4 max-w-3xl mx-auto">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">
        Try searching for:
      </p>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onChipClick(suggestion)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm font-semibold hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors duration-200 ease-in-out"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;
