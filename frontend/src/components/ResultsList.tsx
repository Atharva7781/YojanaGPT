import React from 'react';
import { SchemeResult } from '../types';
import SchemeCard from './SchemeCard';

interface ResultsListProps {
  results: SchemeResult[];
  isLoading: boolean;
  userGender?: string | null;
}

const ResultsList: React.FC<ResultsListProps> = ({ results, isLoading, userGender }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding the best schemes for you...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-gray-200">
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Found {results.length} {results.length === 1 ? 'scheme' : 'schemes'}
        </h2>
        <div className="text-sm text-gray-500">Sorted by relevance</div>
      </div>

      <div className="space-y-6">
        {results.map((scheme) => (
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
