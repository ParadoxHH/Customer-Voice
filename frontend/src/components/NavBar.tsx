import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import logo from '../assets/logo.svg';
import { Button } from './Button';
import { Container } from './Container';

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface NavBarProps {
  links: NavLinkItem[];
}

export function NavBar({ links }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(11,15,20,0.72)] backdrop-blur-2xl">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 focus:outline-none" aria-label="Customer Voice Dashboard home">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gem-gradient shadow-[0_15px_35px_rgba(15,82,186,0.35)]">
            <img src={logo} alt="" className="h-8 w-8" />
            <span className="absolute inset-0 rounded-2xl border border-white/20" aria-hidden />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.45em] text-[color:var(--color-text-muted)]">
              Customer Voice
            </span>
            <span className="text-lg font-semibold text-white">Dashboard</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[color:var(--color-text-muted)] md:flex" aria-label="Primary">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="group relative transition hover:text-white">
              {link.label}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 scale-x-0 bg-gem-gradient transition-transform duration-200 ease-gem-ease group-hover:scale-x-100" aria-hidden />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button as={Link} to="/app" variant="ghost">
            Open App
          </Button>
          <Button as="a" href="#pricing" variant="primary" size="md">
            See Pricing
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="sr-only">Toggle navigation</span>
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </Container>

      <div
        id={menuId}
        className={clsx(
          'origin-top transform border-t border-white/10 bg-[rgba(11,15,20,0.92)] transition-all duration-200 ease-gem-ease md:hidden',
          open ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        )}
      >
        <nav className="space-y-2 px-6 py-6 text-base font-medium text-[color:var(--color-text-muted)]" aria-label="Mobile primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-2xl bg-white/5 px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Button as={Link} to="/app" variant="primary" className="w-full">
            Try Live Demo
          </Button>
        </nav>
      </div>
    </header>
  );
}
