import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  label: string;
}

export function StatCard({ value, label, className, ...props }: StatCardProps) {
  return (
    <div
      {...props}
      className={clsx(
        'surface-card hover-lift flex h-full flex-col items-start gap-2 rounded-3xl p-6 text-left sm:p-7',
        className
      )}
    >
      <span className="text-3xl font-bold text-heading">{value}</span>
      <p className="text-sm text-muted">{label}</p>
      <span className="mt-4 block h-1 w-12 rounded-full bg-gem-gradient" aria-hidden />
    </div>
  );
}
