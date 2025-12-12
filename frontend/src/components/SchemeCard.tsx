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
  const hasStructuredEligibility = Boolean(scheme.eligibility_structured);
  const isFemaleOnly = scheme.eligibility_structured?.required?.some(
    rule => rule.field === 'gender' && rule.value === 'female'
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200 hover:shadow-xl transition-shadow">
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

            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-500 mr-2">R</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-sm font-semibold">{scheme.R.toFixed(2)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-500 mr-2">S</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-sm font-semibold">{scheme.S.toFixed(2)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-500 mr-2">F</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-sm font-semibold">{scheme.F.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {hasStructuredEligibility && (
          <div className="mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? 'Hide eligibility details' : 'Show eligibility details'}
            </button>

            {isExpanded && scheme.eligibility_structured && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Eligibility criteria</h4>
                
                {scheme.eligibility_structured.source_text && (
                  <div className="mb-4 p-3 bg-white border border-gray-200 rounded">
                    <p className="text-sm text-gray-700">{scheme.eligibility_structured.source_text}</p>
                  </div>
                )}

                {scheme.eligibility_structured.required.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Required</h5>
                    <ul className="space-y-2">
                      {scheme.eligibility_structured.required.map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-sm text-gray-700">
                            {rule.field.replace(/_/g, ' ')} {getRuleOperatorSymbol(rule.operator)} {formatRuleValue(rule.value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scheme.eligibility_structured.optional.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Optional</h5>
                    <ul className="space-y-2">
                      {scheme.eligibility_structured.optional.map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">?</span>
                          <span className="text-sm text-gray-700">
                            {rule.field.replace(/_/g, ' ')} {getRuleOperatorSymbol(rule.operator)} {formatRuleValue(rule.value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {scheme.source_url && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <a
            href={scheme.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View official source
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default SchemeCard;
