export type ImpactStat = {
  value: string;
  label: string;
};

export type ScreenshotDetail = {
  title: string;
  description: string;
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export const impactStats: ImpactStat[] = [
  { value: '5 min', label: 'to first actionable insight' },
  { value: '4+', label: 'review sources connected per workspace' },
  { value: '12 hrs', label: 'saved every week vs manual tagging' },
  { value: '92%', label: 'sentiment accuracy benchmarked' },
  { value: '18%', label: 'lift in NPS within a quarter' },
  { value: '7x', label: 'faster backlog triage cycles' },
  { value: '40%', label: 'fewer escalations discovered late' },
  { value: '3x', label: 'more verified testimonials captured' },
  { value: '50+', label: 'ready-to-use topic templates' },
  { value: '100%', label: 'data encrypted in transit & at rest' },
  { value: '24/7', label: 'channel monitoring coverage' },
  { value: '90-day', label: 'trendline history retained automatically' },
  { value: '15', label: 'language locales supported' },
  { value: '1.2M+', label: 'feedback records processed monthly' },
  { value: '60 sec', label: 'average time to publish a digest' },
  { value: '35%', label: 'increase in review reply speed' },
  { value: '0', label: 'engineering hours required to onboard' },
  { value: '8/10', label: 'teams sharing dashboards in week one' },
  { value: '94%', label: 'internal stakeholder CSAT score' },
  { value: '20+', label: 'workflow integrations available' },
  { value: '2 clicks', label: 'to isolate any persona cohort' },
  { value: '30%', label: 'drop in duplicated research decks' },
  { value: '9/10', label: 'customers see better roadmap clarity' },
  { value: '48 hrs', label: 'to deploy across global regions' },
  { value: '6x', label: 'faster competitor coverage updates' },
  { value: '320+', label: 'voice-of-customer tags tracked' },
  { value: '75%', label: 'less spreadsheet maintenance' },
  { value: '3.5x', label: 'growth in positive quote library' },
  { value: '12', label: 'automated guardrails against bias' },
  { value: '99.9%', label: 'uptime sustained this year' },
  { value: '4 mins', label: 'average refresh interval' },
  { value: '18%', label: 'uplift in conversion copy tests' },
  { value: '28%', label: 'decline in unknown churn reasons' },
  { value: '14', label: 'stakeholder visualizations bundled' }
];
export const screenshotDetails: ScreenshotDetail[] = [
  { title: 'Multi-channel Inbox', description: 'Unified review stream with real-time filters.' },
  { title: 'Sentiment Radar', description: 'AI highlights praise and concern instantly.' },
  { title: 'Topic Clusters Map', description: 'Interactive clusters organized by intent strength.' },
  { title: 'Trendline Dashboard', description: '90-day view of momentum across focus areas.' },
  { title: 'Weekly Digest Builder', description: 'One-click summary ready for stakeholders.' },
  { title: 'Competitor Matchup', description: 'Benchmark satisfaction against strategic peers.' },
  { title: 'Experience KPIs', description: 'Track NPS, CSAT, and key conversions daily.' },
  { title: 'Response Templates', description: 'Guided replies tuned to brand voice.' },
  { title: 'Source Breakdown', description: 'Channel mix showing share of voice.' },
  { title: 'Theme Spotlight', description: 'Emerging topics auto-ranked by urgency.' },
  { title: 'Keyword Surfacing', description: 'Contextual search with relevance scoring.' },
  { title: 'Alert Timeline', description: 'Slack-ready notifications for spikes.' },
  { title: 'Integration Hub', description: 'Connect CRMs, support desks, and BI tools.' },
  { title: 'Persona Filter Deck', description: 'Compare sentiment by persona or segment.' },
  { title: 'Product Summary', description: 'Feature-level highs and lows in seconds.' },
  { title: 'Campaign Impact', description: 'Pre and post-launch feedback comparison.' },
  { title: 'Location Heatmap', description: 'Regional performance with drilldowns.' },
  { title: 'Journey Moments', description: 'Map quotes across the customer journey.' },
  { title: 'Backlog Prioritizer', description: 'RICE scoring fueled by voice-of-customer.' },
  { title: 'Priority Matrix', description: 'Effort vs impact for product leads.' },
  { title: 'Quote Library', description: 'Searchable repository of on-brand quotes.' },
  { title: 'Response Quality', description: 'QA controls for public replies.' },
  { title: 'Emerging Issues', description: 'Issue feed preventing late escalations.' },
  { title: 'Satisfaction Dial', description: 'Live gauge for loyalty signals.' },
  { title: 'Review Velocity', description: 'Track submission cadence and volume.' },
  { title: 'Launch Feedback', description: 'Countdown panel for new feature reactions.' },
  { title: 'Subscription Pulse', description: 'Retention signals from subscribers.' },
  { title: 'Support Channel Mix', description: 'Voice-of-customer across chat, email, phone.' },
  { title: 'Request Board', description: 'Auto-grouped roadmap ask backlog.' },
  { title: 'Segment Comparison', description: 'Baseline metrics for key customer cohorts.' },
  { title: 'Quality Monitor', description: 'Monitor service performance with detail.' },
  { title: 'Competitive Share', description: 'Share of sentiment vs top rivals.' },
  { title: 'Auto-tag Audit', description: 'Tag accuracy and retraining insights.' },
  { title: 'Theme Timeline', description: 'Timeline of topic volume by day.' },
  { title: 'Smart Digest Studio', description: 'Compose executive highlights in minutes.' }
];
export const testimonialsData: Testimonial[] = [
  {
    name: 'Maya Chen',
    role: 'Head of CX · Helio Travel',
    quote: 'We replaced five spreadsheets and finally agree on a single list of customer priorities.'
  },
  {
    name: 'Daniel Ortiz',
    role: 'Director of Support · CrispCart',
    quote: 'Daily triage now starts with Customer Voice dashboards—it tells us what to fix first.'
  },
  {
    name: 'Aisha Rahman',
    role: 'VP Product · ClarityHealth',
    quote: 'The AI labels are freakishly accurate; our roadmap meeting went from guesswork to action.'
  },
  {
    name: 'Jonas Weber',
    role: 'CEO · UrbanRides',
    quote: 'Exec digests read like an analyst wrote them and take under a minute to publish.'
  },
  {
    name: 'Priya Patel',
    role: 'Customer Insights Lead · Lumen Hotels',
    quote: 'Grouping feedback by journey stage showed exactly where check-in friction was hiding.'
  },
  {
    name: 'Oliver Grant',
    role: 'RevOps Manager · PeakGear',
    quote: 'Marketing pulls quotes straight from the library; no more late-night hunting for soundbites.'
  },
  {
    name: 'Tessa Nolan',
    role: 'Marketing Lead · StoryLane',
    quote: 'We caught a pricing concern within hours and rolled out a fix before churn could spike.'
  },
  {
    name: 'Malik Spencer',
    role: 'COO · Thrive Bistro',
    quote: 'Location heatmaps exposed a delivery issue in one market and we resolved it same day.'
  },
  {
    name: 'Elena Rossi',
    role: 'Director · Aurora Fitness',
    quote: 'Competitor benchmarking is the cleanest view I have seen—we finally know where we win.'
  },
  {
    name: 'Sofia Mendes',
    role: 'Head of Loyalty · Wave Airlines',
    quote: 'Themes shift fast and Customer Voice keeps our loyalty team ahead of the next promo.'
  },
  {
    name: 'Ivan Petrov',
    role: 'Product Strategy · NovaBank',
    quote: 'Security sign-off was a breeze and the dashboards became a weekly board artifact.'
  },
  {
    name: 'Carla Jimenez',
    role: 'CX Designer · Glow Beauty',
    quote: 'The persona filters make testing UX changes feel like science, not guesswork.'
  },
  {
    name: 'Patrick Osei',
    role: 'Insights Analyst · Rove Mobility',
    quote: 'We finally retired manual tagging—AI intent labels catch nuance our team missed.'
  },
  {
    name: 'Mina Okada',
    role: 'Customer Strategy · FreshFields',
    quote: 'Every regional lead gets the same digest, translated, with zero manual effort from us.'
  },
  {
    name: 'Rahul Sethi',
    role: 'VP Retention · SnapShop',
    quote: 'Churn interviews now start with proof from Customer Voice instead of opinions.'
  },
  {
    name: 'Claire Dubois',
    role: 'CX Researcher · Maison Lumiere',
    quote: 'Having a quote library means creative briefs ship with real customer language daily.'
  },
  {
    name: 'Miguel Alvarez',
    role: 'GM · HarborStay',
    quote: 'Review velocity alerts warn us before a bad weekend impacts bookings.'
  },
  {
    name: 'Ruth Anders',
    role: 'Support Lead · HushSleep',
    quote: 'Escalations dropped because ops sees the same warnings support does.'
  },
  {
    name: 'Paige Walker',
    role: 'Director of Digital · Meridian Resorts',
    quote: 'We track campaign impact pre and post-launch without building custom dashboards.'
  },
  {
    name: 'Hailey Brooks',
    role: 'Founder · BrightBox',
    quote: 'Even as a small team we feel enterprise-grade insight—setup took an afternoon.'
  },
  {
    name: 'Stefan Ionescu',
    role: 'Head of Ops · Alpine Adventures',
    quote: 'The journey timeline is perfect for aligning guides, support, and product.'
  },
  {
    name: 'Kiara Lewis',
    role: 'Senior PM · VeloCharge',
    quote: 'We prioritize roadmap items by impact instead of who shouts the loudest.'
  },
  {
    name: 'Owen Gallagher',
    role: 'Success Lead · Pinnacle CRM',
    quote: 'Clients love the clarity we bring—Customer Voice reports are now part of onboarding.'
  },
  {
    name: 'Anika Bose',
    role: 'CX Lead · Blossom Markets',
    quote: 'The weekly digest means leadership already knows the headline before Monday stand-up.'
  },
  {
    name: 'Jared Kim',
    role: 'GM Growth · Spark Studios',
    quote: 'Copy tests run faster because we see which benefits resonate by segment.'
  },
  {
    name: 'Lila Kasparov',
    role: 'Research Lead · Vista Clinics',
    quote: 'We monitor satisfaction dial-in near real time to prep clinicians for change.'
  },
  {
    name: 'Nikhil Rao',
    role: 'Director Analytics · SkyCater',
    quote: 'Ops stopped debating spreadsheets once we piped all reviews here.'
  },
  {
    name: 'Daniela Martins',
    role: 'Loyalty Manager · Coastline Cruises',
    quote: 'Proactive alerts saved us from a seasonal dip—we compensated guests immediately.'
  },
  {
    name: 'Morgan Ellis',
    role: 'VP Experience · Beacon Retail',
    quote: 'We evaluate store rollouts with data the same day associates report feedback.'
  },
  {
    name: 'Grace Howell',
    role: 'Support Operations · GreenHarvest',
    quote: 'Ticket responders reference Customer Voice to personalize apologies and offers.'
  },
  {
    name: 'Andre Costa',
    role: 'CX Ops · PulseGym',
    quote: 'Priority matrices help us coordinate fitness floor, product, and HQ without friction.'
  },
  {
    name: 'Helena Suarez',
    role: 'Digital Lead · AzureAir',
    quote: 'Localization plus theme clustering made our international roadmap obvious.'
  },
  {
    name: 'Yusuf Karim',
    role: 'Customer Ops · Ember Energy',
    quote: 'Bias guardrails keep the AI honest across the different wording our customers use.'
  },
  {
    name: 'Zoe Winters',
    role: 'Head of Retention · Meadow Apparel',
    quote: 'We track launch feedback by collection and adjust messaging before inventory lags.'
  },
  {
    name: 'Serena Long',
    role: 'Director CX · Harbor Eats',
    quote: 'The app gives us clarity fast enough to course-correct menus midweek.'
  }
];
