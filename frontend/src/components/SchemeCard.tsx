import React, { useState } from 'react';
import { SchemeResult, SchemeRule } from '../types';
import { formatCurrency } from '../api/recommend';
import { getScoreColor, getRuleOperatorSymbol, formatRuleValue } from '../utils/format';

interface SchemeCardProps {
  scheme: SchemeResult;
  userGender?: string | null;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, userGender }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const hasStructuredEligibility = Boolean(scheme.eligibility_structured);
  const isFemaleOnly = scheme.eligibility_structured?.required?.some(
    rule => rule.field === 'gender' && rule.value === 'female'
  );

  return (
    <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl shadow-black/5 overflow-hidden mb-6 border border-white/40 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 ease-out">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {scheme.scheme_name}
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreColor(scheme.percent_match / 100)}`}>
                {Math.round(scheme.percent_match)}% match
              </span>
              {isFemaleOnly && userGender === 'male' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  Female only
                </span>
              )}
            </div>
            
            {scheme.description && (
              <p className="mt-3 text-gray-700">
                {scheme.description.length > 200 && !isExpanded 
                  ? `${scheme.description.substring(0, 200)}... `
                  : scheme.description}
                {scheme.description.length > 200 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">R:</span>
                <div className="w-16 bg-gray-200 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-green-500" style={{ width: `${scheme.R * 100}%` }}></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{Math.round(scheme.R * 100)}%</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">S:</span>
                <div className="w-16 bg-gray-200 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-purple-500" style={{ width: `${scheme.S * 100}%` }}></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{Math.round(scheme.S * 100)}%</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">F:</span>
                <div className="w-16 bg-gray-200 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-blue-500" style={{ width: `${scheme.F * 100}%` }}></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{Math.round(scheme.F * 100)}%</span>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {scheme.scheme_name?.charAt(0) || 'Y'}
            </div>
          </div>
        </div>

        {hasStructuredEligibility && (
          <div className="mt-6">
            <button
              onClick={() => setShowEligibility(!showEligibility)}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {showEligibility ? (
                <svg className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M18 9l-6 6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              {showEligibility ? 'Hide eligibility details' : 'Show eligibility details'}
            </button>
            {showEligibility && scheme.eligibility_structured && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                {scheme.eligibility_structured.required && scheme.eligibility_structured.required.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Required Criteria</h4>
                    <div className="space-y-2 pl-6">
                      {scheme.eligibility_structured.required.map((rule, idx) => (
                        <div key={idx} className="flex items-start py-1.5">
                          <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-2 mt-0.5">
                            <span className="text-xs font-semibold">
                              {rule.confidence ? `${Math.round(rule.confidence * 100)}%` : '✓'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium capitalize">{rule.field.replace(/_/g, ' ')}</span>{' '}
                            <span className="font-mono text-gray-500">{getRuleOperatorSymbol(rule.operator)}</span>{' '}
                            <span className="font-medium">{formatRuleValue(rule.value, rule.field)}</span>
                            {rule.source === 'rules_engine' && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">R</span>
                            )}
                            {rule.source === 'semantic' && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">S</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {scheme.eligibility_structured.optional && scheme.eligibility_structured.optional.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Optional Criteria</h4>
                    <div className="space-y-2 pl-6">
                      {scheme.eligibility_structured.optional.map((rule, idx) => (
                        <div key={idx} className="flex items-start py-1.5">
                          <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full mr-2 mt-0.5">
                            <span className="text-xs font-semibold">?</span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium capitalize">{rule.field.replace(/_/g, ' ')}</span>{' '}
                            <span className="font-mono text-gray-500">{getRuleOperatorSymbol(rule.operator)}</span>{' '}
                            <span className="font-medium">{formatRuleValue(rule.value, rule.field)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {scheme.eligibility_structured.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-sm text-yellow-700">
                      {typeof scheme.eligibility_structured.notes === 'string' ? scheme.eligibility_structured.notes : JSON.stringify(scheme.eligibility_structured.notes)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {scheme.source_url && (
        <div className="bg-gray-50/70 px-6 py-4 border-t border-white/40 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-2 sm:mb-0">
            <span>Source: {new URL(scheme.source_url).hostname}</span>
          </div>
          <div className="flex space-x-3">
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M14 3h7v7M21 3l-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Apply Now
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeCard;
