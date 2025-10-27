import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type BadgeTone = 'muted' | 'emerald' | 'sapphire' | 'ruby';

const toneMap: Record<BadgeTone, string> = {
  muted: 'border-border bg-white text-muted',
  emerald: 'border-emerald/40 bg-emerald/10 text-emerald',
  sapphire: 'border-sapphire/40 bg-sapphire/10 text-sapphire',
  ruby: 'border-ruby/40 bg-ruby/10 text-ruby'
};

const baseClasses =
  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = 'muted', ...props }: BadgeProps) {
  return <span {...props} className={clsx(baseClasses, toneMap[tone], className)} />;
}
