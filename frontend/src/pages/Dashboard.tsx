import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, CloudDownload } from 'lucide-react';
import type { InsightsResponse, ReviewIngestRequest, SourceBreakdownItem } from '#types';
import { useInsights, useImportSampleData } from '../lib/useApi';
import { formatNumber, sentimentBadgeBg } from '../lib/format';
import Card from '../components/Card';
import Stat from '../components/Stat';
import ChartLine from '../components/ChartLine';
import Heatmap from '../components/Heatmap';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

const RANGE_OPTIONS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 }
] as const;

const SENTIMENT_OPTIONS = ['All', 'Positive', 'Neutral', 'Negative'] as const;

async function loadSamplePayload(): Promise<ReviewIngestRequest> {
  const response = await fetch('/SAMPLE_DATA.json');
  if (!response.ok) throw new Error('Sample data file missing');
  const sample = await response.json();
  const firstSource = sample.sources?.[0];
  return {
    source_id: firstSource?.id ?? crypto.randomUUID(),
    overwrite_source_metadata: true,
    source_metadata: firstSource,
    reviews: sample.reviews ?? []
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>(RANGE_OPTIONS[0]);
  const [sentimentFilter, setSentimentFilter] = useState<(typeof SENTIMENT_OPTIONS)[number]>('All');

  const dateFilters = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - range.days);
    return {
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10)
    };
  }, [range]);

  const { data, isLoading, error, refetch } = useInsights({
    page: 1,
    page_size: 25,
    start_date: dateFilters.start_date,
    end_date: dateFilters.end_date,
    sentiment: sentimentFilter === 'All' ? undefined : sentimentFilter
  });

  const importSampleMutation = useImportSampleData();

  const summary = useMemo(() => {
    const insights: InsightsResponse | undefined = data ?? undefined;
    if (!insights) return null;
    const total = insights.pagination.total_items;
    const lastPoint = insights.sentiment_trend[insights.sentiment_trend.length - 1];
    const avgScore = lastPoint?.average_score ?? 0;
    const happiestSource = [...insights.source_breakdown].sort(
      (a, b) => b.average_sentiment_score - a.average_sentiment_score
    )[0];
    return { totalReviews: total, avgScore, happiestSource };
  }, [data]);

  const hasData =
    data &&
    (data.sentiment_trend.length > 0 ||
      data.topic_distribution.length > 0 ||
      data.source_breakdown.length > 0);

  const handleImportSample = async () => {
    const payload = await loadSamplePayload();
    await importSampleMutation.mutateAsync(payload);
    await refetch();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Overview</p>
          <h1 className="text-3xl font-semibold text-gradient">Customer Voice Dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-white/65">
            See how people feel, what they mention most, and which places need a follow-up.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setRange(option)}
              className={`btn ${option.label === range.label ? 'btn-primary' : 'btn-secondary'}`}
            >
              <CalendarRange className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-white/60">
          Mood
          <select
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white focus-visible:ring-emerald"
            value={sentimentFilter}
            onChange={(event) => setSentimentFilter(event.target.value as (typeof SENTIMENT_OPTIONS)[number])}
          >
            {SENTIMENT_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-obsidian text-white">
                {option}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          data-testid="import-sample"
          onClick={() => {
            handleImportSample().catch((err) => console.error(err));
          }}
          className="btn-secondary rounded-full border-white/30 bg-white/10"
          disabled={importSampleMutation.isPending}
        >
          <CloudDownload className="h-4 w-4" />
          {importSampleMutation.isPending ? 'Importing...' : 'Add Sample Reviews'}
        </button>
        <button
          type="button"
          className="btn-ghost text-sm text-white/70 hover:text-white"
          onClick={() => navigate('/sources')}
        >
          Manage Sources
        </button>
      </div>

      {error && <ErrorBanner message={error.message} onRetry={() => refetch()} />}

      {isLoading && <Loader label="Loading insights..." />}

      {!isLoading && !error && !hasData && (
        <Card>
          <EmptyState
            title="No reviews yet"
            description="Load the sample set or hook up a source to see real numbers."
            action={
              <>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    handleImportSample().catch((err) => console.error(err));
                  }}
                >
                  Add Sample Reviews
                </button>
                <button type="button" className="btn-secondary" onClick={() => navigate('/sources')}>
                  Connect a Source
                </button>
              </>
            }
            icon={<CloudDownload className="h-10 w-10 text-emerald" />}
          />
        </Card>
      )}

      {!isLoading && !error && hasData && data && (
        <>
          {summary && (
            <div className="grid gap-4 md:grid-cols-3">
              <Stat
                label="Reviews"
                value={formatNumber(summary.totalReviews)}
                trend={`Last ${range.days} days`}
              />
              <Stat
                label="Mood score"
                value={summary.avgScore.toFixed(2)}
                trend="Higher = happier"
              />
              <Stat
                label="Happiest channel"
                value={summary.happiestSource?.source_name ?? 'n/a'}
                trend={
                  summary.happiestSource
                    ? `Score ${summary.happiestSource.average_sentiment_score.toFixed(2)}`
                    : 'Add another channel'
                }
              />
            </div>
          )}

          <Card title="Mood over time" eyebrow={`Last ${range.days} days`} id="sentiment-line">
            <div data-testid="sentiment-line" className="h-[280px]">
              <ChartLine data={data.sentiment_trend} />
            </div>
          </Card>

          <Card title="Hot topics" eyebrow="Most common themes" id="topic-heatmap">
            <div data-testid="topic-heatmap" className="h-[320px]">
              <Heatmap data={data.topic_distribution} />
            </div>
          </Card>

          <Card title="Channel snapshot" eyebrow="Where feedback comes from" className="space-y-4">
            <div className="card-grid">
              {data.source_breakdown.map((source) => (
                <SourceCard key={source.source_id} source={source} />
              ))}
            </div>
          </Card>

          <Card title="Latest reviews" eyebrow="Real voices" className="space-y-4">
            <ul className="space-y-4">
          {data.recent_reviews.slice(0, 6).map((review) => (
                <li key={review.review_id} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{review.title || 'Untitled review'}</h3>
                      <p className="text-xs uppercase tracking-wide text-white/50">
                        {new Date(review.published_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`tag ${sentimentBadgeBg(review.sentiment.label)}`}>{review.sentiment.label}</span>
                  </div>
                  {review.body && (
                    <p className="mt-3 text-sm text-white/70">
                      {review.body.length > 240 ? `${review.body.slice(0, 240)}...` : review.body}
                    </p>
                  )}
                  {review.topics && review.topics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.topics.map((topic) => (
                        <span key={topic.topic_label} className="tag bg-amethyst/15 text-amethyst">
                          #{topic.topic_label}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function SourceCard({ source }: { source: SourceBreakdownItem }) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/[0.08] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{source.source_name || 'Unnamed source'}</h3>
        <span className="tag bg-emerald/20 text-emerald">{source.review_count} reviews</span>
      </div>
      <p className="text-xs text-white/60">Average mood</p>
      <p className="text-xl font-semibold text-white">
        {source.average_sentiment_score.toFixed(2)}
      </p>
    </div>
  );
}


