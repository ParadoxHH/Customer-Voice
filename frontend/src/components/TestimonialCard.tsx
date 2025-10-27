import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type TestimonialCardProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

export function TestimonialCard({ name, role, quote, avatar, className, ...props }: TestimonialCardProps) {
  return (
    <article
      {...props}
      className={clsx(
        'glass gem-border flex h-full flex-col gap-6 rounded-3xl p-6 text-left',
        className
      )}
    >
      <p className="text-base text-white/90">&ldquo;{quote}&rdquo;</p>
      <div className="mt-auto flex items-center gap-4">
        <img
          src={avatar}
          alt={`${name} headshot`}
          className="h-12 w-12 rounded-full border border-white/20 object-cover"
          loading="lazy"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{name}</span>
          <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--color-text-muted)]">
            {role}
          </span>
        </div>
      </div>
    </article>
  );
}
