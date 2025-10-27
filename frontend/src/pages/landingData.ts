import screenshotInbox from '../assets/screenshot-inbox.svg';
import screenshotDigest from '../assets/screenshot-digest.svg';
import screenshotCompare from '../assets/screenshot-compare.svg';
import screenshotHeatmap from '../assets/screenshot-heatmap.svg';

export type ImpactStat = {
  value: string;
  label: string;
};

export const impactStats: ImpactStat[] = [
  { value: '5 min', label: 'to publish your first insight summary' },
  { value: '4+ sources', label: 'connected by default across review platforms' },
  { value: '90-day', label: 'trendlines refreshed without manual effort' },
  { value: '92%', label: 'teams report faster prioritisation decisions' }
];

export type ScreenshotItem = {
  id: string;
  title: string;
  description: string;
  src: string;
  alt: string;
};

export const screenshotItems: ScreenshotItem[] = [
  {
    id: 'inbox',
    title: 'Unified Inbox',
    description: 'All reviews and survey notes stream into one clean table.',
    src: screenshotInbox,
    alt: 'Customer feedback inbox with filters applied'
  },
  {
    id: 'digest',
    title: 'Digest Builder',
    description: 'Weekly praise and complaints summarised for stakeholders.',
    src: screenshotDigest,
    alt: 'Digest summary showing praise and complaints cards'
  },
  {
    id: 'compare',
    title: 'Competitor Matchup',
    description: 'Benchmark sentiment and volume against other brands.',
    src: screenshotCompare,
    alt: 'Competitor comparison cards and charts'
  },
  {
    id: 'heatmap',
    title: 'Topic Heatmap',
    description: 'See which themes trend positive or negative over time.',
    src: screenshotHeatmap,
    alt: 'Heatmap of topics across sentiment axes'
  }
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    name: 'Maya Chen',
    role: 'Director of CX, Helio Travel',
    quote: 'The weekly digest keeps our leadership briefings focused on outcomes, not guesswork.'
  },
  {
    name: 'Daniel Ortiz',
    role: 'Support Lead, CrispCart',
    quote: 'We spotted a fulfilment bottleneck in hours and shipped a fix before churn could rise.'
  },
  {
    name: 'Priya Patel',
    role: 'Product Marketing, Lumen Labs',
    quote: 'Every launch now includes voice-of-customer data; the team moves from hunches to proof.'
  },
  {
    name: 'Jonas Weber',
    role: 'Founder, UrbanRides',
    quote: 'Benchmarks show exactly where we outperform. Our roadmap meetings run twice as fast.'
  }
];

export type FAQItem = {
  question: string;
  answer: string;
};

export const faqItems: FAQItem[] = [
  {
    question: 'Which feedback sources can I connect?',
    answer:
      'Start with Google, Yelp, App Store, Play Store, Trustpilot, and CSV uploads. Additional sources are available on Business and Pro plans.'
  },
  {
    question: 'Do I need developers to get value?',
    answer:
      'No engineering work is required. Connect your sources, import the provided sample data, and tailor alerts from the browser.'
  },
  {
    question: 'Can I invite my agency or franchise partners?',
    answer:
      'Yes. Workspaces allow unlimited viewer seats so agencies, franchise operators, or advisors can follow along securely.'
  },
  {
    question: 'How accurate is the sentiment classification?',
    answer:
      'Our lightweight sentiment model is tuned on 50k industry examples and is retrained quarterly. You can export labels for review at any time.'
  },
  {
    question: 'What is included in the weekly digest?',
    answer:
      'Each digest includes top three praises, top three complaints, trending topics, and a shareable executive summary ready for email or Slack.'
  },
  {
    question: 'Is there a contract or setup fee?',
    answer:
      'Monthly billing is available for Starter and Business plans. Pro plan subscribers can choose annual billing with priority onboarding.'
  }
];
