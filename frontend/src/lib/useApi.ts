import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  Competitor,
  CompetitorCreate,
  CompetitorListResponse,
  DigestRequest,
  DigestResponse,
  InsightsResponse,
  ReviewIngestRequest,
  ReviewIngestResponse
} from './types';
import { api } from './api';

const safeToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (type === 'success') {
    toast.success(message);
  } else {
    toast.error(message);
  }
};

export function useInsights(filters: {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
  source_id?: string;
  sentiment?: string;
}) {
  return useQuery<InsightsResponse, Error>({
    queryKey: ['insights', filters],
    queryFn: () => api.insights(filters)
  });
}

export function useImportSampleData() {
  const queryClient = useQueryClient();
  return useMutation<ReviewIngestResponse, Error, ReviewIngestRequest>({
    mutationFn: (payload) => api.importReviews(payload),
    onSuccess: () => {
      safeToast('Sample data imported. Refreshing insights.');
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
    onError: (error) => {
      safeToast(error.message, 'error');
    }
  });
}

export function useAnalyze() {
  return useMutation<AnalyzeResponse, Error, AnalyzeRequest>({
    mutationFn: (payload) => api.analyzeText(payload),
    onError: (error) => safeToast(error.message, 'error')
  });
}

export function useCompetitors() {
  const queryClient = useQueryClient();
  const list = useQuery<CompetitorListResponse, Error>({
    queryKey: ['competitors'],
    queryFn: () => api.listCompetitors()
  });

  const create = useMutation<Competitor, Error, CompetitorCreate>({
    mutationFn: (payload) => api.createCompetitor(payload),
    onSuccess: () => {
      safeToast('Competitor saved');
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    },
    onError: (error) => safeToast(error.message, 'error')
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: (id) => api.deleteCompetitor(id),
    onSuccess: () => {
      safeToast('Competitor removed');
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    },
    onError: (error) => safeToast(error.message, 'error')
  });

  const update = useMutation<Competitor, Error, { id: string; patch: Partial<CompetitorCreate> }>({
    mutationFn: ({ id, patch }) => api.updateCompetitor(id, patch),
    onSuccess: () => {
      safeToast('Competitor updated');
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    },
    onError: (error) => safeToast(error.message, 'error')
  });

  return { list, create, remove, update };
}

export function useCompetitorComparison(id: string | undefined) {
  return useQuery({
    queryKey: ['competitor-comparison', id],
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error('Missing competitor id'));
      }
      return api.competitorComparison(id);
    },
    enabled: Boolean(id)
  });
}

export function useRunDigest() {
  return useMutation<DigestResponse, Error, DigestRequest>({
    mutationFn: (payload) => api.runDigest(payload),
    onSuccess: (data) => {
      safeToast('Digest generated successfully');
      return data;
    },
    onError: (error) => safeToast(error.message, 'error')
  });
}
