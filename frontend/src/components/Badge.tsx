import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type BadgeTone = 'muted' | 'emerald' | 'sapphire' | 'ruby';

const toneMap: Record<BadgeTone, string> = {
  muted: 'border-white/15 text-[color:var(--color-text-muted)]',
  emerald: 'border-emerald/60 text-emerald/80',
  sapphire: 'border-sapphire/60 text-sapphire/70',
  ruby: 'border-ruby/60 text-ruby/70'
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = 'muted', ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={clsx(
        'badge uppercase tracking-[0.28em] text-[10px] font-semibold',
        toneMap[tone],
        className
      )}
    />
  );
}
