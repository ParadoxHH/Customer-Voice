import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type PillTone = 'gem' | 'emerald' | 'ruby';

const toneMap: Record<PillTone, string> = {
  gem: 'border border-border bg-section text-heading',
  emerald: 'border border-emerald/40 bg-emerald/10 text-emerald',
  ruby: 'border border-ruby/40 bg-ruby/10 text-ruby'
};

export type PillProps = HTMLAttributes<HTMLSpanElement> & {
  icon?: ReactNode;
  tone?: PillTone;
};

export function Pill({ className, icon, tone = 'gem', children, ...props }: PillProps) {
  return (
    <span
      {...props}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]',
        toneMap[tone],
        className
      )}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}
