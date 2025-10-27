import { useEffect, useMemo, useState } from 'react';
import type { InsightsResponse, SourceBreakdownItem } from '#types';
import { listInsights } from '../lib/api';
import Loading from '../components/Loading';
import ErrorBanner from '../components/ErrorBanner';
import ChartLine from '../components/ChartLine';
import Heatmap from '../components/Heatmap';
import EmptyState from '../components/EmptyState';

interface FiltersState {
  start_date?: string;
  end_date?: string;
  sentiment?: string;
}

const sentimentOptions = ['All', 'Positive', 'Neutral', 'Negative'] as const;

export default function DashboardPage() {
  const [filters, setFilters] = useState<FiltersState>({});
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listInsights({
        page: 1,
        page_size: 25,
        start_date: nextFilters.start_date,
        end_date: nextFilters.end_date,
        sentiment: nextFilters.sentiment && nextFilters.sentiment !== 'All' ? nextFilters.sentiment : undefined
      });
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load insights';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    if (!data) {
      return null;
    }
    const total = data.pagination.total_items;
    const lastPoint =
      data.sentiment_trend.length > 0
        ? data.sentiment_trend[data.sentiment_trend.length - 1]
        : undefined;
    const averageScore = lastPoint?.average_score ?? 0;
    const topSource = data.source_breakdown[0];
    return {
      totalReviews: total,
      averageScore,
      topSource
    };
  }, [data]);

  const handleFilterChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = evt.target;
    const next = {
      ...filters,
      [name]: value || undefined
    };
    if (name === 'sentiment' && value === 'All') {
      delete next.sentiment;
    }
    setFilters(next);
  };

  const handleApplyFilters = (evt: React.FormEvent) => {
    evt.preventDefault();
    void loadInsights(filters);
  };

  return (
    <div className="stack">
      <header style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Insights Overview</h2>
        <p style={{ margin: 0, color: '#475569' }}>
          Track sentiment shifts, hot topics, and source performance across your review footprint.
        </p>
      </header>

      <form className="surface" onSubmit={handleApplyFilters}>
        <div className="grid two">
          <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
            Start date
            <input type="date" name="start_date" value={filters.start_date ?? ''} onChange={handleFilterChange} />
          </label>
          <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
            End date
            <input type="date" name="end_date" value={filters.end_date ?? ''} onChange={handleFilterChange} />
          </label>
          <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
            Sentiment
            <select name="sentiment" value={filters.sentiment ?? 'All'} onChange={handleFilterChange}>
              {sentimentOptions.map((option) => (
                <option key={option} value={option === 'All' ? 'All' : option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setFilters({});
              void loadInsights({});
            }}
          >
            Reset
          </button>
          <button type="submit" disabled={loading}>
            Apply filters
          </button>
        </div>
      </form>

      {loading && <Loading label="Loading insights..." />}
      {error && <ErrorBanner message={error} onRetry={() => loadInsights(filters)} />}

      {data && !loading && !error && (
        <section className="grid">
          <div className="surface">
            <h3 className="section-title">Sentiment trend</h3>
            <ChartLine data={data.sentiment_trend} />
          </div>

          <div className="surface">
            <h3 className="section-title">Topic heatmap</h3>
            <Heatmap data={data.topic_distribution} />
          </div>

          <div className="surface">
            <h3 className="section-title">Source breakdown</h3>
            {data.source_breakdown.length ? (
              <div className="grid two">
                {data.source_breakdown.map((source) => (
                  <SourceCard key={source.source_id} source={source} />
                ))}
              </div>
            ) : (
              <EmptyState title="No sources yet" description="Head to Sources to connect your first data feed." />
            )}
          </div>

          <div className="surface">
            <h3 className="section-title">Most recent reviews</h3>
            {data.recent_reviews.length ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1rem' }}>
                {data.recent_reviews.slice(0, 6).map((review) => (
                  <li key={review.review_id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div>
                        <strong>{review.title || 'Untitled review'}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {new Date(review.published_at).toLocaleString()} | {review.sentiment.label}
                        </div>
                      </div>
                      <span className="pill" style={{ backgroundColor: sentimentColor(review.sentiment.label), color: '#0f172a' }}>
                        {review.sentiment.label}
                      </span>
                    </div>
                    {review.body && (
                      <p style={{ margin: '0.5rem 0 0', color: '#475569', fontSize: '0.95rem' }}>
                        {review.body.length > 220 ? `${review.body.slice(0, 220)}...` : review.body}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No reviews found" description="Adjust filters or ingest sample data to populate this list." />
            )}
          </div>
        </section>
      )}

      {!loading && !error && !data && (
        <EmptyState
          title="We need data to show insights"
          description="Try ingesting sample data from the Sources page."
          action={
            <a href="/sources">
              <button type="button">Go to Sources</button>
            </a>
          }
        />
      )}
    </div>
  );
}

function SourceCard({ source }: { source: SourceBreakdownItem }) {
  return (
    <div className="surface" style={{ boxShadow: 'none', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
      <h4 style={{ margin: 0 }}>{source.source_name || 'Unnamed source'}</h4>
      <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
        Reviews: <strong>{source.review_count}</strong>
      </p>
      <p style={{ margin: '0.1rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
        Avg. sentiment score: <strong>{source.average_sentiment_score.toFixed(2)}</strong>
      </p>
    </div>
  );
}

function sentimentColor(label: string) {
  switch (label) {
    case 'Positive':
      return 'rgba(34, 197, 94, 0.25)';
    case 'Negative':
      return 'rgba(239, 68, 68, 0.25)';
    default:
      return 'rgba(148, 163, 184, 0.25)';
  }
}
