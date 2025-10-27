import { useEffect, useState } from 'react';
import type { Competitor, CompetitorComparisonResponse, CompetitorCreate, SentimentSummary } from '#types';
import {
  createCompetitor,
  deleteCompetitor,
  getCompetitorComparison,
  listCompetitors,
  updateCompetitor
} from '../lib/api';
import Loading from '../components/Loading';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

const defaultForm: CompetitorCreate = {
  name: '',
  url: '',
  description: '',
  tags: []
};

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<CompetitorCreate>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<CompetitorComparisonResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listCompetitors({ page_size: 50 });
      setCompetitors(response.items);
      if (!selectedId && response.items.length) {
        setSelectedId(response.items[0].competitor_id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load competitors';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCompetitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = evt.target;
    if (name === 'tags') {
      setForm((prev) => ({ ...prev, tags: value.split(',').map((tag) => tag.trim()).filter(Boolean) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreate = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = await createCompetitor({ ...form, tags: form.tags?.filter(Boolean) });
      setCompetitors((prev) => [payload, ...prev]);
      setSelectedId(payload.competitor_id);
      setForm(defaultForm);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create competitor';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) return;
    const target = competitors.find((item) => item.competitor_id === selectedId);
    if (!target) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCompetitor(selectedId, {
        name: target.name,
        url: target.url,
        description: target.description,
        tags: target.tags
      });
      setCompetitors((prev) => prev.map((item) => (item.competitor_id === selectedId ? updated : item)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update competitor';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this competitor? Historical comparisons remain unaffected.')) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await deleteCompetitor(id);
      setCompetitors((prev) => prev.filter((item) => item.competitor_id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setComparison(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete competitor';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCompare = async (id: string) => {
    setError(null);
    setComparison(null);
    setLoading(true);
    try {
      const response = await getCompetitorComparison(id);
      setComparison(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch comparison';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCompetitor = selectedId ? competitors.find((item) => item.competitor_id === selectedId) : null;

  return (
    <div className="stack">
      <header>
        <h2 style={{ margin: 0 }}>Competitors</h2>
        <p style={{ margin: '0.35rem 0 0', color: '#475569' }}>
          Track competing products and benchmark their sentiment and topic share against your own.
        </p>
      </header>

      {error && <ErrorBanner message={error} onRetry={() => loadCompetitors()} />}

      <form className="surface" onSubmit={handleCreate}>
        <h3 className="section-title">Add a competitor</h3>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          Name
          <input name="name" required placeholder="VoicePulse" value={form.name} onChange={handleChange} />
        </label>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          URL
          <input name="url" placeholder="https://example.com" value={form.url ?? ''} onChange={handleChange} />
        </label>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          Description
          <textarea name="description" rows={3} placeholder="What do they do? Who do they serve?" value={form.description ?? ''} onChange={handleChange} />
        </label>
        <label style={{ display: 'grid', gap: '0.35rem' }}>
          Tags (comma separated)
          <input name="tags" placeholder="analytics, enterprise" value={form.tags?.join(', ') ?? ''} onChange={handleChange} />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add competitor'}
        </button>
      </form>

      <div className="surface">
        <h3 className="section-title">Competitor roster</h3>
        {loading && <Loading label="Loading competitors..." />}
        {!loading && competitors.length === 0 && (
          <EmptyState title="No competitors yet" description="Capture your first competitor to unlock benchmarking." />
        )}
        {!loading && competitors.length > 0 && (
          <div className="card-list">
            {competitors.map((competitor) => (
              <article
                key={competitor.competitor_id}
                className="surface"
                style={{
                  border: selectedId === competitor.competitor_id ? '2px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: 'none'
                }}
              >
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{competitor.name}</h4>
                    {competitor.url && (
                      <a href={competitor.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563eb' }}>
                        {competitor.url}
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="secondary"
                      style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
                      onClick={() => {
                        setSelectedId(competitor.competitor_id);
                        void handleCompare(competitor.competitor_id);
                      }}
                    >
                      Compare
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
                      onClick={() => handleDelete(competitor.competitor_id)}
                    >
                      Delete
                    </button>
                  </div>
                </header>
                {competitor.description && (
                  <p style={{ margin: '0.75rem 0 0', color: '#475569', fontSize: '0.9rem' }}>{competitor.description}</p>
                )}
                {competitor.tags?.length ? (
                  <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {competitor.tags.map((tag) => (
                      <span key={tag} className="pill" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedCompetitor && (
        <div className="surface">
          <h3 className="section-title">Selected competitor</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <strong>{selectedCompetitor.name}</strong>
              <p style={{ margin: '0.4rem 0 0', color: '#475569', fontSize: '0.9rem' }}>
                Last updated {new Date(selectedCompetitor.updated_at).toLocaleString()}
              </p>
            </div>
            <button type="button" onClick={handleUpdate} disabled={saving}>
              {saving ? 'Syncing...' : 'Sync metadata'}
            </button>
          </div>
        </div>
      )}

      {comparison && (
        <div className="surface">
          <h3 className="section-title">You vs {comparison.competitor.name}</h3>
          <div className="grid two">
            <SentimentCard title="Your sentiment" summary={comparison.self_sentiment} />
            <SentimentCard title={`${comparison.competitor.name}`} summary={comparison.competitor_sentiment} />
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Topic deltas</h4>
            {comparison.top_topics.length ? (
              <table className="table-list">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>You</th>
                    <th>{comparison.competitor.name}</th>
                    <th>Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.top_topics.map((topic) => (
                    <tr key={topic.topic_label}>
                      <td>{topic.topic_label}</td>
                      <td>{formatShare(topic.self_share)}</td>
                      <td>{formatShare(topic.competitor_share)}</td>
                      <td style={{ color: topic.delta > 0 ? '#16a34a' : topic.delta < 0 ? '#dc2626' : '#475569' }}>
                        {topic.delta.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No overlapping topics yet" description="Ingest competitor reviews to unlock comparisons." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SentimentCard({ title, summary }: { title: string; summary: SentimentSummary }) {
  return (
    <div className="surface" style={{ boxShadow: 'none', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
      <h4 style={{ margin: 0 }}>{title}</h4>
      <div className="stats-row" style={{ marginTop: '0.75rem' }}>
        <Stat label="Positive" value={summary.positive} accent="#22c55e" />
        <Stat label="Neutral" value={summary.neutral} accent="#94a3b8" />
        <Stat label="Negative" value={summary.negative} accent="#ef4444" />
      </div>
      <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: '#475569' }}>
        Average score: <strong>{summary.average_score.toFixed(2)}</strong> from <strong>{summary.review_count}</strong> reviews
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="stat-card" style={{ backgroundColor: `${accent}20`, color: '#0f172a' }}>
      <h3 style={{ color: '#0f172a' }}>{label}</h3>
      <p>{value}</p>
    </div>
  );
}

function formatShare(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}
