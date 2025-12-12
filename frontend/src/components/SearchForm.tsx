import React, { useState, FormEvent } from 'react';
import { Profile } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiSearch, 
  FiRotateCcw, 
  FiInfo, 
  FiDollarSign, 
  FiMapPin, 
  FiUser, 
  FiBriefcase 
} from 'react-icons/fi';

interface SearchFormProps {
  onSubmit: (query: string, profile: Omit<Profile, 'user_id' | 'extra_flags'>, topK: number) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, isLoading }) => {
  const suggestions = ['Education', 'Agriculture', 'Healthcare', 'Scholarship', 'Loan', 'Housing', 'Startup'];
  const states = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
  ].sort();
  const occupations = [
    'Farmer','Student','Business','Government Employee','Private Employee','Self Employed','Homemaker','Unemployed','Retired','Other'
  ];
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 overflow-hidden border border-white/40 transition-all duration-300 hover:shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Find Your Perfect Scheme
            </h2>
            <p className="text-gray-600">Fill in your details to discover government schemes tailored for you</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search Query */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <FiSearch className="h-5 w-5" />
              </div>
              <input
                type="text"
                id="query"
                name="query"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (errors.query) setErrors(prev => ({ ...prev, query: '' }));
                }}
                className={`block w-full pl-10 pr-4 py-3 rounded-xl border ${errors.query ? 'border-red-300' : 'border-gray-200'} bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400`}
                placeholder="What are you looking for? (e.g., education loan, housing scheme)"
                disabled={isLoading}
              />
              {errors.query && (
                <p className="mt-1 text-sm text-red-600">{errors.query}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                    query === s ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={isLoading}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* State */}
              <div className="relative group">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FiMapPin className="h-5 w-5" />
                  </div>
                  <select
                    id="state"
                    name="state"
                    value={profile.state || ''}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 appearance-none rounded-xl border ${errors.state ? 'border-red-300' : 'border-gray-200'} bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    disabled={isLoading}
                  >
                    <option value="">Select your state</option>
                    {states.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>

              {/* Gender */}
              <div className="relative group">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FiUser className="h-5 w-5" />
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={profile.gender || ''}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 appearance-none rounded-xl border ${errors.gender ? 'border-red-300' : 'border-gray-200'} bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    disabled={isLoading}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>

              {/* Monthly Income */}
              <div className="relative group">
                <label htmlFor="monthly_income" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                  Monthly Income (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FiDollarSign className="h-5 w-5" />
                  </div>
                  <input
                    type="number"
                    id="monthly_income"
                    name="monthly_income"
                    value={profile.monthly_income || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className={`block w-full pl-10 pr-4 py-3 rounded-xl border ${errors.monthly_income ? 'border-red-300' : 'border-gray-200'} bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="e.g., 25000"
                    disabled={isLoading}
                  />
                </div>
                {errors.monthly_income && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthly_income}</p>
                )}
              </div>

              {/* Occupation */}
              <div className="relative group">
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <FiBriefcase className="h-5 w-5" />
                  </div>
                  <select
                    id="occupation"
                    name="occupation"
                    value={profile.occupation || ''}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 appearance-none rounded-xl border ${errors.occupation ? 'border-red-300' : 'border-gray-200'} bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    disabled={isLoading}
                  >
                    <option value="">Select your occupation</option>
                    {occupations.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.occupation && (
                  <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>
                )}
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl bg-white/50 hover:bg-gray-50/70 transition-all duration-300 group"
              >
                <span className={`font-medium ${showAdvanced ? 'text-blue-600' : 'text-gray-700'} group-hover:text-blue-600 transition-colors`}>
                  {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                </span>
                {showAdvanced ? (
                  <FiChevronUp className="ml-2 h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                ) : (
                  <FiChevronDown className="ml-2 h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="bg-gray-50/70 backdrop-blur-sm p-6 rounded-2xl space-y-6 border border-white/40 transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FiInfo className="mr-2 text-blue-600" />
                  Advanced Filters
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* District */}
                  <div className="relative group">
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      District
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={profile.district || ''}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="e.g., Pune"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Age */}
                  <div className="relative group">
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
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
                      className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="e.g., 35"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Category */}
                  <div className="relative group">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        value={profile.category || ''}
                        onChange={handleInputChange}
                        className="block w-full pl-4 pr-10 py-3 appearance-none rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        disabled={isLoading}
                      >
                        <option value="">Select category</option>
                        <option value="general">General</option>
                        <option value="obc">OBC</option>
                        <option value="sc">SC</option>
                        <option value="st">ST</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FiChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Farmer Checkbox */}
                  <div className="flex items-center pt-6">
                    <div className="flex items-center h-5">
                      <input
                        id="farmer"
                        name="farmer"
                        type="checkbox"
                        checked={profile.farmer || false}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                        disabled={isLoading}
                      />
                    </div>
                    <label htmlFor="farmer" className="ml-2 block text-sm font-medium text-gray-700">
                      I am a farmer
                    </label>
                  </div>

                  {/* Land Area - Only shown if farmer is checked */}
                  {profile.farmer && (
                    <div className="md:col-span-2 relative group">
                      <label htmlFor="land_area" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
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
                          className="block w-full pl-4 pr-16 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="e.g., 2.5"
                          disabled={isLoading}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 text-sm">acres</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top K Results */}
                  <div className="relative group md:col-span-2">
                    <label htmlFor="topK" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Number of Results
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        id="topK"
                        name="topK"
                        type="range"
                        min={5}
                        max={50}
                        step={5}
                        value={topK}
                        onChange={(e) => setTopK(Number(e.target.value))}
                        className="w-full"
                        disabled={isLoading}
                      />
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                        Top {topK}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-6 py-3 w-full sm:w-auto text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
              >
                <FiRotateCcw className="mr-2 h-4 w-4" />
                Reset Form
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`px-8 py-3 w-full sm:w-auto text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 flex items-center justify-center ${
                  isFormValid 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-2 h-4 w-4" />
                    Search Schemes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
