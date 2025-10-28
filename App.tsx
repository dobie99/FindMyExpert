import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { findExperts, getSearchSuggestions, getExpertDetails, generateBackgroundImage, getTrendingSearchSuggestions } from './services/geminiService';
import { Expert, Source, Filters, ExpertDetails } from './types';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import SuggestionChips from './components/SuggestionChips';
import AISuggestions from './components/AISuggestions';
import ContactModal from './components/ContactModal';
import DownloadIcon from './components/icons/DownloadIcon';
import InterviewModal from './components/InterviewModal';
import StarIcon from './components/icons/StarIcon';
import ThemeToggle from './components/ThemeToggle';

type SortOrder = 'relevance' | 'name-asc' | 'name-desc' | 'university-asc' | 'university-desc';

const fallbackSuggestions = [
  "Sustainable Agriculture",
  "Neural Networks",
  "18th Century Literature",
  "Urban Planning",
  "Particle Physics",
];

const initialFilters: Filters = {
  university: '',
  department: '',
  keywords: '',
  country: '',
  state: '',
  zipCode: '',
};

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('relevance');
  const [expandedExpertId, setExpandedExpertId] = useState<string | null>(null);
  const [expertDetails, setExpertDetails] = useState<Record<string, ExpertDetails>>({});
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);
  const [selectedExpertForContact, setSelectedExpertForContact] = useState<Expert | null>(null);
  const [interviewExpert, setInterviewExpert] = useState<Expert | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [favoriteExpertIds, setFavoriteExpertIds] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [trendingSuggestions, setTrendingSuggestions] = useState<string[]>(fallbackSuggestions);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("Could not save theme to local storage", e);
    }
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };


  useEffect(() => {
    // Fetch dynamic suggestions when the component mounts
    const fetchTrendingSuggestions = async () => {
        const suggestions = await getTrendingSearchSuggestions();
        if (suggestions && suggestions.length > 0) {
            setTrendingSuggestions(suggestions);
        }
    };
    fetchTrendingSuggestions();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('favoriteExperts');
      if (storedFavorites) {
        setFavoriteExpertIds(new Set(JSON.parse(storedFavorites)));
      }
    } catch (e) {
      console.error("Could not load favorites from local storage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('favoriteExperts', JSON.stringify(Array.from(favoriteExpertIds)));
    } catch (e) {
      console.error("Could not save favorites to local storage", e);
    }
  }, [favoriteExpertIds]);

  const handleToggleFavorite = (expertId: string) => {
    setFavoriteExpertIds(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(expertId)) {
        newFavorites.delete(expertId);
      } else {
        newFavorites.add(expertId);
      }
      return newFavorites;
    });
  };

  const parseGeminiResponse = (responseText: string): Expert[] => {
    if (!responseText) return [];
    const parsedExperts: Expert[] = [];
    const expertBlocks = responseText.split('---').filter(block => block.trim() !== '');

    expertBlocks.forEach((block, index) => {
      const nameMatch = block.match(/Name:\s*(.*)/);
      const universityMatch = block.match(/University:\s*(.*)/);
      const departmentMatch = block.match(/Department:\s*(.*)/);
      const genderMatch = block.match(/Gender:\s*(male|female|unknown)/i);
      const imageUrlMatch = block.match(/ImageUrl:\s*(.*)/);
      const expertiseMatch = block.match(/Expertise:\s*([\s\S]*?)(?=Justification:|$)/);
      const justificationMatch = block.match(/Justification:\s*(.*)/s);

      if (nameMatch && universityMatch && departmentMatch && expertiseMatch) {
        const imageUrl = imageUrlMatch ? imageUrlMatch[1].trim() : 'N/A';
        parsedExperts.push({
          id: `${nameMatch[1].trim().replace(/\s/g, '-')}-${index}`,
          name: nameMatch[1].trim(),
          university: universityMatch[1].trim(),
          department: departmentMatch[1].trim(),
          gender: (genderMatch ? genderMatch[1].toLowerCase() : 'unknown') as 'male' | 'female' | 'unknown',
          expertise: expertiseMatch[1].trim(),
          justification: justificationMatch ? justificationMatch[1].trim() : undefined,
          imageUrl: imageUrl !== 'N/A' ? imageUrl : undefined,
        });
      }
    });
    return parsedExperts;
  };
  
  const handleToggleExpertDetails = async (expertId: string) => {
    if (expandedExpertId === expertId) {
      setExpandedExpertId(null);
      return;
    }

    setExpandedExpertId(expertId);

    if (!expertDetails[expertId]) {
      const expertToFetch = experts.find(e => e.id === expertId);
      if (expertToFetch) {
        setDetailsLoadingId(expertId);
        try {
          const details = await getExpertDetails(expertToFetch);
          setExpertDetails(prevDetails => ({
            ...prevDetails,
            [expertId]: details
          }));
        } catch (error) {
          console.error("Failed to load expert details", error);
        } finally {
          setDetailsLoadingId(null);
        }
      }
    }
  };

  const handleSearch = useCallback(async (searchQuery: string, searchFilters: Filters) => {
    if (!searchQuery) return;

    setIsLoading(true);
    setError(null);
    setExperts([]);
    setSources([]);
    setAiSuggestions([]);
    setHasSearched(true);
    setSortOrder('relevance');
    setExpandedExpertId(null);
    setExpertDetails({});
    setLastSearchedQuery(searchQuery);
    setBackgroundImageUrl(null);
    setShowOnlyFavorites(false);


    try {
      const response = await findExperts(searchQuery, searchFilters);
      
      const responseText = response.text;
      const parsedExperts = parseGeminiResponse(responseText);
      setExperts(parsedExperts);

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedSources: Source[] = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri)
        .map((web: any) => ({ uri: web.uri, title: web.title || 'Untitled' }));
      setSources(extractedSources);

      if (parsedExperts.length === 0) {
        setError("No experts found for your query. Please try a different subject or adjust your filters.");
      } else {
        // Fetch suggestions and background image in parallel, but don't block the UI.
        // Let them populate when they're ready.
        
        getSearchSuggestions(searchQuery)
          .then(setAiSuggestions)
          .catch(err => console.error("Failed to fetch AI suggestions", err));

        generateBackgroundImage(searchQuery)
          .then(bgImageUrl => {
            if (bgImageUrl) {
              setBackgroundImageUrl(bgImageUrl);
            }
          })
          .catch(err => console.error("Failed to generate background image", err));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setFilters(initialFilters);
    handleSearch(suggestion, initialFilters);
  };
  
  const handleStartInterview = async (expert: Expert) => {
    let details = expertDetails[expert.id];
    if (!details) {
      setDetailsLoadingId(expert.id);
      try {
        details = await getExpertDetails(expert);
        setExpertDetails(prev => ({...prev, [expert.id]: details as ExpertDetails}));
      } catch (err) {
        setError("Could not load expert details to start the interview.");
        setDetailsLoadingId(null);
        return;
      }
      setDetailsLoadingId(null);
    }
    setInterviewExpert(expert);
  };
  
  const filteredExperts = useMemo(() => {
    if (showOnlyFavorites) {
      return experts.filter(expert => favoriteExpertIds.has(expert.id));
    }
    return experts;
  }, [experts, favoriteExpertIds, showOnlyFavorites]);
  
  const handleExportCSV = () => {
    if (experts.length === 0) return;

    const headers = ['Name', 'University', 'Department', 'Expertise', 'Justification'];
    const csvRows = [headers.join(',')];

    const escapeCSV = (field: any) => {
      if (field === undefined || field === null) return '';
      const str = String(field);
      // If the field contains a comma, double quote, or newline, wrap it in double quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    sortedExperts.forEach(expert => {
        const row = [
            escapeCSV(expert.name),
            escapeCSV(expert.university),
            escapeCSV(expert.department),
            escapeCSV(expert.expertise),
            escapeCSV(expert.justification)
        ].join(',');
        csvRows.push(row);
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filename = `experts-on-${lastSearchedQuery.replace(/\s/g, '_')}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedExperts = useMemo(() => {
    const expertsToSort = [...filteredExperts];
    if (sortOrder === 'relevance' && !showOnlyFavorites) {
      return expertsToSort; // Maintain original API order if not sorted and not just showing faves
    }
    switch (sortOrder) {
      case 'name-asc':
        return expertsToSort.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return expertsToSort.sort((a, b) => b.name.localeCompare(a.name));
      case 'university-asc':
        return expertsToSort.sort((a, b) => a.university.localeCompare(b.university));
      case 'university-desc':
        return expertsToSort.sort((a, b) => b.university.localeCompare(a.university));
      default:
        return expertsToSort;
    }
  }, [filteredExperts, sortOrder, showOnlyFavorites]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-10 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
            Find My Expert
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Enter a subject to discover leading academic experts, with options to refine your search for precise results.
          </p>
        </header>

        <section className="mb-10">
          <SearchBar 
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFilterChange={setFilters}
            onSearch={handleSearch} 
            isLoading={isLoading} 
          />
          {!hasSearched && <SuggestionChips suggestions={trendingSuggestions} onChipClick={handleSuggestionClick} />}
        </section>

        <section>
          {isLoading && <LoadingSpinner />}
          {error && !isLoading && <ErrorMessage message={error} />}
          {!isLoading && hasSearched && experts.length === 0 && !error && (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold">No Results</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Your search for "{lastSearchedQuery}" did not return any experts. Try a broader term or adjust your filters.</p>
            </div>
          )}
          {!isLoading && (experts.length > 0 || (showOnlyFavorites && favoriteExpertIds.size > 0)) && (
            <div
              className="results-background-container"
              style={{ backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none' }}
            >
              <div className="background-overlay"></div>
              <div className="results-content">
                <div className="w-full max-w-4xl mx-auto mb-4 flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label="Export results to CSV"
                    >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                    {favoriteExpertIds.size > 0 && (
                      <div className="flex items-center">
                        <input type="checkbox" id="fav-toggle" className="hidden" checked={showOnlyFavorites} onChange={() => setShowOnlyFavorites(!showOnlyFavorites)} />
                        <label htmlFor="fav-toggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <div className="block w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${showOnlyFavorites ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-sm font-medium text-white drop-shadow-sm flex items-center">
                              <StarIcon filled={showOnlyFavorites} className="w-4 h-4 mr-1.5 text-yellow-400"/>
                              Show Favorites
                            </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <label htmlFor="sort-order" className="text-sm font-medium text-white drop-shadow-sm">Sort by:</label>
                    <select
                      id="sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                      className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Sort order for experts"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="university-asc">University (A-Z)</option>
                      <option value="university-desc">University (Z-A)</option>
                    </select>
                  </div>
                </div>

                {showOnlyFavorites && sortedExperts.length === 0 && (
                   <div className="text-center p-8 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-md mt-6">
                    <h3 className="text-2xl font-semibold">No Favorites Found</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">You haven't favorited any experts from the current search results. Disable the 'Show Favorites' toggle to see all results.</p>
                  </div>
                )}
                
                <ResultsList 
                  experts={sortedExperts} 
                  sources={sources}
                  expandedExpertId={expandedExpertId}
                  onToggleExpert={handleToggleExpertDetails}
                  onContactExpert={setSelectedExpertForContact}
                  onStartInterview={handleStartInterview}
                  expertDetails={expertDetails}
                  detailsLoadingId={detailsLoadingId}
                  favoriteExpertIds={favoriteExpertIds}
                  onToggleFavorite={handleToggleFavorite}
                />
                
                {aiSuggestions.length > 0 && !showOnlyFavorites && <AISuggestions suggestions={aiSuggestions} onSuggestionClick={handleSuggestionClick} />}
              </div>
            </div>
          )}
        </section>
      </main>
      <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Find My Expert. All rights reserved.</p>
      </footer>
      
      <ContactModal 
        expert={selectedExpertForContact}
        searchQuery={lastSearchedQuery}
        isOpen={!!selectedExpertForContact}
        onClose={() => setSelectedExpertForContact(null)}
      />
      
      <InterviewModal
        expert={interviewExpert}
        details={interviewExpert ? expertDetails[interviewExpert.id] : undefined}
        isOpen={!!interviewExpert}
        onClose={() => setInterviewExpert(null)}
      />
    </div>
  );
};

export default App;
