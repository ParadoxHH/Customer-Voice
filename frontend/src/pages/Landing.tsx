import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  ArrowRight,
  Inbox,
  Sparkles,
  Network,
  CalendarCheck,
  BarChart3,
  Share2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { Container } from '../components/Container';
import { Section } from '../components/Section';
import { Button } from '../components/Button';
import { Pill } from '../components/Pill';
import { Grid } from '../components/Grid';
import { FeatureCard } from '../components/FeatureCard';
import { StatCard } from '../components/StatCard';
import { ScreenshotCarousel } from '../components/ScreenshotCarousel';
import { PricingCard } from '../components/PricingCard';
import { FAQItem } from '../components/FAQItem';
import { TestimonialCard } from '../components/TestimonialCard';
import { FadeIn, SlideUp } from '../components/Motion';
import { LogoRow } from '../components/LogoRow';
import { GradientUnderline } from '../components/GradientUnderline';
import { impactStats, screenshotItems, testimonials, faqItems } from './landingData';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Impact', href: '#impact' },
  { label: 'Screenshots', href: '#screenshots' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: 'mailto:hello@customervoice.io' }
];

const features = [
  {
    title: 'Multi-platform Review Inbox',
    description: 'Bring in Google, Yelp, App Store, Play Store, and survey feedback with smart de-duplication.',
    icon: <Inbox className="h-7 w-7" aria-hidden />
  },
  {
    title: 'AI Sentiment Labels',
    description: 'Auto-tag praise, risk, urgency, and intent so teams see what matters instantly.',
    icon: <Sparkles className="h-7 w-7" aria-hidden />
  },
  {
    title: 'Topic & Theme Clusters',
    description: 'Group feedback into themes and track how each topic trends across products.',
    icon: <Network className="h-7 w-7" aria-hidden />
  },
  {
    title: 'Weekly Praise & Complaints Digest',
    description: 'Ship ready-to-share digests highlighting the top three celebrations and concerns.',
    icon: <CalendarCheck className="h-7 w-7" aria-hidden />
  },
  {
    title: 'Competitor Benchmarks',
    description: 'See how your sentiment and volume compare to key competitors in each market.',
    icon: <BarChart3 className="h-7 w-7" aria-hidden />
  },
  {
    title: 'Simple Export & Sharing',
    description: 'Drop insights into decks, briefs, or Slack with clean exports and quick embeds.',
    icon: <Share2 className="h-7 w-7" aria-hidden />
  }
] as const;

const pricingPlans = [
  {
    tier: 'starter' as const,
    price: '$49',
    description: 'For emerging CX teams launching their customer voice programme.',
    ctaLabel: 'Start Starter Plan',
    href: '#signup-starter',
    features: ['1 data source', 'Up to 500 reviews analysed per month', 'AI sentiment and topic analysis', 'Weekly praise and complaints digest'],
    popular: false
  },
  {
    tier: 'business' as const,
    price: '$99',
    description: 'For growing brands coordinating product, support, and marketing.',
    ctaLabel: 'Choose Business Plan',
    href: '#signup-business',
    features: ['Up to 3 data sources', 'Up to 2,000 reviews analysed per month', 'Includes all Starter features', 'Competitive benchmarking for 1 competitor'],
    popular: true
  },
  {
    tier: 'pro' as const,
    price: '$249',
    description: 'For multi-location teams who need benchmarking at scale.',
    ctaLabel: 'Talk to Sales',
    href: '#signup-pro',
    features: ['Unlimited data sources', 'Up to 10,000 reviews analysed per month', 'Includes all Business features', 'Competitive benchmarking for 3 competitors', 'Priority support'],
    popular: false
  }
] as const;

export default function Landing() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const activeTestimonial = useMemo(() => testimonials[testimonialIndex], [testimonialIndex]);

  const handlePreviousTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div className="bg-white text-body">
      <NavBar links={navLinks} />
      <main>
        <section id="hero" className="relative overflow-hidden pb-16 pt-24 sm:pt-28">
          <Container className="relative flex flex-col gap-16">
            <FadeIn className="flex flex-col items-start gap-6 text-left lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-6">
                <Pill tone="gem">Customer Voice Dashboard</Pill>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold leading-tight text-heading sm:text-5xl lg:text-6xl">
                    Turn customer reviews into clear answers.
                  </h1>
                  <p className="text-lg text-muted">
                    Customer Voice Dashboard transforms reviews, surveys, and support notes into insights that product, CX,
                    and marketing teams can act on together.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button as={Link} to="/app" size="lg" endIcon={<ArrowRight className="h-5 w-5" aria-hidden />}>
                    Try Live Demo
                  </Button>
                  <Button as="a" href="#pricing" variant="secondary" size="lg">
                    See Pricing
                  </Button>
                </div>
              </div>
              <SlideUp className="w-full max-w-xl">
                <div className="surface-card rounded-[2.5rem] border border-border p-8 shadow-card-soft">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gem-gradient text-white shadow-card" aria-hidden>
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Live Preview</p>
                      <p className="text-lg font-semibold text-heading">Customer Voice Workspace</p>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-4 text-sm text-muted">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald" aria-hidden />
                      <span>Sentiment chart shows positive, neutral, and negative trends over the past 90 days.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-sapphire" aria-hidden />
                      <span>Digest builder highlights top praise and complaints for stakeholders each week.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-ruby" aria-hidden />
                      <span>Competitor benchmarks spotlight where you lead and where to focus next.</span>
                    </li>
                  </ul>
                </div>
              </SlideUp>
            </FadeIn>

            <FadeIn>
              <LogoRow className="mx-auto max-w-4xl" />
            </FadeIn>
          </Container>
        </section>

        <Section
          id="features"
          eyebrow="Why teams choose us"
          title={
            <GradientUnderline>
              Modern customer listening built for speed
            </GradientUnderline>
          }
          description="Everything you need to understand feedback, align stakeholders, and ship improvements that resonate."
        >
          <Grid variant="triple" gap="md">
            {features.map((feature) => (
              <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} />
            ))}
          </Grid>
        </Section>

        <Section
          id="impact"
          eyebrow="Impact in weeks"
          title="Proof that compounds quickly"
          description="Teams adopt Customer Voice to pinpoint opportunities faster, answer leadership questions with data, and keep improvements on track."
        >
          <Grid variant="quad" gap="md">
            {impactStats.map((stat) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </Grid>
        </Section>

        <Section
          id="screenshots"
          eyebrow="Product tour"
          title="A dashboard that keeps every voice in view"
          description="Explore the marketing site and app shell to see how insights, digests, and comparisons stay organised."
          containerSize="wide"
        >
          <ScreenshotCarousel items={screenshotItems} />
        </Section>

        <Section
          id="testimonials"
          eyebrow="Teams who rely on Customer Voice"
          title="Built for CX, product, and marketing leaders"
          description="From multi-location hospitality to fast-moving SaaS, Customer Voice helps teams understand the why behind every review."
          alignment="center"
        >
          <div className="mx-auto w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: 'easeOut' }}
              >
                <TestimonialCard {...activeTestimonial} className="min-h-[260px]" />
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-heading shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                  onClick={handlePreviousTestimonial}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-heading shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                  onClick={handleNextTestimonial}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.name}
                    type="button"
                    className={clsx(
                      'h-2.5 w-8 rounded-full border border-border/70 bg-section transition hover:border-emerald/60',
                      index === testimonialIndex && 'border-emerald/60 bg-emerald/30'
                    )}
                    aria-label={`Show testimonial from ${testimonial.name}`}
                    onClick={() => setTestimonialIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="pricing"
          eyebrow="Plans & pricing"
          title="Choose the plan that fits your review volume"
          description="Upgrade as your feedback footprint grows. Every plan includes the live demo workspace, importable sample data, and onboarding checklists."
        >
          <Grid variant="triple" gap="lg">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.tier} {...plan} />
            ))}
          </Grid>
        </Section>

        <Section
          id="faq"
          eyebrow="FAQ"
          title="Answers to common questions"
          description="Everything you need to know before you launch the Customer Voice Dashboard."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {faqItems.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </Section>

        <Section
          id="final-cta"
          alignment="center"
          className="pb-24"
          eyebrow="Ready to listen smarter?"
          title="Open the live demo and explore the dashboard"
          description="Import sample reviews, trigger a digest, and preview competitor benchmarks in minutes."
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-[2.5rem] border border-border bg-section p-10 text-center shadow-card-soft">
            <p className="text-lg text-muted">
              Customer Voice Dashboard is built for fast-moving teams who want every decision backed by customer proof.
            </p>
            <Button as={Link} to="/app" size="lg" endIcon={<ArrowRight className="h-5 w-5" aria-hidden />}>
              Open the Live Demo
            </Button>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
