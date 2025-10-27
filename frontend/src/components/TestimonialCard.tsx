import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type TestimonialCardProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
};

export function TestimonialCard({ name, role, quote, avatar, className, ...props }: TestimonialCardProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      {...props}
      className={clsx('surface-card hover-lift flex h-full flex-col gap-6 rounded-3xl p-6 text-left', className)}
    >
      <p className="text-base text-heading">&ldquo;{quote}&rdquo;</p>
      <div className="mt-auto flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={`${name} headshot`}
            className="h-12 w-12 rounded-full border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-section text-sm font-semibold text-heading"
            aria-hidden
          >
            {initials}
          </span>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-heading">{name}</span>
          <span className="text-xs uppercase tracking-[0.28em] text-muted">
            {role}
          </span>
        </div>
      </div>
    </article>
  );
}
