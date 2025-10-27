import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title = 'Nothing to show yet',
  description = 'Try adjusting your filters or ingesting fresh data.',
  action,
  icon
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center text-[var(--color-text-primary)]/70 transition-colors duration-300">
      {icon}
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-primary)]/60">{description}</p>
      </div>
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export default EmptyState;

