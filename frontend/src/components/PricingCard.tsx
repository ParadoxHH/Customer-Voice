import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { Button } from './Button';

type PlanTier = 'starter' | 'business' | 'pro';

export type PricingCardProps = HTMLAttributes<HTMLDivElement> & {
  tier: PlanTier;
  price: string;
  description: string;
  ctaLabel: string;
  href: string;
  features: ReadonlyArray<string>;
  popular?: boolean;
};

const planLabels: Record<PlanTier, string> = {
  starter: 'Starter',
  business: 'Business',
  pro: 'Pro'
};

export function PricingCard({
  tier,
  price,
  description,
  ctaLabel,
  href,
  features,
  popular = false,
  className,
  ...props
}: PricingCardProps) {
  return (
    <article
      {...props}
      className={clsx(
        'surface-card hover-lift flex h-full flex-col gap-6 rounded-[1.75rem] p-8',
        popular && 'border-emerald/40 shadow-card-soft',
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-muted">
            {planLabels[tier]}
          </span>
          {popular ? (
            <span className="rounded-full border border-emerald/40 bg-emerald/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald">
              Most Picked
            </span>
          ) : null}
        </div>
        <div className="text-4xl font-semibold text-heading">
          {price}
          <span className="ml-2 text-base font-medium text-muted">
            /month
          </span>
        </div>
        <p className="text-sm text-muted">{description}</p>
      </div>

      <ul className="flex flex-col gap-3 text-sm text-body">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button as="a" href={href} variant={popular ? 'primary' : 'secondary'} className="w-full" size="lg">
        {ctaLabel}
      </Button>
    </article>
  );
}
