import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description, className, ...props }: FeatureCardProps) {
  return (
    <article
      {...props}
      className={clsx('surface-card hover-lift flex h-full flex-col gap-4 rounded-3xl p-6 text-left', className)}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-section text-sapphire shadow-sm" aria-hidden>
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-heading">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </article>
  );
}
