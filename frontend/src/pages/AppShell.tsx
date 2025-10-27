import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Plug,
  Upload,
  Sparkles,
  Settings,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Container } from '../components/Container';

const sideNavItems = [
  { label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" aria-hidden />, active: true },
  { label: 'Sources', icon: <Plug className="h-4 w-4" aria-hidden />, active: false },
  { label: 'Collections', icon: <Upload className="h-4 w-4" aria-hidden />, active: false },
  { label: 'Insights', icon: <BarChart3 className="h-4 w-4" aria-hidden />, active: false },
  { label: 'Automation', icon: <Sparkles className="h-4 w-4" aria-hidden />, active: false },
  { label: 'Settings', icon: <Settings className="h-4 w-4" aria-hidden />, active: false }
] as const;

export default function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[color:var(--color-text-body)]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(11,15,20,0.85)] backdrop-blur-2xl">
        <Container className="flex h-20 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 text-white focus:outline-none">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gem-gradient">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.38em] text-white/60">Customer Voice</p>
              <p className="text-lg font-semibold text-white">App Shell</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button as={Link} to="/" variant="ghost">
              Marketing Site
            </Button>
            <Button variant="primary">Publish Workspace</Button>
          </div>
        </Container>
      </header>

      <div className="mx-auto flex w-full max-w-[110rem] gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <aside className="hidden w-64 flex-shrink-0 flex-col gap-3 md:flex">
          <div className="glass gem-border rounded-3xl p-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">Navigation</p>
          </div>
          <nav className="space-y-2">
            {sideNavItems.map((item) => (
              <button
                type="button"
                key={item.label}
                className={[
                  'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition',
                  item.active
                    ? 'border-transparent bg-gem-gradient text-white shadow-[0_18px_45px_rgba(15,82,186,0.25)]'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                ].join(' ')}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/30">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex min-h-[70vh] flex-1 flex-col gap-8">
          <section className="glass gem-border rounded-[2.5rem] p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Workspace Preview</p>
                <h1 className="text-3xl font-semibold text-white">Customer Voice Dashboard</h1>
                <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-text-muted)]">
                  This placeholder shell shows how the live product chrome hugs your gem gradients.
                  Wire up real routes when you are ready to mount the production dashboard.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary">Invite teammate</Button>
                <Button variant="primary">Open builder</Button>
              </div>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Card
              title="Connect Sources"
              description="Add App Store, G2, Shopify, surveys, and NPS feeds. Each source inherits your gem-themed tags and privacy rules."
              actions={<Button variant="primary">Add source</Button>}
            >
              <p>Preview cards show how your future integrations will appear.</p>
            </Card>
            <Card
              title="Import Sample Data"
              description="Load provided sample feedback to explore sentiment, clustering, and digests without connecting live systems."
              actions={<Button variant="secondary">Run importer</Button>}
            >
              <p>Use this to rehearse flows with stakeholders before switching on production data.</p>
            </Card>
            <Card
              title="View Insights"
              description="Glass panels render key stats, digests, and trend lines so your team can align in minutes."
              actions={<Button variant="ghost">Browse playbook</Button>}
            >
              <p>Swap these placeholders with widgets from your dashboard as you wire up routes.</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
