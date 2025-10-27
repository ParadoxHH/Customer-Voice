import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, PlayCircle } from 'lucide-react';
import type { DigestResponse } from '#types';
import { useRunDigest } from '../lib/useApi';
import { formatNumber } from '../lib/format';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import Loader from '../components/Loader';

type Frequency = 'weekly' | 'monthly';

const STORAGE_KEY = 'cv_digest_frequency';

const buildTimeframe = (frequency: Frequency) => {
  const end = new Date();
  const start = new Date(end);
  if (frequency === 'weekly') {
    start.setDate(end.getDate() - 7);
  } else {
    start.setMonth(end.getMonth() - 1);
  }
  return {
    timeframe_start: start.toISOString(),
    timeframe_end: end.toISOString()
  };
};

const splitTopics = (digest: DigestResponse) => {
  const topics = digest.topic_spotlight ?? [];
  const praise = [...topics]
    .filter((topic) => topic.change_vs_previous >= 0)
    .sort((a, b) => b.change_vs_previous - a.change_vs_previous)
    .slice(0, 3);
  const complaints = [...topics]
    .filter((topic) => topic.change_vs_previous < 0)
    .sort((a, b) => a.change_vs_previous - b.change_vs_previous)
    .slice(0, 3);
  return { praise, complaints };
};

export default function DigestsPage() {
  const [frequency, setFrequency] = useState<Frequency>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'monthly' ? 'monthly' : 'weekly';
  });
  const [preview, setPreview] = useState<DigestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const digestMutation = useRunDigest();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, frequency);
  }, [frequency]);

  const timeframe = useMemo(() => buildTimeframe(frequency), [frequency]);
  const praiseAndComplaints = useMemo(() => (preview ? splitTopics(preview) : null), [preview]);

  const handleRun = async () => {
    setError(null);
    try {
      const payload = {
        timeframe_start: timeframe.timeframe_start,
        timeframe_end: timeframe.timeframe_end,
        include_competitors: true
      };
      const response = await digestMutation.mutateAsync(payload);
      setPreview(response);
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : 'Failed to generate digest.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gradient">Digests</h1>
        <p className="max-w-xl text-sm text-white/65">
          Generate, preview, and schedule automated digests so stakeholders stay aligned every Monday.
        </p>
      </header>

      {error && <ErrorBanner message={error} />}

      <Card title="Digest controls" eyebrow="Timeframe">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs">
            <button
              type="button"
              className={`rounded-full px-3 py-1 ${frequency === 'weekly' ? 'bg-gem-gradient text-white' : 'text-white/60'}`}
              onClick={() => setFrequency('weekly')}
            >
              Weekly
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 ${frequency === 'monthly' ? 'bg-gem-gradient text-white' : 'text-white/60'}`}
              onClick={() => setFrequency('monthly')}
            >
              Monthly
            </button>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-white/50">
            <CalendarRange className="h-4 w-4 text-emerald" />
            {new Date(timeframe.timeframe_start).toLocaleString()} {'->'} {new Date(timeframe.timeframe_end).toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          data-testid="run-digest"
          className="btn-primary mt-4 rounded-full px-6 py-3 text-sm"
          onClick={handleRun}
          disabled={digestMutation.isPending}
        >
          <PlayCircle className="h-4 w-4" />
          {digestMutation.isPending ? 'Generating...' : 'Run now'}
        </button>
      </Card>

      {digestMutation.isPending && <Loader label="Assembling digest..." />}

      {preview ? (
        <>
          <Card title="Highlights" eyebrow="Digest summary">
            <ul className="space-y-2 text-sm text-white/70">
              {preview.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2">
                  <span className="mt-1 block h-[6px] w-[6px] rounded-full bg-emerald" />
                  {highlight}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Key metrics" eyebrow="Snapshot">
            <dl className="grid gap-4 md:grid-cols-3">
              {Object.entries(preview.key_metrics).map(([key, value]) => (
                <div key={key} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                  <dt className="text-xs uppercase tracking-wide text-white/50">{key.replace(/_/g, ' ')}</dt>
                  <dd className="mt-2 text-xl font-semibold text-white">{String(value)}</dd>
                </div>
              ))}
              {preview.sentiment_snapshot && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                  <dt className="text-xs uppercase tracking-wide text-white/50">Sentiment mix</dt>
                  <dd className="mt-2 text-sm text-white/70">
                    Positive {formatNumber(preview.sentiment_snapshot.positive)} | Neutral{' '}
                    {formatNumber(preview.sentiment_snapshot.neutral)} | Negative{' '}
                    {formatNumber(preview.sentiment_snapshot.negative)}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Topic spotlights" eyebrow="Top shifts" className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Top praise</h3>
              {praiseAndComplaints?.praise.length ? (
                <ul className="mt-3 space-y-3 text-sm text-white/70">
                  {praiseAndComplaints.praise.map((topic) => (
                    <li key={topic.topic_label} className="rounded-3xl border border-white/10 bg-white/[0.05] p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald">{topic.topic_label}</span>
                        <span className="text-xs text-white/40">+{topic.change_vs_previous.toFixed(2)}</span>
                      </div>
                      {topic.sample_quotes?.[0] && (
                        <blockquote className="mt-2 border-l-2 border-emerald/40 pl-3 text-xs text-white/60">
                          "{topic.sample_quotes[0]}"
                        </blockquote>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No wins yet" description="Import more data to surface praise trends." />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Top complaints</h3>
              {praiseAndComplaints?.complaints.length ? (
                <ul className="mt-3 space-y-3 text-sm text-white/70">
                  {praiseAndComplaints.complaints.map((topic) => (
                    <li key={topic.topic_label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ruby">{topic.topic_label}</span>
                        <span className="text-xs text-white/40">{topic.change_vs_previous.toFixed(2)}</span>
                      </div>
                      {topic.sample_quotes?.[0] && (
                        <blockquote className="mt-2 border-l-2 border-ruby/40 pl-3 text-xs text-white/60">
                          "{topic.sample_quotes[0]}"
                        </blockquote>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No complaints detected"
                  description="You are trending positive. Keep the momentum!"
                />
              )}
            </div>
          </Card>

          {preview.competitor_summary && preview.competitor_summary.length > 0 && (
            <Card title="Competitor signals" eyebrow="Delta vs you">
              <ul className="space-y-3 text-sm text-white/70">
                {preview.competitor_summary.map((item) => (
                  <li
                    key={item.competitor_id}
                    className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      {item.highlight && <p className="text-xs text-white/50">{item.highlight}</p>}
                    </div>
                    <span className={`tag ${item.sentiment_delta >= 0 ? 'bg-emerald/20 text-emerald' : 'bg-ruby/20 text-ruby'}`}>
                      {item.sentiment_delta.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <details className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
            <summary className="cursor-pointer font-semibold text-white">View raw JSON</summary>
            <pre className="mt-3 max-h-96 overflow-auto rounded-3xl bg-black/60 p-4 text-xs text-white/70">
              {JSON.stringify(preview, null, 2)}
            </pre>
          </details>
        </>
      ) : (
        !digestMutation.isPending && (
          <Card>
            <EmptyState
              title="Run your first digest"
              description="Generate a weekly or monthly snapshot to preview what stakeholders will receive."
              action={
                <button type="button" className="btn-primary" onClick={handleRun}>
                  Create preview
                </button>
              }
            />
          </Card>
        )
      )}
    </div>
  );
}


