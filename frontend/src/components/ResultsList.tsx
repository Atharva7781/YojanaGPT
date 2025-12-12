import React from 'react';
import { SchemeResult } from '../types';
import SchemeCard from './SchemeCard';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import LoadingSkeleton from './LoadingSkeleton';

interface ResultsListProps {
  results: SchemeResult[];
  isLoading: boolean;
  userGender?: string | null;
}

const ResultsList: React.FC<ResultsListProps> = ({ results, isLoading, userGender }) => {
  const [sortBy, setSortBy] = React.useState<'relevance' | 'rules' | 'semantic'>('relevance');
  const [showFilters, setShowFilters] = React.useState(false);

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  if (results.length === 0) {
    return (
      <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl shadow-black/5 p-10 text-center border border-white/40">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-gray-900">No schemes found</h3>
        <p className="mt-2 text-gray-500">Try adjusting your search criteria to find more results.</p>
      </div>
    );
  }

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'relevance') return b.percent_match - a.percent_match;
    if (sortBy === 'rules') return (b.R + b.S) - (a.R + a.S);
    return b.F - a.F;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-3 sm:mb-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {results.length} {results.length === 1 ? 'Scheme' : 'Schemes'} Found
            </h2>
            <p className="text-sm text-gray-500 mt-1">Sorted by {sortBy === 'relevance' ? 'relevance' : sortBy === 'rules' ? 'rules score' : 'semantic match'}</p>
          </div>
          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiFilter className="mr-2 h-4 w-4" />
                  {showFilters ? 'Hide filters' : 'Filters'}
                </button>
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'relevance' | 'rules' | 'semantic')}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="rules">Rules Score (R+S)</option>
                          <option value="semantic">Semantic Match (F)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setSortBy('relevance')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${sortBy === 'relevance' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500`}
                >
                  Relevance
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('rules')}
                  className={`px-4 py-2 text-sm font-medium ${sortBy === 'rules' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500`}
                >
                  Rules Score
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('semantic')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${sortBy === 'semantic' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500`}
                >
                  Semantic
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sortedResults.map((scheme) => (
          <SchemeCard 
            key={scheme.scheme_id} 
            scheme={scheme} 
            userGender={userGender}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsList;
