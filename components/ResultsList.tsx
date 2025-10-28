
import React from 'react';
import { Expert, Source, ExpertDetails } from '../types';
import ExpertCard from './ExpertCard';
import LinkIcon from './icons/LinkIcon';

interface ResultsListProps {
  experts: Expert[];
  sources: Source[];
  expandedExpertId: string | null;
  onToggleExpert: (id: string) => void;
  onContactExpert: (expert: Expert) => void;
  expertDetails: Record<string, ExpertDetails>;
  detailsLoadingId: string | null;
}

const ResultsList: React.FC<ResultsListProps> = ({ experts, sources, expandedExpertId, onToggleExpert, onContactExpert, expertDetails, detailsLoadingId }) => {
  if (experts.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="space-y-6">
        {experts.map((expert) => (
          <ExpertCard 
            key={expert.id} 
            expert={expert}
            isExpanded={expert.id === expandedExpertId}
            onToggle={() => onToggleExpert(expert.id)}
            onContact={onContactExpert}
            details={expertDetails[expert.id]}
            isLoadingDetails={detailsLoadingId === expert.id}
          />
        ))}
      </div>
      {sources.length > 0 && (
        <div className="mt-12 p-6 bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-lg dark:bg-gray-800/70 dark:border-gray-700/80">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 drop-shadow-md">Sources</h3>
          <ul className="space-y-2">
            {sources.map((source, index) => (
              <li key={index} className="flex items-center">
                <LinkIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 truncate"
                  title={source.title}
                >
                  {source.title || source.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsList;