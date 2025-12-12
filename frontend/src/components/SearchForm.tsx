import React, { useState, FormEvent } from 'react';
import { Profile } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface SearchFormProps {
  onSubmit: (query: string, profile: Omit<Profile, 'user_id' | 'extra_flags'>, topK: number) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState<Omit<Profile, 'user_id' | 'extra_flags'>>({
    state: '',
    gender: null,
    monthly_income: undefined,
    occupation: '',
    // Optional fields
    district: '',
    age: undefined,
    category: null,
    farmer: false,
    land_area: undefined
  });
  const [topK, setTopK] = useState(10);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProfile(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'monthly_income' || name === 'age' || name === 'land_area') {
      const numValue = value === '' ? undefined : Number(value);
      setProfile(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value === '' ? null : value
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!query.trim()) newErrors.query = 'Please enter a search query';
    if (!profile.state) newErrors.state = 'State is required';
    if (!profile.gender) newErrors.gender = 'Gender is required';
    if (!profile.monthly_income) newErrors.monthly_income = 'Monthly income is required';
    if (!profile.occupation) newErrors.occupation = 'Occupation is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // If farmer is not checked, set land_area to undefined
    const submitProfile = {
      ...profile,
      land_area: profile.farmer ? profile.land_area : undefined
    };
    
    onSubmit(query, submitProfile, topK);
  };

  const handleReset = () => {
    setQuery('');
    setProfile({
      state: '',
      gender: null,
      monthly_income: undefined,
      occupation: '',
      district: '',
      age: undefined,
      category: null,
      farmer: false,
      land_area: undefined
    });
    setTopK(10);
    setShowAdvanced(false);
    setErrors({});
  };

  // Check if all required fields are filled
  const isFormValid = query.trim() && profile.state && profile.gender && 
                     profile.monthly_income !== undefined && profile.occupation;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Find Government Schemes</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Required Information</h3>
            
            {/* Query */}
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                What are you looking for? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="query"
                name="query"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (errors.query) setErrors(prev => ({ ...prev, query: '' }));
                }}
                className={`w-full px-4 py-2 rounded-lg border ${errors.query ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="e.g., subsidy for farm pond, education loan, etc."
                disabled={isLoading}
              />
              {errors.query && (
                <p className="mt-1 text-sm text-red-600">{errors.query}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State */}
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={profile.state || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Maharashtra"
                  disabled={isLoading}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={profile.gender || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.gender ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>

              {/* Monthly Income */}
              <div>
                <label htmlFor="monthly_income" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    id="monthly_income"
                    name="monthly_income"
                    value={profile.monthly_income || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className={`pl-10 w-full px-4 py-2 rounded-lg border ${errors.monthly_income ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., 25000"
                    disabled={isLoading}
                  />
                </div>
                {errors.monthly_income && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthly_income}</p>
                )}
              </div>

              {/* Occupation */}
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={profile.occupation || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.occupation ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Farmer, Student, etc."
                  disabled={isLoading}
                />
                {errors.occupation && (
                  <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center w-full py-2 px-4 -mx-4 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {showAdvanced ? (
                <>
                  <span>Hide Advanced Filters</span>
                  <FiChevronUp className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  <span>Show Advanced Filters</span>
                  <FiChevronDown className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Optional / Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* District */}
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={profile.district || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Pune"
                    disabled={isLoading}
                  />
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={profile.age || ''}
                    onChange={handleInputChange}
                    min="0"
                    max="120"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 35"
                    disabled={isLoading}
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={profile.category || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">Select category</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Farmer Checkbox */}
                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      id="farmer"
                      name="farmer"
                      type="checkbox"
                      checked={profile.farmer || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                  </div>
                  <label htmlFor="farmer" className="ml-2 block text-sm text-gray-700">
                    Farmer
                  </label>
                </div>

                {/* Land Area - Only shown if farmer is checked */}
                {profile.farmer && (
                  <div className="md:col-span-2">
                    <label htmlFor="land_area" className="block text-sm font-medium text-gray-700 mb-1">
                      Land Area (acres)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="land_area"
                        name="land_area"
                        value={profile.land_area || ''}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2.5"
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">acres</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top K Results */}
                <div>
                  <label htmlFor="topK" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Results (Top K)
                  </label>
                  <select
                    id="topK"
                    name="topK"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="5">Top 5</option>
                    <option value="10">Top 10</option>
                    <option value="20">Top 20</option>
                    <option value="50">Top 50</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                isFormValid 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-400 cursor-not-allowed'
              }`}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Searching...
                </div>
              ) : (
                'Search Schemes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;
