import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Plug,
  Upload,
  BarChart3,
  Sparkles,
  Settings,
  ShieldCheck,
  Database
} from 'lucide-react';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { GradientUnderline } from '../components/GradientUnderline';

type SourceFormState = {
  name: string;
  platform: string;
  identifier: string;
};

const initialForm: SourceFormState = {
  name: '',
  platform: '',
  identifier: ''
};

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

type SectionId = 'overview' | 'sources' | 'imports' | 'insights' | 'automation' | 'settings';

type SectionConfig = {
  id: SectionId;
  label: string;
  icon: ReactNode;
  ref: React.MutableRefObject<HTMLDivElement | null>;
};

export default function AppShell() {
  const [sources, setSources] = useState<SourceFormState[]>([]);
  const [formState, setFormState] = useState<SourceFormState>(initialForm);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importMessage, setImportMessage] = useState<string>('');
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  const overviewRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);
  const importsRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);
  const automationRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const sections: SectionConfig[] = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" aria-hidden />, ref: overviewRef },
      { id: 'sources', label: 'Sources', icon: <Plug className="h-4 w-4" aria-hidden />, ref: sourcesRef },
      { id: 'imports', label: 'Imports', icon: <Upload className="h-4 w-4" aria-hidden />, ref: importsRef },
      { id: 'insights', label: 'Insights', icon: <BarChart3 className="h-4 w-4" aria-hidden />, ref: insightsRef },
      { id: 'automation', label: 'Automation', icon: <Sparkles className="h-4 w-4" aria-hidden />, ref: automationRef },
      { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" aria-hidden />, ref: settingsRef }
    ],
    [automationRef, importsRef, insightsRef, overviewRef, settingsRef, sourcesRef]
  );

  const activeSectionRef = useRef<SectionId>('overview');
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const target = visible[0].target as HTMLElement;
          const match = sections.find((section) => section.ref.current === target);
          if (match && match.id !== activeSectionRef.current) {
            setActiveSection(match.id);
          }
        }
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.6, 0.8]
      }
    );

    sections.forEach((section) => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section.ref.current) {
          observer.unobserve(section.ref.current);
        }
      });
      observer.disconnect();
    };
  }, [sections]);

  const handleNavigate = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    const node = sections.find((section) => section.id === sectionId)?.ref.current;
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL;
  const digestToken = import.meta.env.VITE_DIGEST_TOKEN;

  const formValid = useMemo(
    () => formState.name.trim().length > 0 && formState.platform.trim().length > 0 && formState.identifier.trim().length > 0,
    [formState.name, formState.platform, formState.identifier]
  );

  const handleSubmitSource = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValid) {
      return;
    }
    setSources((prev) => [...prev, formState]);
    setFormState(initialForm);
  };

  const handleImportSampleData = async () => {
    if (!apiUrl) {
      setImportStatus('error');
      setImportMessage('Set VITE_API_URL in your environment to import sample data.');
      return;
    }

    setImportStatus('loading');
    setImportMessage('');

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'demo-sample',
          reviews: [
            {
              source_review_id: 'demo-sample-1',
              platform: 'sample',
              rating: 5,
              title: 'Demo sample review',
              body: 'Customer Voice makes it easy to find praise and complaints.',
              author: 'Sample User',
              captured_at: new Date().toISOString()
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Import failed with status ${response.status}`);
      }

      setImportStatus('success');
      setImportMessage('Sample data queued. Refresh insights shortly to explore the dashboard.');
    } catch (error) {
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'Import failed. Check your API URL and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-section text-body">
      <header className="border-b border-border bg-white">
        <Container className="flex h-20 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 focus:outline-none">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gem-gradient text-white shadow-card">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-muted">Customer Voice</p>
              <p className="text-lg font-semibold text-heading">App Shell</p>
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

      <Container size="wide" className="flex flex-col gap-8 py-10 lg:flex-row">
        <aside className="w-full max-w-xs space-y-4 lg:w-64 lg:flex-shrink-0">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Navigation</p>
          </div>
          <nav className="space-y-2" aria-label="App shell sections">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={clsx(
                    'group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-emerald/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                    isActive
                      ? 'border-transparent bg-gem-gradient text-white shadow-card'
                      : 'border-border bg-white text-muted shadow-sm hover:border-emerald/40 hover:text-heading'
                  )}
                  onClick={() => handleNavigate(section.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className={clsx(
                      'flex h-9 w-9 items-center justify-center rounded-xl shadow-sm',
                      isActive ? 'bg-white/20 text-white' : 'bg-section text-heading'
                    )}
                  >
                    {section.icon}
                  </span>
                  <span className={clsx('flex-1 text-left', isActive ? 'text-white' : 'text-heading')}>{section.label}</span>
                  {isActive ? <span className="h-1 w-8 rounded-full bg-white/70 transition group-hover:w-10" aria-hidden /> : null}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex min-h-[70vh] flex-1 flex-col gap-8">
          <section ref={overviewRef} id="overview" className="rounded-[2.5rem] border border-border bg-white p-8 shadow-card-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <Pill tone="gem">Workspace Preview</Pill>
                <h1 className="text-3xl font-semibold text-heading">Customer Voice Dashboard</h1>
                <p className="max-w-3xl text-sm text-muted sm:text-base">
                  This shell demonstrates the product chrome that will wrap the live dashboard. Add sources, try the sample data importer,
                  and wire buttons to backend endpoints when your API is ready.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary">Invite Teammate</Button>
                <Button variant="primary">Open Builder</Button>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section ref={sourcesRef} id="sources">
              <Card
                title="Connect Sources"
                description="Add a review or survey channel so the dashboard knows where to pull feedback."
                icon={<Plug className="h-6 w-6" aria-hidden />}
              >
                <form className="flex flex-col gap-4" onSubmit={handleSubmitSource}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold text-heading">Source name</span>
                      <input
                        type="text"
                        value={formState.name}
                        onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                        className="rounded-lg border border-border px-3 py-2 text-sm text-body focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/40"
                        placeholder="Downtown Location"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold text-heading">Platform</span>
                      <input
                        type="text"
                        value={formState.platform}
                        onChange={(event) => setFormState((prev) => ({ ...prev, platform: event.target.value }))}
                        className="rounded-lg border border-border px-3 py-2 text-sm text-body focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/40"
                        placeholder="Google, Yelp, App Store..."
                        required
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-heading">Source identifier</span>
                    <input
                      type="text"
                      value={formState.identifier}
                      onChange={(event) => setFormState((prev) => ({ ...prev, identifier: event.target.value }))}
                      className="rounded-lg border border-border px-3 py-2 text-sm text-body focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/40"
                      placeholder="Place ID, Business URL, survey slug..."
                      required
                    />
                  </label>
                  <div className="flex items-center justify-between gap-4">
                    <Button type="submit" variant="primary" disabled={!formValid}>
                      Save source
                    </Button>
                    <span className="text-xs text-muted">Sources sync automatically once connected.</span>
                  </div>
                </form>
                {sources.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    <GradientUnderline className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                      Connected sources
                    </GradientUnderline>
                    <ul className="space-y-2 text-sm text-heading">
                      {sources.map((source) => (
                        <li
                          key={`${source.platform}-${source.identifier}`}
                          className="flex items-center justify-between rounded-xl border border-border bg-section px-4 py-3"
                        >
                          <div>
                            <p className="font-semibold">{source.name}</p>
                            <p className="text-xs text-muted">
                              {source.platform} &middot; {source.identifier}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs text-emerald">
                            <Database className="h-3.5 w-3.5" aria-hidden />
                            Ready
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Card>
            </section>

            <section ref={importsRef} id="imports">
              <Card
                title="Import Sample Data"
                description="Load a demo dataset to preview insights before you connect live sources."
                icon={<Upload className="h-6 w-6" aria-hidden />}
                actions={
                  <Button type="button" variant="primary" onClick={handleImportSampleData} disabled={importStatus === 'loading'}>
                    {importStatus === 'loading' ? 'Importing…' : 'Import sample data'}
                  </Button>
                }
              >
                <p className="text-sm text-muted">
                  Sample data helps you practise stakeholder walkthroughs, test digest emails, and confirm the layout on every device.
                </p>
                {importStatus !== 'idle' ? (
                  <p
                    className={clsx(
                      'rounded-xl border px-4 py-3 text-sm',
                      importStatus === 'success'
                        ? 'border-emerald/40 bg-emerald/10 text-emerald'
                        : importStatus === 'error'
                          ? 'border-ruby/40 bg-ruby/10 text-ruby'
                          : 'border-border bg-section text-muted'
                    )}
                  >
                    {importMessage || (importStatus === 'loading' ? 'Sending request to /ingest…' : null)}
                  </p>
                ) : null}
                <p className="text-xs text-muted">
                  API base: {apiUrl ? <code className="rounded bg-section px-2 py-1">{apiUrl}</code> : 'Set VITE_API_URL to enable imports.'}
                </p>
              </Card>
            </section>

            <section ref={insightsRef} id="insights">
              <Card
                title="View Insights"
                description="Charts and digests unlock as soon as data lands. Keep this placeholder until the production dashboard mounts."
                icon={<BarChart3 className="h-6 w-6" aria-hidden />}
                actions={
                  <Button type="button" variant="secondary" disabled>
                    Waiting for data
                  </Button>
                }
              >
                <p className="text-sm text-muted">
                  Add widgets such as sentiment trends, topic clusters, and digest previews once your React routes are wired to live data sources.
                </p>
              </Card>
            </section>

            <section ref={automationRef} id="automation">
              <Card
                title="Run Digest (Optional)"
                description="Trigger the digest endpoint to preview the JSON payload that powers executive summaries."
                icon={<Sparkles className="h-6 w-6" aria-hidden />}
              >
                <p className="text-sm text-muted">
                  Use the <code className="rounded bg-section px-2 py-1">POST /digest/run</code> endpoint with{' '}
                  <code className="rounded bg-section px-2 py-1">Authorization: Bearer {'<token>'}</code>. Set{' '}
                  <code className="rounded bg-section px-2 py-1">VITE_DIGEST_TOKEN</code> to test from the browser.
                </p>
                <p className="text-xs text-muted">
                  {digestToken
                    ? 'A digest token is configured. Add UI logic here to show the returned summary.'
                    : 'Add VITE_DIGEST_TOKEN to your environment when you are ready to trigger real digests.'}
                </p>
              </Card>
            </section>

            <section ref={settingsRef} id="settings">
              <Card
                title="Workspace Settings"
                description="Fine-tune the demo environment so stakeholders see accurate data flows."
                icon={<Settings className="h-6 w-6" aria-hidden />}
                actions={
                  <Button as={Link} to="/#cloudflare" variant="ghost">
                    Deployment notes
                  </Button>
                }
              >
                <ul className="space-y-2 text-sm text-muted">
                  <li>
                    Confirm <code className="rounded bg-section px-2 py-1">VITE_API_URL</code> points to your Flask backend before sharing the demo.
                  </li>
                  <li>
                    Store <code className="rounded bg-section px-2 py-1">VITE_DIGEST_TOKEN</code> locally when you want to trigger secure digests.
                  </li>
                  <li>Swap placeholder cards with production widgets as routes come online.</li>
                </ul>
              </Card>
            </section>
          </div>
        </main>
      </Container>
    </div>
  );
}
