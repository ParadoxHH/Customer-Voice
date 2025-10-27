import type {
  AnalyzeRequest,
  AnalyzeResponse,
  Competitor,
  CompetitorComparisonResponse,
  CompetitorCreate,
  CompetitorListResponse,
  DigestRequest,
  DigestResponse,
  ErrorResponse,
  InsightsResponse,
  RateLimitError,
  ReviewIngestRequest,
  ReviewIngestResponse
} from '#types';

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
const RETRY_LIMIT = 3;
const DIGEST_TOKEN_KEY = 'cv_digest_token';

type RequestOptions = RequestInit & { retryCount?: number };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getStoredDigestToken(): string | undefined {
  if (typeof window === 'undefined') return import.meta.env.VITE_DIGEST_TOKEN;
  return (
    localStorage.getItem(DIGEST_TOKEN_KEY) ||
    import.meta.env.VITE_DIGEST_TOKEN ||
    undefined
  );
}

export function persistDigestToken(token: string) {
  if (typeof window === 'undefined') return;
  if (!token) {
    localStorage.removeItem(DIGEST_TOKEN_KEY);
    return;
  }
  localStorage.setItem(DIGEST_TOKEN_KEY, token);
}

export async function fetchJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error('VITE_API_URL is not configured');
  }

  const { retryCount = 0, headers, ...rest } = options;
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...rest
  });

  if (response.status === 429 && retryCount < RETRY_LIMIT) {
    const retryAfter = response.headers.get('Retry-After');
    const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 2 ** retryCount;
    await sleep(Math.max(1, waitSeconds) * 1000);
    return fetchJson<T>(path, { ...options, retryCount: retryCount + 1 });
  }

  const isJson = response.headers.get('Content-Type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = payload as ErrorResponse | RateLimitError | null;
    const message = error?.message ?? `Request failed with status ${response.status}`;
    const err = new Error(message) as Error & { status?: number; details?: unknown };
    err.status = response.status;
    if (error && 'details' in error) {
      err.details = error.details;
    }
    throw err;
  }

  return payload as T;
}

const toQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

export const api = {
  importReviews: (payload: ReviewIngestRequest) =>
    fetchJson<ReviewIngestResponse>('/ingest', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  analyzeText: (payload: AnalyzeRequest) =>
    fetchJson<AnalyzeResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  insights: (params: {
    page?: number;
    page_size?: number;
    start_date?: string;
    end_date?: string;
    source_id?: string;
    sentiment?: string;
  } = {}) => {
    const query = toQuery(params);
    return fetchJson<InsightsResponse>(`/insights${query}`, { method: 'GET' });
  },
  listCompetitors: (params: { page?: number; page_size?: number } = {}) => {
    const query = toQuery(params);
    return fetchJson<CompetitorListResponse>(`/competitors${query}`, { method: 'GET' });
  },
  createCompetitor: (payload: CompetitorCreate) =>
    fetchJson<Competitor>('/competitors', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateCompetitor: (id: string, payload: Partial<CompetitorCreate>) =>
    fetchJson<Competitor>(`/competitors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  deleteCompetitor: (id: string) =>
    fetchJson<void>(`/competitors/${id}`, { method: 'DELETE' }),
  competitorComparison: (id: string, params: { start_date?: string; end_date?: string } = {}) => {
    const query = toQuery(params);
    return fetchJson<CompetitorComparisonResponse>(`/competitors/${id}/comparison${query}`, {
      method: 'GET'
    });
  },
  runDigest: (payload: DigestRequest = {}) => {
    const token = getStoredDigestToken();
    if (!token) {
      throw new Error('No digest token configured');
    }
    return fetchJson<DigestResponse>('/digest/run', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  }
};
