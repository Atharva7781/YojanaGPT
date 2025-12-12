import { RecommendRequest, RecommendResponse } from '../types';
import { API_BASE_URL } from '../config';
import { postJSON } from './shared/http';

export const recommendSchemes = async (
  request: Omit<RecommendRequest, 'top_k'>,
  topK: number = 10
): Promise<RecommendResponse> => {
  const payload: RecommendRequest = {
    ...request,
    top_k: topK,
  };
  return postJSON<RecommendResponse>(`${API_BASE_URL}/recommend`, payload);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};
