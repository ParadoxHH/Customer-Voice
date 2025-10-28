import { useMemo } from 'react';
import { ArrowRight, BarChart3, BellRing, MessageCircle, Sparkles } from 'lucide-react';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Button } from '../components/Button';
import { GradientUnderline } from '../components/GradientUnderline';
import { useAuth } from '../lib/auth';
import { useInsights } from '../lib/useInsights';
import type { RecentReview, TopicDistributionItem } from '#types';

type StatCard = { label: string; value: string; helper: string };
type HighlightCard = { title: string; detail: string; action: string };

const numberFormatter = new Intl.NumberFormat();

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function truncate(text: string, length = 140): string {
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length - 3)}...`;
}

function formatDate(dateIso: string): string {
  const date = new Date(dateIso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const {
    data: insights,
    loading,
    error,
    hasData: hasReviewData,
  } = useInsights({ token, enabled: Boolean(token), pageSize: 6 });

  const sourceLookup = useMemo(() => {
    if (!insights) {
      return new Map<string, string>();
    }
    return new Map(insights.source_breakdown.map((item) => [item.source_id, item.source_name]));
  }, [insights]);

  const statCards: StatCard[] = useMemo(() => {
    if (!insights || insights.pagination.total_items === 0) {
      return [
        {
          label: 'Reviews analysed',
          value: '0',
          helper: 'Connect your first source to begin ingesting feedback.',
        },
        {
          label: 'Positive sentiment',
          value: '--',
          helper: 'Sentiment trends appear after the first sync.',
        },
        {
          label: 'Needs attention',
          value: '--',
          helper: 'Negative reviews will display here once data is flowing.',
        },
      ];
    }

    const totalReviews = insights.pagination.total_items;
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    for (const point of insights.sentiment_trend) {
      positive += point.positive;
      neutral += point.neutral;
      negative += point.negative;
    }

    const totalSentimentTagged = positive + neutral + negative;
    const positiveShare = totalSentimentTagged ? Math.round((positive / totalSentimentTagged) * 100) : 0;
    const negativeReviews = totalSentimentTagged
      ? negative
      : insights.recent_reviews.filter((item) => item.sentiment.label === 'Negative').length;
    const sourceCount = insights.source_breakdown.length;

    return [
      {
        label: 'Reviews analysed',
        value: formatNumber(totalReviews),
        helper: sourceCount ? `${sourceCount} connected ${sourceCount === 1 ? 'source' : 'sources'}` : 'No sources yet',
      },
      {
        label: 'Positive sentiment',
        value: totalSentimentTagged ? `${positiveShare}%` : '--',
        helper: totalSentimentTagged ? `${formatNumber(positive)} positive mentions` : 'Awaiting sentiment data',
      },
      {
        label: 'Needs attention',
        value: formatNumber(negativeReviews),
        helper: totalSentimentTagged ? 'Negative reviews in the current period' : 'Negative sentiment will display here',
      },
    ];
  }, [insights]);

  const highlightCards: HighlightCard[] = useMemo(() => {
    if (!insights || insights.pagination.total_items === 0) {
      return [
        {
          title: 'Connect a review source',
          detail: 'Sync Google, Yelp, or App Store data to unlock live sentiment, topics, and alerts.',
          action: 'View connector guide',
        },
      ];
    }

    const cards: HighlightCard[] = [];
    const topTopic: TopicDistributionItem | undefined = insights.topic_distribution[0];
    const topSource = insights.source_breakdown[0];
    const latestTrend = insights.sentiment_trend[\u205f::last];

    if (topTopic) {
      cards.push({
        title: `Topic spotlight: ${topTopic.topic_label}`,
        detail: `${formatNumber(topTopic.review_count)} mentions with average confidence ${(topTopic.average_confidence * 100).toFixed(0)}%.`,
        action: 'Open topic report',
      });
    }

    if (latestTrend) {
      const totalDayReviews = latestTrend.positive + latestTrend.neutral + latestTrend.negative;
      const negativeShare = totalDayReviews ? Math.round((latestTrend.negative / totalDayReviews) * 100) : 0;
      cards.push({
        title: 'Latest sentiment pulse',
        detail: totalDayReviews
          ? `${formatNumber(latestTrend.positive)} positive, ${formatNumber(latestTrend.neutral)} neutral, ${formatNumber(
              latestTrend.negative,
            )} negative in the most recent window.`
          : 'Sentiment trend will populate after your first sync.',
        action: negativeShare >= 20 ? 'Review negative queue' : 'Share positive highlights',
      });
    } else if (topSource) {
      cards.push({
        title: 'Channel driving feedback',
        detail: `${topSource.source_name} contributed ${formatNumber(topSource.review_count)} reviews in this window.`,
        action: 'View source breakdown',
      });
    }

    return cards.length
      ? cards
      : [
          {
            title: 'Keep monitoring feedback',
            detail: 'Continue syncing data to surface the most impactful insights for your team.',
            action: 'Refresh dashboard',
          },
        ];
  }, [insights]);

  const recentFeedback: RecentReview[] = useMemo(() => {
    if (!insights) {
      return [];
    }
    return insights.recent_reviews.slice(0, 6);
  }, [insights]);

  const greetingName = useMemo(() => user?.display_name || user?.email || 'there', [user]);

  return (
    <div className="min-h-screen bg-section text-body">
      <header className="border-b border-border bg-white">
        <Container className="flex h-20 items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Customer Voice</p>
            <h1 className="text-xl font-semibold text-heading">Listening Workspace</h1>
          </div>
          <div className="hidden gap-3 md:flex">
            <Button variant="ghost" startIcon={<BellRing className="h-4 w-4" aria-hidden />}>
              Alerts
            </Button>
            <Button variant="primary" endIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
              Export insights
            </Button>
          </div>
        </Container>
      </header>

      <main>
        <Container className="py-12">
          <section className="rounded-3xl border border-border bg-white p-10 shadow-card-soft">
            <Pill icon={<Sparkles className="h-4 w-4" aria-hidden />} tone="emerald">
              Welcome back
            </Pill>
            <h2 className="mt-6 text-3xl font-semibold text-heading">
              {greetingName}, your customers have plenty to share today.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted">
              Track the health of every review channel, highlight what is resonating, and assign follow-up on risk alerts from one workspace.
            </p>
            {error ? (
              <p className="mt-6 rounded-2xl border border-ruby/30 bg-ruby/10 px-4 py-3 text-sm text-ruby">{error}</p>
            ) : null}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {statCards.map((stat) => (
                <Card key={stat.label} title={stat.value} description={stat.label}>
                  <p className="text-sm text-muted">{stat.helper}</p>
                </Card>
              ))}
              {loading ? (
                <div className="md:col-span-3">
                  <p className="rounded-2xl border border-border bg-section px-4 py-3 text-sm text-muted">Loading the latest insights...</p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            {highlightCards.map((highlight) => (
              <Card
                key={highlight.title}
                title={highlight.title}
                description={highlight.detail}
                icon={<BarChart3 className="h-6 w-6" aria-hidden />}
                actions={
                  <Button variant="ghost" size="sm" endIcon={<ArrowRight className="h-4 w-4" aria-hidden />} disabled={!hasReviewData}>
                    {highlight.action}
                  </Button>
                }
              />
            ))}
          </section>

          <section className="mt-12 rounded-3xl border border-border bg-white p-10 shadow-card-soft">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Pill icon={<MessageCircle className="h-4 w-4" aria-hidden />} tone="sapphire">
                  Latest signals
                </Pill>
                <h3 className="mt-3 text-2xl font-semibold text-heading">Recent feedback that deserves attention</h3>
                <p className="mt-2 text-sm text-muted">
                  Assign owners, add notes, and move conversations forward directly from the inbox.
                </p>
              </div>
              <Button variant="secondary">Open inbox</Button>
            </div>
            <div className="mt-8 space-y-4">
              {recentFeedback.length > 0 ? (
                recentFeedback.map((item) => {
                  const sourceName = sourceLookup.get(item.source_id) ?? 'Source unknown';
                  const summary = item.body ? truncate(item.body) : item.title || 'No review text provided.';
                  return (
                    <div key={item.review_id} className="flex items-start justify-between gap-6 rounded-2xl border border-border px-5 py-4">
                      <div>
                        <p className="text-sm text-heading">{summary}</p>
                        <p className="mt-1 text-xs text-muted">
                          Source: <span className="font-medium text-heading">{sourceName}</span>
                          {item.published_at ? `  ${formatDate(item.published_at)}` : null}
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-heading"
                        aria-label={`Sentiment ${item.sentiment.label}`}
                      >
                        <GradientUnderline>{item.sentiment.label}</GradientUnderline>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-border bg-section px-5 py-6 text-sm text-muted">
                  {loading
                    ? 'Loading recent feedback...'
                    : 'Recent reviews will appear here as soon as data is synced. Try importing sample data from the admin portal.'}
                </div>
              )}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}




