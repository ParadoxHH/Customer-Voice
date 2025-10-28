import { useMemo } from 'react';
import { ArrowRight, BarChart3, BellRing, MessageCircle, Sparkles } from 'lucide-react';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { Grid } from '../components/Grid';
import { Pill } from '../components/Pill';
import { Button } from '../components/Button';
import { GradientUnderline } from '../components/GradientUnderline';
import { useAuth } from '../lib/auth';

const STAT_CARDS = [
  { label: 'Reviews synced this week', value: '1,284', trend: '+12% vs last week' },
  { label: 'Promoters identified', value: '326', trend: '+6% uplift' },
  { label: 'Urgent follow-ups', value: '18', trend: 'Respond within 24h' },
];

const HIGHLIGHTS = [
  {
    title: 'Celebrate what customers love',
    detail: '“The automated digests make it effortless to share wins with leadership.”',
    action: 'Share weekly digest',
  },
  {
    title: 'Spot emerging risks early',
    detail: 'Spike in “delivery delays” topics over the last 48 hours.',
    action: 'Open topic timeline',
  },
];

const RECENT_FEEDBACK = [
  {
    id: 'rf-1',
    summary: '“Onboarding was fast. We went live in a day.”',
    source: 'G2',
    sentiment: 'Positive',
  },
  {
    id: 'rf-2',
    summary: '“Would love more control over email cadence.”',
    source: 'NPS',
    sentiment: 'Neutral',
  },
  {
    id: 'rf-3',
    summary: '“Support replies were slower than expected last week.”',
    source: 'Survey',
    sentiment: 'Negative',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
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
            <Pill icon={<Sparkles className="h-4 w-4" aria-hidden />} variant="emerald">
              Welcome back
            </Pill>
            <h2 className="mt-6 text-3xl font-semibold text-heading">
              {greetingName}, your customers have plenty to share today.
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted">
              Track the health of every review channel, highlight what is resonating, and assign follow-up on risk alerts from one
              workspace.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {STAT_CARDS.map((stat) => (
                <Card key={stat.label} title={stat.value} description={stat.label}>
                  <p className="text-sm text-emerald">{stat.trend}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            {HIGHLIGHTS.map((highlight) => (
              <Card
                key={highlight.title}
                title={highlight.title}
                description={highlight.detail}
                icon={<BarChart3 className="h-6 w-6" aria-hidden />}
                actions={
                  <Button variant="ghost" size="sm" endIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
                    {highlight.action}
                  </Button>
                }
              />
            ))}
          </section>

          <section className="mt-12 rounded-3xl border border-border bg-white p-10 shadow-card-soft">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Pill icon={<MessageCircle className="h-4 w-4" aria-hidden />} variant="sapphire">
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
              {RECENT_FEEDBACK.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-6 rounded-2xl border border-border px-5 py-4">
                  <div>
                    <p className="text-sm text-heading">{item.summary}</p>
                    <p className="mt-1 text-xs text-muted">
                      Source: <span className="font-medium text-heading">{item.source}</span>
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-heading"
                    aria-label={`Sentiment ${item.sentiment}`}
                  >
                    <GradientUnderline>{item.sentiment}</GradientUnderline>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
