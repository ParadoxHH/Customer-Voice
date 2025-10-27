import { Link } from 'react-router-dom';
import { Container } from './Container';
import logo from '../assets/logo.svg';

const footerColumns = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Impact', href: '#impact' },
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
    <footer className="border-t border-border bg-section py-16 text-sm text-muted">
      <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3 text-heading focus:outline-none">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gem-gradient shadow-card">
              <img src={logo} alt="" className="h-7 w-7" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-muted">Customer Voice</p>
              <p className="text-lg font-semibold text-heading">Dashboard</p>
            </div>
          </Link>
          <p>
            Turn unsolicited feedback into plans you can act on. Customer Voice Dashboard converts raw reviews into
            confident, team-ready answers.
          </p>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-muted">
            <span>Cloudflare Ready</span>
            <span>Secure</span>
            <span>GDPR</span>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.heading} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.26em] text-heading">{column.heading}</h3>
            <ul className="space-y-3">
              {column.links.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition hover:text-heading">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <Container className="mt-12 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Customer Voice. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#privacy" className="transition hover:text-heading">
            Privacy
          </a>
          <a href="#terms" className="transition hover:text-heading">
            Terms
          </a>
          <a href="mailto:hello@customervoice.io" className="transition hover:text-heading">
            Email us
          </a>
        </div>
      </Container>
    </footer>
  );
}
