import React, { useState } from 'react';
import { Expert, ExpertDetails } from '../types';
import UniversityIcon from './icons/UniversityIcon';
import DepartmentIcon from './icons/DepartmentIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import MailIcon from './icons/MailIcon';

interface ExpertCardProps {
  expert: Expert;
  isExpanded: boolean;
  onToggle: () => void;
  onContact: (expert: Expert) => void;
  details?: ExpertDetails;
  isLoadingDetails: boolean;
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, isExpanded, onToggle, onContact, details, isLoadingDetails }) => {
  const [isJustificationVisible, setIsJustificationVisible] = useState(false);

  const handleJustificationClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card from toggling when clicking the bulb
    setIsJustificationVisible(!isJustificationVisible);
  };
  
  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card from toggling
    onContact(expert);
  };

  return (
    <div 
      className="p-6 bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-lg shadow-md hover:shadow-xl dark:bg-gray-800/70 dark:border-gray-700/80 dark:hover:bg-gray-700/90 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow pr-4">
          <h3 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {expert.name}
          </h3>
        </div>
        <div className="flex items-center flex-shrink-0">
          {expert.justification && (
            <button
              onClick={handleJustificationClick}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Show selection justification"
              aria-expanded={isJustificationVisible}
            >
              <LightbulbIcon className="w-6 h-6" />
            </button>
          )}
          <ChevronDownIcon className={`w-7 h-7 text-gray-400 transition-transform duration-300 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4 text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <UniversityIcon className="w-5 h-5 mr-2 text-blue-500" />
          <span className="font-medium">{expert.university}</span>
        </div>
        <div className="flex items-center">
          <DepartmentIcon className="w-5 h-5 mr-2 text-green-500" />
          <span className="font-medium">{expert.department}</span>
        </div>
         <button 
            onClick={handleContactClick}
            className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1 -ml-2 sm:ml-0"
            aria-label={`Contact ${expert.name}`}
          >
            <MailIcon className="w-4 h-4 mr-1.5" />
            Contact
          </button>
      </div>
      
      {isJustificationVisible && expert.justification && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-gray-700 dark:border-yellow-900/50 animate-fade-in-down">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">Reason for selection:</span> {expert.justification}
          </p>
        </div>
      )}

      <p className="font-normal text-gray-700 dark:text-gray-300 text-justify">
        {expert.expertise}
      </p>

      <div className={`details-panel ${isExpanded ? 'expanded' : ''}`}>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {isLoadingDetails && (
            <div className="flex items-center justify-center p-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
              <p className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading details...</p>
            </div>
          )}
          {!isLoadingDetails && details && (
            <div className="space-y-6">
              <DetailSection icon={<BookOpenIcon />} title="Key Publications" items={details.publications} />
              <DetailSection icon={<BriefcaseIcon />} title="Projects & Work" items={details.projects} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailSection: React.FC<{ icon: React.ReactNode; title: string; items: string[] }> = ({ icon, title, items }) => {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
        <span className="mr-3 text-indigo-500">{icon}</span>
        {title}
      </h4>
      <ul className="space-y-2 pl-8 list-disc list-inside text-gray-600 dark:text-gray-400">
        {items.map((item, index) => (
          <li key={index} className="leading-relaxed">{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExpertCard;