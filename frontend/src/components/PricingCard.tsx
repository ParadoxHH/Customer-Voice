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
        'glass gem-border flex h-full flex-col gap-6 rounded-[1.75rem] p-8',
        popular && 'relative border-emerald/60 shadow-[0_28px_80px_rgba(0,168,107,0.28)]'
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            {planLabels[tier]}
          </span>
          {popular ? (
            <span className="pill pill--emerald text-[10px] uppercase tracking-[0.28em]">
              Most Picked
            </span>
          ) : null}
        </div>
        <div className="text-4xl font-semibold text-white">
          {price}
          <span className="ml-2 text-base font-medium text-[color:var(--color-text-muted)]">
            /month
          </span>
        </div>
        <p className="text-sm text-[color:var(--color-text-muted)]">{description}</p>
      </div>

      <ul className="flex flex-col gap-3 text-sm text-[color:var(--color-text-body)]">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald/15 text-emerald">
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
