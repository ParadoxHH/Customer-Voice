import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
  id?: string;
  children: ReactNode;
}

export function Card({ title, eyebrow, action, className, id, children }: CardProps) {
  return (
    <section
      id={id}
      className={clsx('glass flex flex-col gap-6 p-6 text-[var(--color-text-primary)] transition-colors duration-300', className)}
    >
      {(title || eyebrow || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {eyebrow && <p className="text-xs uppercase tracking-widest text-white/60">{eyebrow}</p>}
            {title && <h2 className="text-lg font-semibold text-gradient">{title}</h2>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}

export default Card;

