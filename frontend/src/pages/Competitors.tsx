import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Award, Scale, Users } from 'lucide-react';
import type { Competitor, CompetitorCreate, SentimentSummary } from '#types';
import { useCompetitors, useCompetitorComparison } from '../lib/useApi';
import { formatNumber, formatPercent, sentimentBadgeBg } from '../lib/format';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import Loader from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';

const initialForm: CompetitorCreate = {
  name: '',
  url: '',
  description: '',
  tags: []
};

export default function CompetitorsPage() {
  const queryClient = useQueryClient();
  const { list, create, remove } = useCompetitors();
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Competitor | null>(null);

  const { data: comparison, isLoading: comparisonLoading, refetch } = useCompetitorComparison(selectedId ?? undefined);

  useEffect(() => {
    const items = list.data?.items ?? [];
    if (!selectedId && items.length) {
      setSelectedId(items[0].competitor_id);
    }
  }, [list.data?.items, selectedId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate(form, {
      onSuccess: (created) => {
        setForm(initialForm);
        setSelectedId(created.competitor_id);
        queryClient.invalidateQueries({ queryKey: ['competitor-comparison'] });
      }
    });
  };

  const handleCompare = (id: string) => {
    setSelectedId(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gradient">Competitors</h1>
        <p className="max-w-2xl text-sm text-white/65">
          Benchmark your experience against alternatives. Track how sentiment, topics, and share-of-voice evolve for every competitor.
        </p>
      </header>

      {list.error && <ErrorBanner message={list.error.message} />}

      <Card title="Add competitor" eyebrow="Manual entry">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/60">
            Name
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus-visible:ring-emerald"
              name="name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/60">
            Website
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus-visible:ring-emerald"
              name="url"
              value={form.url ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-2 text-xs uppercase tracking-wide text-white/60">
            Description
            <textarea
              className="min-h-[90px] rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus-visible:ring-emerald"
              name="description"
              value={form.description ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="How do they position themselves?"
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-2 text-xs uppercase tracking-wide text-white/60">
            Tags (comma separated)
            <input
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus-visible:ring-emerald"
              name="tags"
              value={form.tags?.join(', ') ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
                }))
              }
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="btn-primary rounded-full px-6 py-3 text-sm"
              disabled={create.isPending}
            >
              {create.isPending ? 'Saving...' : 'Add competitor'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Competitor roster" eyebrow={`${list.data?.pagination.total_items ?? 0} tracked`}>
        {list.isLoading ? (
          <Loader label="Loading competitors..." />
        ) : list.data?.items.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {list.data.items.map((competitor) => (
              <article
                key={competitor.competitor_id}
                className={`flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.05] p-4 ${
                  competitor.competitor_id === selectedId ? 'ring-2 ring-emerald' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{competitor.name}</h3>
                    <p className="text-xs text-white/60">
                      Updated {new Date(competitor.updated_at).toLocaleDateString()}
                    </p>
                    {competitor.url && (
                      <a
                        className="text-xs text-emerald underline"
                        href={competitor.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {competitor.url}
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-ghost rounded-full px-3 py-1 text-xs text-white/60 hover:text-white"
                    onClick={() => setPendingDelete(competitor)}
                  >
                    Remove
                  </button>
                </div>
                {competitor.description && (
                  <p className="text-sm text-white/70">{competitor.description}</p>
                )}
                {competitor.tags && competitor.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {competitor.tags.map((tag) => (
                      <span key={tag} className="tag bg-amethyst/20 text-amethyst">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary rounded-full px-4 py-2 text-xs"
                    onClick={() => handleCompare(competitor.competitor_id)}
                  >
                    Benchmark
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No competitors tracked"
            description="Add competing products to unlock comparative sentiment and topic deltas."
            action={
              <button
                type="button"
                className="btn-primary"
                onClick={() => document.querySelector<HTMLInputElement>('input[name="name"]')?.focus()}
              >
                Start tracking
              </button>
            }
            icon={<Users className="h-10 w-10 text-amethyst" />}
          />
        )}
      </Card>

      {comparisonLoading && <Loader label="Building comparison..." />}

      {comparison && (
        <Card title={`You vs. ${comparison.competitor.name}`} eyebrow="Sentiment delta">
          <div className="grid gap-4 md:grid-cols-2">
            <SentimentCard title="Your sentiment" summary={comparison.self_sentiment} />
            <SentimentCard title={comparison.competitor.name} summary={comparison.competitor_sentiment} />
          </div>
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-white">Topic deltas</h3>
            {comparison.top_topics.length ? (
              <table className="w-full text-left text-sm text-white/70">
                <thead className="text-xs uppercase text-white/40">
                  <tr>
                    <th className="pb-2">Topic</th>
                    <th className="pb-2">You</th>
                    <th className="pb-2">{comparison.competitor.name}</th>
                    <th className="pb-2">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {comparison.top_topics.map((topic) => (
                    <tr key={topic.topic_label}>
                      <td className="py-2 text-white">{topic.topic_label}</td>
                      <td className="py-2">{formatPercent(topic.self_share)}</td>
                      <td className="py-2">{formatPercent(topic.competitor_share)}</td>
                      <td className={`py-2 font-medium ${topic.delta > 0 ? 'text-emerald' : topic.delta < 0 ? 'text-ruby' : 'text-white/60'}`}>
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
        </Card>
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Remove competitor?"
        description="Historic digests and insights stay intact. This just removes the record from your active list."
        confirmLabel="Remove competitor"
        icon={<Award className="h-5 w-5" />}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            remove.mutate(pendingDelete.competitor_id);
            if (selectedId === pendingDelete.competitor_id) {
              setSelectedId(null);
            }
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}

function SentimentCard({ title, summary }: { title: string; summary: SentimentSummary }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <span className={`tag ${sentimentBadgeBg(summary.average_score > 0 ? 'Positive' : summary.average_score < 0 ? 'Negative' : 'Neutral')}`}>
          {summary.average_score.toFixed(2)}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm text-white/70">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/40">Positive</p>
          <p className="text-lg font-semibold text-emerald">{formatNumber(summary.positive)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/40">Neutral</p>
          <p className="text-lg font-semibold text-white/70">{formatNumber(summary.neutral)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/40">Negative</p>
          <p className="text-lg font-semibold text-ruby">{formatNumber(summary.negative)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-white/50">
        Based on {formatNumber(summary.review_count)} reviews
      </p>
    </div>
  );
}

