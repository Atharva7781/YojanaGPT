import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RecommendResponse } from './types';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import { recommendSchemes } from './api/recommend';
import { Toaster } from 'react-hot-toast';
import { FiAlertCircle, FiX, FiInfo, FiCheckCircle } from 'react-icons/fi';

const App: React.FC = () => {
  const [searchResults, setSearchResults] = useState<RecommendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (
    query: string, 
    profile: any, 
    topK: number
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await recommendSchemes({ query, profile }, topK);
      setSearchResults(results);
      setTimeout(() => {
        const el = document.getElementById('results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError('Failed to fetch schemes. Please try again later.');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  // Add animation class when component mounts
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 transition-opacity duration-300 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-24 pb-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Find Your Perfect Government Scheme
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Discover and apply for government schemes tailored to your needs in just a few clicks
            </motion.p>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-100 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'font-sans',
            style: {
              background: '#ffffff',
              color: '#1f2937',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#ffffff',
              },
            },
          }}
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm transition-all duration-300 transform hover:shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={handleDismissError}
                  className="inline-flex text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md"
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative max-w-5xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 overflow-hidden border border-white/40">
            <div className="px-6 py-10 sm:p-12">
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent font-display">
                  YojanaGPT
                </h1>
                <p className="mt-2 text-sm text-gray-500">Government Scheme Recommender</p>
                <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                  Find schemes tailored to your profile and query with transparent eligibility details
                </p>
              </div>

              <SearchForm 
                onSubmit={handleSearch} 
                isLoading={isLoading} 
              />
            </div>
          </div>
          
          {searchResults && (
            <div className="mt-12" id="results">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-display">
                  Recommended Schemes
                  {searchResults.profile?.gender && (
                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {searchResults.profile.gender} specific results
                    </span>
                  )}
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {searchResults.results.length} schemes found
                </span>
              </div>
              
              <ResultsList 
                results={searchResults.results} 
                isLoading={isLoading}
                userGender={searchResults.profile?.gender}
              />
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white/70 backdrop-blur-sm border-t border-white/40 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                YojanaGPT
              </span>
              <span className="text-sm text-gray-500">
                Making government schemes accessible to all
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-500 md:mt-0">
              &copy; {new Date().getFullYear()} Government Scheme Recommender. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
