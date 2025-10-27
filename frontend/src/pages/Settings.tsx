import { Palette, Moon, Sun } from 'lucide-react';
import Card from '../components/Card';
import { useTheme } from '../lib/theme';

const gradients = [
  { name: 'Sapphire', className: 'from-sapphire to-amethyst' },
  { name: 'Emerald', className: 'from-emerald to-sapphire' },
  { name: 'Ruby', className: 'from-ruby to-emerald' }
];

export default function SettingsPage() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gradient">Settings</h1>
        <p className="max-w-xl text-sm text-white/65">
          Tweak how the dashboard looks and preview the gem gradients we use for highlights.
        </p>
      </header>

      <Card title="Theme" eyebrow="Pick a look" className="space-y-4">
        <p className="text-sm text-white/65">
          Choose the style that feels best. We remember your choice on this device.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={theme === 'dark' ? 'btn-primary rounded-full px-5 py-2 text-sm' : 'btn-secondary rounded-full px-5 py-2 text-sm'}
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
          >
            <Moon className="h-4 w-4" />
            Dark mode
          </button>
          <button
            type="button"
            className={theme === 'light' ? 'btn-primary rounded-full px-5 py-2 text-sm' : 'btn-secondary rounded-full px-5 py-2 text-sm'}
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
          >
            <Sun className="h-4 w-4" />
            Light mode
          </button>
          <button type="button" className="btn-ghost rounded-full px-5 py-2 text-sm" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
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
              <p className="text-xs text-white/70">Used on buttons and highlights.</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
