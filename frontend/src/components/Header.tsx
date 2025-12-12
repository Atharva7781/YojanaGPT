import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Government Scheme Recommender</h1>
            <p className="mt-2 text-blue-100 max-w-2xl">
              Discover schemes matched to your profile and query with transparent eligibility details
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
