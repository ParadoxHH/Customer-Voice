import { useMemo, useState } from 'react';
import type { DigestRequest, DigestResponse } from '#types';
import { runDigest } from '../lib/api';
import Loading from '../components/Loading';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

type Frequency = 'weekly' | 'monthly';

export default function DigestsPage() {
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeframe = useMemo(() => {
    const now = new Date();
    const end = now.toISOString();
    const start = new Date(now);
    if (frequency === 'weekly') {
      start.setDate(now.getDate() - 7);
    } else {
      start.setMonth(now.getMonth() - 1);
    }
    return { start: start.toISOString(), end };
  }, [frequency]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: DigestRequest = {
        timeframe_start: timeframe.start,
        timeframe_end: timeframe.end,
        include_competitors: true
      };
      const response = await runDigest(payload);
      setDigest(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run digest';
      setError(message);
      setDigest(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <header>
        <h2 style={{ margin: 0 }}>Digests</h2>
        <p style={{ margin: '0.35rem 0 0', color: '#475569' }}>
          Generate and preview automated summaries before scheduling the Render job.
        </p>
      </header>

      {error && <ErrorBanner message={error} />}

      <div className="surface">
        <h3 className="section-title">Frequency</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={frequency === 'weekly' ? '' : 'secondary'}
            onClick={() => setFrequency('weekly')}
          >
            Weekly digest
          </button>
          <button
            type="button"
            className={frequency === 'monthly' ? '' : 'secondary'}
            onClick={() => setFrequency('monthly')}
          >
            Monthly digest
          </button>
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#475569' }}>
          Timeframe: <strong>{new Date(timeframe.start).toLocaleString()}</strong>{' -> '}
          <strong>{new Date(timeframe.end).toLocaleString()}</strong>
        </p>
        <button type="button" onClick={handleRun} disabled={loading}>
          {loading ? 'Generating digest...' : 'Run now'}
        </button>
      </div>

      {loading && <Loading label="Assembling digest..." />}

      {digest && !loading && (
        <div className="surface">
          <h3 className="section-title">Digest preview</h3>
          <div className="grid">
            <section>
              <h4>Highlights</h4>
              <ul style={{ paddingLeft: '1.15rem' }}>
                {digest.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4>Key metrics</h4>
              <table className="table-list">
                <tbody>
                  {Object.entries(digest.key_metrics).map(([key, value]) => (
                    <tr key={key}>
                      <td style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {digest.sentiment_snapshot && (
              <section>
                <h4>Sentiment snapshot</h4>
                <p style={{ margin: '0.35rem 0', color: '#475569' }}>
                  Positive {digest.sentiment_snapshot.positive} | Neutral {digest.sentiment_snapshot.neutral} | Negative{' '}
                  {digest.sentiment_snapshot.negative} | Avg score {digest.sentiment_snapshot.average_score}
                </p>
              </section>
            )}

            {digest.topic_spotlight && digest.topic_spotlight.length > 0 && (
              <section>
                <h4>Topic spotlight</h4>
                <ul style={{ paddingLeft: '1.15rem' }}>
                  {digest.topic_spotlight.map((topic) => (
                    <li key={topic.topic_label}>
                      <strong>{topic.topic_label}</strong> - change: {topic.change_vs_previous}
                      {topic.sample_quotes?.length ? (
                        <blockquote style={{ margin: '0.35rem 0 0', color: '#475569', fontSize: '0.9rem' }}>
                          "{topic.sample_quotes[0]}"
                        </blockquote>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {digest.competitor_summary && digest.competitor_summary.length > 0 && (
              <section>
                <h4>Competitor signals</h4>
                <ul style={{ paddingLeft: '1.15rem' }}>
                  {digest.competitor_summary.map((item) => (
                    <li key={item.competitor_id}>
                      <strong>{item.name}</strong> - delta: {item.sentiment_delta}{' '}
                      {item.highlight && <span style={{ color: '#475569' }}>({item.highlight})</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <details style={{ marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Raw JSON</summary>
            <pre
              style={{
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                padding: '1rem',
                borderRadius: '0.75rem',
                overflowX: 'auto'
              }}
            >
              {JSON.stringify(digest, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {!digest && !loading && (
        <EmptyState
          title="No digests generated yet"
          description="Select a timeframe and run the digest to preview what will be emailed."
        />
      )}
    </div>
  );
}
