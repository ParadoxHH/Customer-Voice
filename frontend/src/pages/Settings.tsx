import { useEffect, useState } from 'react';
import { ShieldCheck, Palette } from 'lucide-react';
import { persistDigestToken, getStoredDigestToken } from '../lib/api';
import Card from '../components/Card';

const gradients = [
  { name: 'Sapphire', className: 'from-sapphire to-amethyst' },
  { name: 'Emerald', className: 'from-emerald to-sapphire' },
  { name: 'Ruby', className: 'from-ruby to-emerald' }
];

export default function SettingsPage() {
  const [token, setToken] = useState<string>('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getStoredDigestToken();
    if (existing) setToken(existing);
  }, []);

  const ENV_API_URL = import.meta.env.VITE_API_URL ?? 'Not configured';

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    persistDigestToken(token.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gradient">Settings</h1>
        <p className="max-w-2xl text-sm text-white/65">
          Configure API access, demo tokens, and explore the gem-gradient theme used across the Customer Voice experience.
        </p>
      </header>

      <Card title="API configuration" eyebrow="Read-only">
        <dl className="space-y-3 text-sm text-white/70">
          <div>
            <dt className="text-xs uppercase tracking-wide text-white/50">API base URL</dt>
            <dd className="mt-1 font-mono text-xs text-white/80">{ENV_API_URL}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Digest token" eyebrow="Demo secret" className="space-y-4">
        <form className="space-y-3" onSubmit={handleSave}>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/60">
            Token (stored locally)
            <input
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus-visible:ring-emerald"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Bearer token used for demo digests"
            />
          </label>
          <button type="submit" className="btn-primary rounded-full px-6 py-3 text-sm">
            <ShieldCheck className="h-4 w-4" />
            Save token
          </button>
          {saved && <p className="text-xs text-emerald">Token stored locally.</p>}
        </form>
      </Card>

      <Card title="Theme preview" eyebrow="Gem gradients">
        <div className="grid gap-4 md:grid-cols-3">
          {gradients.map((gradient) => (
            <div
              key={gradient.name}
              className={`rounded-3xl border border-white/10 bg-gradient-to-br ${gradient.className} p-4 text-white shadow-lg shadow-black/30`}
            >
              <Palette className="h-5 w-5" />
              <p className="mt-4 text-sm font-semibold">{gradient.name}</p>
              <p className="text-xs text-white/70">Used for accent surfaces and call-to-action states.</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
