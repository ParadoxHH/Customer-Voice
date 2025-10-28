import { useCallback, useEffect, useState } from 'react';
import type { InsightsResponse } from '#types';
import { apiFetch, ApiError } from './api';

export interface UseInsightsOptions {
  token?: string | null;
  enabled?: boolean;
  pageSize?: number;
}

export interface UseInsightsResult {
  data: InsightsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  hasData: boolean;
}

export function useInsights(options: UseInsightsOptions = {}): UseInsightsResult {
  const { token = null, enabled = true, pageSize = 25 } = options;
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const response = await apiFetch<InsightsResponse>(`/insights?page_size=${pageSize}`, { token });
        if (!isMounted) {
          return;
        }
        setData(response);
        setError(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        if (err instanceof ApiError) {
          const message =
            err.payload && typeof err.payload === 'object' && err.payload && 'message' in err.payload
              ? String((err.payload as { message?: string }).message)
              : err.message;
          setError(message);
        } else {
          setError('Unable to load insights right now.');
        }
        setData(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!enabled || !token) {
      setData(null);
      setError(null);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [enabled, token, pageSize, refreshIndex]);

  const refresh = useCallback(() => setRefreshIndex((index) => index + 1), []);

  return {
    data,
    loading,
    error,
    refresh,
    hasData: Boolean(data && data.pagination.total_items > 0),
  };
}
