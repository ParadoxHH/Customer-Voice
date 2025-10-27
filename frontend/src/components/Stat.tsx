import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: ReactNode;
  trend?: string;
  icon?: ReactNode;
  className?: string;
}

export function Stat({ label, value, trend, icon, className }: StatProps) {
  return (
    <div
      className={clsx(
        'glass flex flex-col gap-2 rounded-3xl border border-white/10 px-4 py-3 text-white',
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {trend && <p className="text-xs text-white/50">{trend}</p>}
    </div>
  );
}

export default Stat;
