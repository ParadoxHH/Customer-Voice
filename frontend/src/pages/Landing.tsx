import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  Inbox,
  Network,
  Sparkles,
  Trophy,
  ShieldCheck,
  Gauge,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { Pill } from '../components/Pill';
import { Grid } from '../components/Grid';
import { Section } from '../components/Section';
import { Card } from '../components/Card';
import { LogoRow } from '../components/LogoRow';
import { FadeIn, SlideUp } from '../components/Motion';
import { ScreenshotCarousel } from '../components/ScreenshotCarousel';
import { PricingCard } from '../components/PricingCard';
import { FAQItem } from '../components/FAQItem';
import { TestimonialCard } from '../components/TestimonialCard';
import {
  impactStats,
  screenshotDetails,
  testimonialsData
} from './landingData';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Impact', href: '#impact' },
  { label: 'Screenshots', href: '#screenshots' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' }
];

const heroSubcopyLines = [
  'Aggregate every review, survey, and support note into one prioritized timeline.',
  'Spot the phrases customers repeat and understand the why behind them.',
  'Color-coded sentiment so you never guess how people actually feel.',
  'Automated ranking of issues by frequency and commercial impact.',
  'Compare emerging themes across marketplaces, stores, and regions.',
  'Instant filters for location, product line, channel, and persona.',
  'Slack, Teams, and webhook alerts when praise or pain trends spike.',
  'Weekly digest summarizing top wins and friction points for leadership.',
  'Executive snapshot built for board decks in under five minutes.',
  'Export on-brand quotes directly into campaign and product briefs.',
  'Secure workspaces so agencies and partner teams stay in sync.',
  'Designed for CX, product, and marketing leaders shipping decisions daily.'
] as const;

const features = [
  {
    title: 'Multi-platform Review Inbox',
    description: 'Unify App Store, G2, Shopify, Trustpilot, and survey feedback with smart deduping.',
    icon: <Inbox className="h-6 w-6 text-sapphire" aria-hidden />
  },
  {
    title: 'AI Sentiment Labels',
    description: 'Gem-tuned language models tag praise, risks, urgency, and emotion in seconds.',
    icon: <Sparkles className="h-6 w-6 text-emerald" aria-hidden />
  },
  {
    title: 'Topic & Theme Clusters',
    description: 'Visualize conversation clusters, intent strength, and volume trajectories by theme.',
    icon: <Network className="h-6 w-6 text-ruby" aria-hidden />
  },
  {
    title: 'Weekly Praise & Complaints Digest',
    description: 'Auto-assemble highlights, quotes, and quick wins for exec-ready digests.',
    icon: <CalendarClock className="h-6 w-6 text-amethyst" aria-hidden />
  },
  {
    title: 'Competitor Benchmarks',
    description: 'See where rivals delight or disappoint customers with share-of-voice comparisons.',
    icon: <Trophy className="h-6 w-6 text-sapphire" aria-hidden />
  }
] as const;

const pricingPlans = [
  {
    tier: 'starter' as const,
    price: '$49',
    description: 'For emerging CX teams connecting their first voice-of-customer sources.',
    ctaLabel: 'Start Starter Plan',
    href: '/signup/starter',
    features: [
      'Up to 3 team seats',
      'Connect 3 feedback sources',
      'AI sentiment & intent labels',
      'Weekly digest email summary',
      'Email support during business hours'
    ],
    popular: false
  },
  {
    tier: 'business' as const,
    price: '$99',
    description: 'For scaling brands syncing product, support, and marketing on one signal.',
    ctaLabel: 'Choose Business Plan',
    href: '/signup/business',
    features: [
      'Up to 12 team seats',
      'Unlimited feedback sources',
      'Competitor benchmarking suite',
      'Slack & Teams alerting',
      'Priority chat support'
    ],
    popular: true
  },
  {
    tier: 'pro' as const,
    price: '$249',
    description: 'For mature organizations needing governance, exports, and concierge enablement.',
    ctaLabel: 'Book Pro Onboarding',
    href: '/signup/pro',
    features: [
      'Unlimited seats & workspaces',
      'Advanced API & warehouse sync',
      'Custom scoring models & guardrails',
      'Single sign-on & role controls',
      'Dedicated success partner'
    ],
    popular: false
  }
] as const;

const faqItems = [
  {
    question: 'How fast can we launch Customer Voice Dashboard?',
    answer: (
      <p>
        Most teams connect their first sources and invite teammates in under 48 hours. Starter
        workspaces ship with guided setup videos and sample templates so you can see insight paths
        without waiting on data.
      </p>
    )
  },
  {
    question: 'Which integrations are supported today?',
    answer: (
      <p>
        Connect App Store, Google Play, G2, Trustpilot, Shopify, Salesforce, Zendesk, Intercom,
        HubSpot, Typeform, Delighted, and any CSV or webhook feed. Business and Pro tiers unlock API
        sync plus scheduled warehouse exports.
      </p>
    )
  },
  {
    question: 'Is our review data secure and compliant?',
    answer: (
      <p>
        Yes—data is encrypted in transit and at rest, we support SSO on the Pro plan, and every
        workspace includes audit trails. Customer Voice aligns with GDPR and SOC2 policies.
      </p>
    )
  },
  {
    question: 'Can agencies or franchises manage multiple brands?',
    answer: (
      <p>
        Absolutely. Create dedicated workspaces per brand or region, share reusable theme
        frameworks, and restrict access so partners only see the accounts you approve.
      </p>
    )
  },
  {
    question: 'Does this replace our existing BI dashboards?',
    answer: (
      <p>
        Customer Voice complements your BI stack. Export structured insights into Looker, Power BI,
        or Sheets, and keep qualitative context living where teams already collaborate.
      </p>
    )
  },
  {
    question: 'What support is included after onboarding?',
    answer: (
      <p>
        Starter includes email support, Business adds live chat, and Pro customers receive a
        dedicated success partner, quarterly roadmap reviews, and office hours for team training.
      </p>
    )
  }
] as const;

const gemPalette = ['#0F52BA', '#00A86B', '#E31B54', '#9966CC'] as const;

function createSvgDataUri(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createScreenshotPlaceholder(index: number, title: string) {
  const colorA = gemPalette[index % gemPalette.length];
  const colorB = gemPalette[(index + 1) % gemPalette.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
      <defs>
        <linearGradient id="grad-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="100%" stop-color="${colorB}" />
        </linearGradient>
      </defs>
      <rect width="960" height="600" fill="#0B0F14" />
      <rect x="32" y="32" width="896" height="536" rx="36" fill="url(#grad-${index})" opacity="0.72" />
      <g fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2">
        <rect x="96" y="120" width="768" height="360" rx="28" />
        <path d="M160 240H736" stroke-dasharray="12 12" />
        <path d="M160 320H736" stroke-dasharray="12 12" />
      </g>
      <text x="120" y="270" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="600">
        ${title}
      </text>
      <text x="120" y="330" fill="rgba(255,255,255,0.75)" font-family="Inter, Arial, sans-serif" font-size="24">
        Customer Voice Dashboard
      </text>
    </svg>
  `;
  return createSvgDataUri(svg);
}

function createAvatarPlaceholder(name: string, index: number) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const color = gemPalette[index % gemPalette.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <radialGradient id="avatar-${index}" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.55"/>
        </radialGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill="url(#avatar-${index})"/>
      <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" fill="#FFFFFF">
        ${initials}
      </text>
    </svg>
  `;
  return createSvgDataUri(svg);
}

function useReducedMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = () => setPrefersReducedMotion(media.matches);
    listener();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}

const TESTIMONIAL_PAGE_SIZE = 3;
const TESTIMONIAL_INTERVAL = 9000;

function TestimonialsCarousel({
  items
}: {
  items: Array<{ name: string; role: string; quote: string; avatar: string }>;
}) {
  const [startIndex, setStartIndex] = useState(0);
  const prefersReducedMotion = useReducedMotionPreference();
  const totalPages = Math.ceil(items.length / TESTIMONIAL_PAGE_SIZE);
  const activePage = Math.floor(startIndex / TESTIMONIAL_PAGE_SIZE) % totalPages;

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setStartIndex((prev) => (prev + TESTIMONIAL_PAGE_SIZE) % items.length);
    }, TESTIMONIAL_INTERVAL);
    return () => window.clearInterval(timer);
  }, [items.length, prefersReducedMotion]);

  const visibleItems = useMemo(
    () =>
      Array.from({ length: TESTIMONIAL_PAGE_SIZE }, (_, offset) => {
        const index = (startIndex + offset) % items.length;
        return items[index];
      }),
    [items, startIndex]
  );

  const handlePrevious = () => {
    setStartIndex((prev) => (prev - TESTIMONIAL_PAGE_SIZE + items.length) % items.length);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + TESTIMONIAL_PAGE_SIZE) % items.length);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.32em] text-white/70">
          Loved by revenue, product, and CX teams
        </p>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={handlePrevious}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/35 hover:text-white"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/35 hover:text-white"
            aria-label="Next testimonials"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={startIndex}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.22, 0.65, 0.4, 1] }}
        >
          <div className="grid gap-6 md:grid-cols-3">
            {visibleItems.map((item) => (
              <TestimonialCard key={`${item.name}-${item.role}`} {...item} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <button
            key={pageIndex}
            type="button"
            aria-label={`Show testimonials page ${pageIndex + 1}`}
            className="carousel-dot"
            data-active={pageIndex === activePage}
            onClick={() => setStartIndex(pageIndex * TESTIMONIAL_PAGE_SIZE)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const screenshots = useMemo(
    () =>
      screenshotDetails.map((detail, index) => ({
        id: `screenshot-${index}`,
        title: detail.title,
        description: detail.description,
        src: createScreenshotPlaceholder(index, detail.title),
        alt: `${detail.title} interface preview`
      })),
    []
  );

  const testimonials = useMemo(
    () =>
      testimonialsData.map((item, index) => ({
        ...item,
        avatar: createAvatarPlaceholder(item.name, index)
      })),
    []
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-white">
      <NavBar links={navLinks} />

      <main>
        <section id="hero" className="relative overflow-hidden pb-24 pt-20 sm:pt-28 lg:pt-32">
          <Container className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <FadeIn delay={0.1} className="relative">
              <div className="gem-border glass relative overflow-hidden rounded-[2.75rem] p-10 sm:p-12">
                <div className="hero-noise" aria-hidden />
                <div className="relative flex flex-col gap-8">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.38em] text-white/60">
                    <Pill tone="emerald">New</Pill>
                    <span>Launch faster with clarity</span>
                  </div>
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    Turn customer reviews into clear answers.
                  </h1>
                  <ul className="grid gap-3 text-sm text-[color:var(--color-text-muted)] sm:text-base">
                    {heroSubcopyLines.map((line) => (
                      <li key={line} className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-sapphire via-emerald to-ruby" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Button as={Link} to="/app" variant="primary" size="lg" className="cta-shadow">
                      Try Live Demo
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button as="a" href="#pricing" variant="secondary" size="lg">
                      See Pricing
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.32em] text-[color:var(--color-text-muted)]">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald" aria-hidden />
                      SOC2-ready
                    </span>
                    <span className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-sapphire" aria-hidden />
                      Cloudflare Optimized
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>

            <SlideUp delay={0.2} className="relative">
              <div className="relative flex h-full items-center justify-center">
                <motion.div
                  className="gem-border glass relative w-full rounded-[2.5rem] bg-[rgba(11,15,20,0.85)] p-6 shadow-[0_40px_80px_rgba(11,15,20,0.65)]"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 0.65, 0.4, 1] }}
                >
                  <div className="absolute -top-10 left-10 h-24 w-24 rounded-full bg-sapphire/35 blur-3xl" aria-hidden />
                  <div className="absolute -bottom-12 right-6 h-28 w-28 rounded-full bg-emerald/25 blur-3xl" aria-hidden />
                  <div className="relative flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.32em] text-white/70">Live Inbox</span>
                      <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
                        Auto clustering
                      </span>
                    </div>
                    <div className="space-y-4">
                      {screenshotDetails.slice(0, 4).map((detail) => (
                        <div key={detail.title} className="glass rounded-2xl p-4">
                          <p className="text-sm font-semibold text-white">{detail.title}</p>
                          <p className="text-xs text-white/60">{detail.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 p-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Digest ETA</p>
                        <p className="text-2xl font-semibold text-white">42 seconds</p>
                      </div>
                      <Button as={Link} to="/app" variant="ghost">
                        Generate Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </SlideUp>
          </Container>

          <Container className="mt-16">
            <LogoRow />
          </Container>
        </section>

        <Section
          id="features"
          eyebrow="Build alignment fast"
          title="Glassmorphism meets clarity—every feature pushes insight forward."
          description="Give every team a trusted, gem-accented control center. Customer Voice Dashboard translates raw commentary into launch-ready direction without extra tooling."
        >
          <Grid variant="triple">
            {features.map((feature) => (
              <Card
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </Grid>
        </Section>

        <Section
          id="impact"
          eyebrow="Momentum that compounds"
          title="Impact metrics teams brag about."
          description="From matchmaking customer quotes to staying ahead of competitor shocks, Customer Voice Dashboard becomes the heartbeat of your CX practice."
          containerSize="wide"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {impactStats.map((stat) => (
              <FadeIn key={stat.label}>
                <div className="glass gem-border h-full rounded-3xl p-6">
                  <span className="text-3xl font-semibold text-white">{stat.value}</span>
                  <p className="mt-3 text-sm text-[color:var(--color-text-muted)]">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Section>

        <Section
          id="screenshots"
          eyebrow="See it in action"
          title="Screenshots and mini demos across the dashboard."
          description="Hop between 35 views—from sentiment radar to executive digests. Every panel embraces gem-gradients, glass cards, and fast comprehension."
        >
          <ScreenshotCarousel items={screenshots} />
        </Section>

        <Section
          id="testimonials"
          eyebrow="Proof from real teams"
          title="35 leaders keep Customer Voice Dashboard open all day."
          description="From hospitality to fintech, teams lean on glassmorphism clarity to ship better decisions and celebrate wins with confidence."
        >
          <TestimonialsCarousel items={testimonials} />
        </Section>

        <Section
          id="pricing"
          eyebrow="Pricing"
          title="Plans that scale with every voice of customer program."
          description="Cloudflare Pages ready out of the box. Pick the plan that fits your team and activate in minutes."
          alignment="center"
        >
          <Grid variant="triple">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.tier} {...plan} />
            ))}
          </Grid>
        </Section>

        <Section
          id="faq"
          eyebrow="Questions"
          title="Answer a few key questions before you launch."
          description="Still curious? Our team is happy to share demo recordings or walk through custom requirements."
        >
          <div className="space-y-4">
            {faqItems.map((item) => (
              <FAQItem key={item.question} {...item} />
            ))}
          </div>
        </Section>

        <section
          id="cloudflare"
          className="relative py-24"
          aria-labelledby="cta-heading"
        >
          <Container>
            <div className="gem-border glass relative overflow-hidden rounded-[2.75rem] px-8 py-12 text-center md:px-16">
              <div className="hero-noise" aria-hidden />
              <div className="relative space-y-8">
                <h2 id="cta-heading" className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Your better website journey starts with customer voice clarity.
                </h2>
                <p className="mx-auto max-w-2xl text-base text-[color:var(--color-text-muted)]">
                  Ship Customer Voice Dashboard to Cloudflare Pages, invite your team, and start every
                  roadmap conversation with the words customers actually use.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button as={Link} to="/app" variant="primary" size="lg" className="cta-shadow">
                    Open the Live Demo
                  </Button>
                  <Button as="a" href="#pricing" variant="ghost" size="lg">
                    Review Plans
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
