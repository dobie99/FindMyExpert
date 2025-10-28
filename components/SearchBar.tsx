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

const countryOptions = [
  "", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia",
  "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
"Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "USA", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const stateOptions = [
  "", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida",
  "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
  "Puerto Rico", "Guam", "American Samoa", "U.S. Virgin Islands"
];

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, filters, onFilterChange, onSearch, isLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLocalFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <FilterInput name="university" label="University" value={filters.university} onChange={handleLocalFilterChange} placeholder="e.g., MIT" />
            <FilterInput name="department" label="Department" value={filters.department} onChange={handleLocalFilterChange} placeholder="e.g., Computer Science" />
            <FilterInput name="keywords" label="Keywords in Expertise" value={filters.keywords} onChange={handleLocalFilterChange} placeholder="e.g., machine learning" />
            <FilterSelect name="country" label="Country" value={filters.country} onChange={handleLocalFilterChange} options={countryOptions} />
            <FilterSelect name="state" label="State" value={filters.state} onChange={handleLocalFilterChange} options={stateOptions} />
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

const FilterSelect: React.FC<{ name: keyof Filters, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: readonly string[] }> = ({ name, label, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
    >
      {options.map((option, index) => (
        <option key={index} value={option}>{option || `Any ${label}`}</option>
      ))}
    </select>
  </div>
);

export default SearchBar;