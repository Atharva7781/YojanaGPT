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

export const checkStatus = async (): Promise<{ ready: boolean; schemes_rows: number | null }> => {
  const urls = [
    `${API_BASE_URL}/status`,
    `http://127.0.0.1:8080/status`,
    `http://localhost:8080/status`,
  ];
  let lastErr: unknown = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status}`);
        continue;
      }
      const json = await res.json();
      return json as { ready: boolean; schemes_rows: number | null };
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Status check failed');
};
