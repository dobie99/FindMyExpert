import React, { useState } from 'react';
import SearchIcon from './icons/SearchIcon';
import FilterIcon from './icons/FilterIcon';
import { Filters } from '../types';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onSearch: (query: string, filters: Filters) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, filters, onFilterChange, onSearch, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLocalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim(), filters);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center shadow-lg rounded-full">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="e.g., Quantum Computing, Renaissance Art, AI Ethics..."
            className="w-full py-4 pl-6 pr-28 text-gray-700 bg-white border-2 border-transparent rounded-full appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/30 dark:bg-gray-700 dark:text-gray-200 dark:focus:ring-blue-500/50 transition-shadow duration-300"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle advanced search"
              aria-expanded={showAdvanced}
            >
              <FilterIcon className="w-6 h-6" />
            </button>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex items-center justify-center w-12 h-12 ml-1 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
              aria-label="Search"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-solid rounded-full border-t-transparent animate-spin"></div>
              ) : (
                <SearchIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </form>

      {showAdvanced && (
        <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Advanced Search Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FilterInput name="university" label="University" value={filters.university} onChange={handleLocalFilterChange} placeholder="e.g., MIT" />
            <FilterInput name="department" label="Department" value={filters.department} onChange={handleLocalFilterChange} placeholder="e.g., Computer Science" />
            <FilterInput name="keywords" label="Keywords in Expertise" value={filters.keywords} onChange={handleLocalFilterChange} placeholder="e.g., machine learning" />
            <FilterInput name="country" label="Country" value={filters.country} onChange={handleLocalFilterChange} placeholder="e.g., USA" />
            <FilterInput name="state" label="State" value={filters.state} onChange={handleLocalFilterChange} placeholder="e.g., California" />
            <FilterInput name="zipCode" label="Zip Code" value={filters.zipCode} onChange={handleLocalFilterChange} placeholder="e.g., 94043" />
          </div>
        </div>
      )}
    </div>
  );
};

const FilterInput: React.FC<{ name: keyof Filters, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string }> = ({ name, label, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
    />
  </div>
);


export default SearchBar;