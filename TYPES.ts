// Shared TypeScript contracts mirroring OpenAPI.yaml and DB.sql

export type SentimentLabel = 'Positive' | 'Neutral' | 'Negative';

export interface Sentiment {
  label: SentimentLabel;
  score: number; // -1.0 .. 1.0
}

export interface TopicScore {
  topic_label: string;
  topic_confidence: number; // 0 .. 1
}

export interface ReviewIngestItem {
  source_review_id: string;
  title?: string;
  body: string;
  rating: number;
  author_name?: string;
  language?: string;
  location?: string;
  published_at: string; // ISO datetime UTC
  metadata?: Record<string, unknown>;
}

export interface SourceMetadata {
  external_id?: string;
  name?: string;
  platform?: string;
  url?: string;
}

export interface ReviewIngestRequest {
  source_id: string;
  overwrite_source_metadata?: boolean;
  source_metadata?: SourceMetadata;
  reviews: ReviewIngestItem[];
}

export interface ReviewIngestResponse {
  ingested_count: number;
  duplicate_count: number;
  review_ids: string[];
  message?: string;
}

export interface AnalyzeRequest {
  text: string;
  language?: string;
}

export interface AnalyzeResponse {
  sentiment: Sentiment;
  topics: TopicScore[];
}

export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface SentimentTrendPoint {
  date: string; // YYYY-MM-DD
  positive: number;
  neutral: number;
  negative: number;
  average_score?: number;
}

export interface TopicDistributionItem {
  topic_label: string;
  review_count: number;
  average_confidence: number;
}

export interface SourceBreakdownItem {
  source_id: string;
  source_name: string;
  review_count: number;
  average_sentiment_score: number;
}

export interface RecentReview {
  review_id: string;
  source_id: string;
  source_review_id: string;
  title: string;
  body?: string;
  sentiment: Sentiment;
  topics?: TopicScore[];
  rating?: number;
  published_at: string; // ISO datetime UTC
}

export interface InsightsResponse {
  pagination: Pagination;
  sentiment_trend: SentimentTrendPoint[];
  topic_distribution: TopicDistributionItem[];
  source_breakdown: SourceBreakdownItem[];
  recent_reviews: RecentReview[];
}

export interface Competitor {
  competitor_id: string;
  name: string;
  url?: string;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CompetitorCreate {
  name: string;
  url?: string;
  description?: string;
  tags?: string[];
}

export type CompetitorUpdate = Partial<CompetitorCreate>;

export interface CompetitorListResponse {
  pagination: Pagination;
  items: Competitor[];
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
  average_score: number;
  review_count: number;
}

export interface TopicComparison {
  topic_label: string;
  self_share: number;
  competitor_share: number;
  delta: number;
}

export interface CompetitorComparisonResponse {
  competitor: Competitor;
  self_sentiment: SentimentSummary;
  competitor_sentiment: SentimentSummary;
  top_topics: TopicComparison[];
}

export interface DigestRequest {
  timeframe_start?: string; // ISO datetime UTC
  timeframe_end?: string; // ISO datetime UTC
  include_competitors?: boolean;
}

export interface TopicSpotlight {
  topic_label: string;
  change_vs_previous: number;
  sample_quotes: string[];
}

export interface CompetitorDigestItem {
  competitor_id: string;
  name: string;
  sentiment_delta: number;
  highlight?: string;
}

export interface DigestResponse {
  digest_id: string;
  timeframe_start: string;
  timeframe_end: string;
  generated_at: string;
  highlights: string[];
  key_metrics: Record<string, string | number>;
  sentiment_snapshot?: SentimentSummary;
  topic_spotlight?: TopicSpotlight[];
  competitor_summary?: CompetitorDigestItem[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: { field?: string; issue?: string }[];
}

export interface RateLimitError extends ErrorResponse {
  retry_after_seconds: number;
  guidance: string;
}
