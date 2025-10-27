import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type PillTone = 'gem' | 'emerald' | 'ruby';

const toneMap: Record<PillTone, string> = {
  gem: 'pill',
  emerald: 'pill pill--emerald',
  ruby: 'pill pill--ruby'
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
        'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]',
        toneMap[tone],
        className
      )}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}
