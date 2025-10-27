import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, DatabaseZap, Trash2 } from 'lucide-react';
import type { ReviewIngestRequest, SourceMetadata } from '#types';
import { useImportSampleData } from '../lib/useApi';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import Loader from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';

interface ConnectedSource {
  id: string;
  name: string;
  platform?: string;
  external_id?: string;
  url?: string;
  created_at: string;
}

interface SampleResponse {
  sources: (SourceMetadata & { id: string })[];
  reviews: Array<ReviewIngestRequest['reviews'][number] & { source_id: string }>;
}

const STORAGE_KEY = 'cv_sources';

const Hint = ({ text }: { text: string }) => (
  <span
    className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[10px] text-white/60"
    role="img"
    aria-label={text}
    title={text}
  >
    ?
  </span>
);

const newSource = (): ConnectedSource => ({
  id: crypto.randomUUID(),
  name: '',
  platform: '',
  external_id: '',
  url: '',
  created_at: new Date().toISOString()
});

async function buildIngestPayload(sample: SampleResponse): Promise<ReviewIngestRequest[]> {
  const grouped = new Map<string, ReviewIngestRequest>();

  for (const review of sample.reviews ?? []) {
    const existing = grouped.get(review.source_id);
    const sourceMeta = sample.sources.find((source) => source.id === review.source_id);
    if (!existing) {
      grouped.set(review.source_id, {
        source_id: review.source_id,
        overwrite_source_metadata: true,
        source_metadata: sourceMeta,
        reviews: []
      });
    }
    grouped.get(review.source_id)?.reviews.push({
      source_review_id: review.source_review_id,
      title: review.title,
      body: review.body,
      rating: review.rating,
      author_name: review.author_name,
      language: review.language,
      location: review.location,
      published_at: review.published_at,
      metadata: review.metadata ?? {}
    });
  }

  return Array.from(grouped.values());
}

async function loadSample(): Promise<SampleResponse> {
  const response = await fetch('/SAMPLE_DATA.json');
  if (!response.ok) {
    throw new Error('Unable to load SAMPLE_DATA.json. Ensure it is deployed with the app.');
  }
  return response.json();
}

export default function SourcesPage() {
  const [sources, setSources] = useState<ConnectedSource[]>([]);
  const [form, setForm] = useState<ConnectedSource>(newSource);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ConnectedSource | null>(null);
  const importSampleMutation = useImportSampleData();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSources(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
  }, [sources]);

  const platformSummary = useMemo(() => {
    const counts = sources.reduce<Record<string, number>>((acc, source) => {
      const key = source.platform || 'unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([platform, count]) => ({ platform, count }));
  }, [sources]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.name.trim()) {
      setError('Please add a short name so everyone knows what this source is.');
      return;
    }

    setSources((prev) => [...prev, form]);
    setForm(newSource());
    setMessage(`Saved "${form.name}". You can now add reviews for it.`);
  };

  const handleImportSample = async () => {
    try {
      setError(null);
      setMessage(null);
      const sample = await loadSample();
      const payloads = await buildIngestPayload(sample);
      await Promise.all(payloads.map((payload) => importSampleMutation.mutateAsync(payload)));
      setSources((prev) => {
        const merged = [...prev];
        sample.sources.forEach((source) => {
          if (!merged.some((item) => item.id === source.id)) {
            merged.push({
              id: source.id,
              name: source.name ?? 'Imported Source',
              platform: source.platform,
              external_id: source.external_id,
              url: source.url,
              created_at: new Date().toISOString()
            });
          }
        });
        return merged;
      });
      setMessage('Sample reviews added. Check the dashboard to see them.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the sample reviews. Please try again.');
    }
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    setSources((prev) => prev.filter((source) => source.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gradient">Sources</h1>
        <p className="max-w-xl text-sm text-white/65">
          Save the places where reviews live. This list only stays on this device until you add a real sync.
        </p>
      </header>

      {error && <ErrorBanner message={error} />}
      {message && (
        <div className="rounded-3xl border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">
          {message}
        </div>
      )}

      <Card title="Connect a source" eyebrow="Metadata">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/60">
            <span className="flex items-center gap-2">
              Name
              <Hint text="Give the source a clear title, like Google Play Reviews." />
            </span>
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus-visible:ring-emerald"
              name="name"
              placeholder="Google Play Reviews"
              value={form.name ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/60">
            <span className="flex items-center gap-2">
              Platform
              <Hint text="Short tag such as play_store, yelp, or email (optional)." />
            </span>
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus-visible:ring-emerald"
              name="platform"
              placeholder="play_store / yelp / surveys"
              value={form.platform ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, platform: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/60 md:col-span-2">
            <span className="flex items-center gap-2">
              ID
              <Hint text="Any code you use to match reviews (optional)." />
            </span>
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus-visible:ring-emerald"
              name="external_id"
              placeholder="com.customer.voice.ios"
              value={form.external_id ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, external_id: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/60 md:col-span-2">
            <span className="flex items-center gap-2">
              Link
              <Hint text="Direct link to the review page (optional)." />
            </span>
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus-visible:ring-emerald"
              name="url"
              placeholder="https://..."
              value={form.url ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
            />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary rounded-full px-6 py-3 text-sm">
              <PlusCircle className="h-4 w-4" />
              Save source
            </button>
          </div>
        </form>
      </Card>

      <Card title="Sample reviews" eyebrow="One-click import">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-sm text-white/65">
            Use the button to load the demo reviews or refresh your own sources.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary rounded-full px-5 py-2 text-sm"
              onClick={() => {
                handleImportSample().catch((err) => console.error(err));
              }}
              disabled={importSampleMutation.isPending}
            >
              <DatabaseZap className="h-4 w-4" />
              {importSampleMutation.isPending ? 'Loading...' : 'Fetch sample reviews'}
            </button>
          </div>
        </div>
      </Card>

      <Card title="Connected sources" eyebrow="Local list">
        {sources.length === 0 ? (
          <EmptyState
            title="No sources yet"
            description="Add your first source so the team knows where reviews originate."
          />
        ) : (
          <ul className="space-y-3">
            {sources.map((source) => (
              <li
                key={source.id}
                className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.05] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">{source.name}</h3>
                  <p className="text-xs text-white/60">
                    Platform: {source.platform || 'n/a'} | External ID: {source.external_id || 'n/a'}
                  </p>
                  {source.url && (
                    <a
                      className="text-xs text-emerald underline"
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.url}
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-ghost text-xs text-white/70 hover:text-white"
                  onClick={() => setPendingDelete(source)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {sources.length > 0 && (
        <Card title="Platform summary" eyebrow="Mix">
          <div className="space-y-2 text-sm text-white/70">
            {platformSummary.map((summary) => (
              <div key={summary.platform} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-2">
                <span className="text-white">{summary.platform}</span>
                <span>{summary.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {importSampleMutation.isPending && <Loader label="Syncing reviews..." />}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Remove source?"
        description={`This only removes the source from this list. Already added reviews stay on the dashboard.`}
        confirmLabel="Remove source"
        icon={<Trash2 className="h-5 w-5" />}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}













