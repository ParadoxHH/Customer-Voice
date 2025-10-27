import { useMemo, useState } from 'react';
import type { ReviewIngestRequest, SourceMetadata } from '#types';
import { postIngest } from '../lib/api';
import Loading from '../components/Loading';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

interface ConnectedSource extends SourceMetadata {
  id: string;
}

interface SampleSource extends ConnectedSource {
  created_at?: string;
}

interface SampleReview {
  source_id: string;
  source_review_id: string;
  title?: string;
  body: string;
  rating?: number;
  author_name?: string;
  language?: string;
  location?: string;
  published_at: string;
}

const createInitialFormState = () => ({
  id:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `source-${Math.random().toString(36).slice(2)}`,
  name: '',
  platform: '',
  external_id: '',
  url: ''
});

export default function SourcesPage() {
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>([]);
  const [form, setForm] = useState(createInitialFormState);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSource = (evt: React.FormEvent) => {
    evt.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.name.trim()) {
      setError('Please provide a name for the source.');
      return;
    }

    const nextSource: ConnectedSource = {
      id: form.id,
      name: form.name,
      platform: form.platform || undefined,
      external_id: form.external_id || undefined,
      url: form.url || undefined
    };
    setConnectedSources((prev) => [...prev, nextSource]);
    setMessage(`Source "${form.name}" saved locally. Use the ingest endpoint to add reviews.`);
    setForm(createInitialFormState());
  };

  const handleImportSample = async () => {
    setImporting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/SAMPLE_DATA.json');
      if (!response.ok) {
        throw new Error('Could not fetch SAMPLE_DATA.json. Ensure it is deployed alongside the SPA.');
      }
      const sample = await response.json();

      const sources: SampleSource[] = sample.sources ?? [];
      const reviews: SampleReview[] = sample.reviews ?? [];

      const grouped = reviews.reduce<Record<string, ReviewIngestRequest>>((acc, review) => {
        if (!acc[review.source_id]) {
          const meta = sources.find((source) => source.id === review.source_id);
          acc[review.source_id] = {
            source_id: review.source_id,
            overwrite_source_metadata: true,
            source_metadata: meta
              ? {
                  name: meta.name,
                  platform: meta.platform,
                  external_id: meta.external_id,
                  url: meta.url
                }
              : undefined,
            reviews: []
          };
        }
        acc[review.source_id].reviews.push({
          source_review_id: review.source_review_id,
          title: review.title,
          body: review.body,
          rating: Number(review.rating ?? 0),
          author_name: review.author_name,
          language: review.language,
          location: review.location,
          published_at: review.published_at,
          metadata: {}
        });
        return acc;
      }, {});

      for (const request of Object.values(grouped)) {
        await postIngest(request);
      }

      setConnectedSources((prev) => {
        const merged = [...prev];
        sources.forEach((source) => {
          if (!merged.some((item) => item.id === source.id)) {
            merged.push({
              id: source.id,
              name: source.name,
              platform: source.platform,
              external_id: source.external_id,
              url: source.url
            });
          }
        });
        return merged;
      });
      setMessage('Sample data ingested. Refresh the dashboard to see the updates.');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to import sample data. Check network logs for details.';
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  const platformSummary = useMemo(() => {
    const counts = connectedSources.reduce<Record<string, number>>((acc, source) => {
      const key = source.platform || 'unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([platform, count]) => ({ platform, count }));
  }, [connectedSources]);

  return (
    <div className="stack">
      <header>
        <h2 style={{ margin: 0 }}>Sources</h2>
        <p style={{ margin: '0.35rem 0 0', color: '#475569' }}>
          Capture the metadata for each intake channel. These records stay local until reviews are ingested.
        </p>
      </header>

      {error && <ErrorBanner message={error} />}
      {message && (
        <div
          style={{
            padding: '0.8rem 1rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#0369a1'
          }}
        >
          {message}
        </div>
      )}

      <form className="surface" onSubmit={handleSaveSource}>
        <h3 className="section-title">Connect a source</h3>
        <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
          Source name
          <input name="name" placeholder="App Store Reviews" value={form.name} onChange={handleChange} required />
        </label>
        <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
          Platform
          <input name="platform" placeholder="app_store / survey / support" value={form.platform} onChange={handleChange} />
        </label>
        <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
          External ID
          <input name="external_id" placeholder="com.customer.voice.ios" value={form.external_id} onChange={handleChange} />
        </label>
        <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
          Source URL
          <input name="url" placeholder="https://..." value={form.url} onChange={handleChange} />
        </label>
        <button type="submit">Save metadata</button>
      </form>

      <div className="surface">
        <h3 className="section-title">Quick actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button type="button" onClick={handleImportSample} disabled={importing}>
            {importing ? 'Importing sample data...' : 'Import sample data'}
          </button>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>
            Loads the provided SAMPLE_DATA.json into your Render backend using the ingest endpoint.
          </p>
        </div>
      </div>

      <div className="surface">
        <h3 className="section-title">Connected sources</h3>
        {connectedSources.length ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
            {connectedSources.map((source) => (
              <li key={source.id} className="surface" style={{ padding: '0.75rem', boxShadow: 'none' }}>
                <strong>{source.name}</strong>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>
                  Platform: {source.platform ?? 'n/a'} | External ID: {source.external_id ?? 'n/a'}
                </div>
                {source.url && (
                  <a href={source.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563eb' }}>
                    {source.url}
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No sources captured yet" description="Save your first source using the form above." />
        )}
      </div>

      {connectedSources.length > 0 && (
        <div className="surface">
          <h3 className="section-title">Platforms summary</h3>
          <table className="table-list">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Sources</th>
              </tr>
            </thead>
            <tbody>
              {platformSummary.map((item) => (
                <tr key={item.platform}>
                  <td>{item.platform}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {importing && <Loading label="Sending sample data to the API..." />}
    </div>
  );
}
