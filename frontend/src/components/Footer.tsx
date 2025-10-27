import { Link } from 'react-router-dom';
import { Container } from './Container';
import logo from '../assets/logo.svg';

const footerColumns = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Impact Stats', href: '#impact' },
      { label: 'Screenshots', href: '#screenshots' },
      { label: 'Pricing', href: '#pricing' }
    ]
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#hero' },
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: 'mailto:hello@customervoice.io' }
    ]
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Deployment', href: '#cloudflare' },
      { label: 'App Shell', href: '/app' },
      { label: 'Live Demo', href: '/app' },
      { label: 'Privacy', href: '#privacy' }
    ]
  }
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[rgba(11,15,20,0.85)] py-16 text-sm text-[color:var(--color-text-muted)]">
      <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3 text-white focus:outline-none">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gem-gradient shadow-[0_15px_35px_rgba(15,82,186,0.35)]">
              <img src={logo} alt="" className="h-7 w-7" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[color:var(--color-text-muted)]">
                Customer Voice
              </p>
              <p className="text-lg font-semibold text-white">Dashboard</p>
            </div>
          </Link>
          <p>Turn unsolicited feedback into plans you can act on. Customer Voice Dashboard helps teams answer “why” faster.</p>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            <span>Cloudflare Ready</span>
            <span>Secure</span>
            <span>GDPR</span>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.heading} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.26em] text-white/80">
              {column.heading}
            </h3>
            <ul className="space-y-3">
              {column.links.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="transition hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <Container className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row sm:items-center sm:justify-between text-[color:var(--color-text-muted)]">
        <p>&copy; {new Date().getFullYear()} Customer Voice. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#privacy" className="transition hover:text-white">
            Privacy
          </a>
          <a href="#terms" className="transition hover:text-white">
            Terms
          </a>
          <a href="mailto:hello@customervoice.io" className="transition hover:text-white">
            Email us
          </a>
        </div>
      </Container>
    </footer>
  );
}
