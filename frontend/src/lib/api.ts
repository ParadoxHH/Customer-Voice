import type {
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
const DIGEST_TOKEN = import.meta.env.VITE_DIGEST_TOKEN;

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  retryCount?: number;
}

const MAX_RETRIES = 2;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error('VITE_API_URL is not configured');
  }

  const url = `${BASE_URL}${path}`;
  const { retryCount = 0, headers, ...rest } = options;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...rest
  });

  if (response.status === 429 && retryCount < MAX_RETRIES) {
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 2 ** retryCount;
    await sleep((retryAfterSeconds || 1) * 1000);
    return request<T>(path, { ...options, retryCount: retryCount + 1 });
  }

  const contentType = response.headers.get('Content-Type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = payload as ErrorResponse | RateLimitError | null;
    const message = error?.message ?? `Request failed with status ${response.status}`;
    const details = 'details' in (error ?? {}) ? (error as ErrorResponse).details : undefined;
    const err = new Error(message) as Error & { status?: number; details?: unknown };
    err.status = response.status;
    err.details = details;
    throw err;
  }

  return payload as T;
}

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function listInsights(params: {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
  source_id?: string;
  sentiment?: string;
} = {}): Promise<InsightsResponse> {
  const query = toQuery(params);
  return request<InsightsResponse>(`/insights${query}`, { method: 'GET' });
}

export async function postIngest(payload: ReviewIngestRequest): Promise<ReviewIngestResponse> {
  return request<ReviewIngestResponse>('/ingest', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function postAnalyze(payload: { text: string; language?: string }): Promise<AnalyzeResponse> {
  return request<AnalyzeResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function listCompetitors(params: { page?: number; page_size?: number } = {}): Promise<CompetitorListResponse> {
  const query = toQuery(params);
  return request<CompetitorListResponse>(`/competitors${query}`, { method: 'GET' });
}

export async function createCompetitor(payload: CompetitorCreate): Promise<Competitor> {
  return request<Competitor>('/competitors', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateCompetitor(id: string, payload: Partial<CompetitorCreate>): Promise<Competitor> {
  return request<Competitor>(`/competitors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteCompetitor(id: string): Promise<void> {
  await request<void>(`/competitors/${id}`, { method: 'DELETE' });
}

export async function getCompetitorComparison(
  id: string,
  params: { start_date?: string; end_date?: string } = {}
): Promise<CompetitorComparisonResponse> {
  const query = toQuery(params);
  return request<CompetitorComparisonResponse>(`/competitors/${id}/comparison${query}`, { method: 'GET' });
}

export async function runDigest(payload: DigestRequest = {}): Promise<DigestResponse> {
  if (!DIGEST_TOKEN) {
    throw new Error('VITE_DIGEST_TOKEN is not set; cannot call digest endpoint.');
  }
  return request<DigestResponse>('/digest/run', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DIGEST_TOKEN}`
    },
    body: JSON.stringify(payload)
  });
}

export const api = {
  listInsights,
  postIngest,
  postAnalyze,
  listCompetitors,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
  getCompetitorComparison,
  runDigest
};
