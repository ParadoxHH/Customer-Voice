import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
};

export function Card({
  eyebrow,
  title,
  description,
  icon,
  actions,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <article
      {...props}
      className={clsx(
        'gem-border glass relative flex h-full flex-col gap-5 rounded-3xl p-6 sm:p-7',
        className
      )}
    >
      {(eyebrow || title || icon || actions) && (
        <header className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {icon ? (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-sky-200 shadow-[0_18px_40px_rgba(15,82,186,0.18)]">
                  {icon}
                </span>
              ) : null}
              <div className="space-y-1.5">
                {eyebrow ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-muted)]">
                    {eyebrow}
                  </p>
                ) : null}
                {title ? (
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                ) : null}
              </div>
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </div>
          {description ? (
            <p className="text-sm text-[color:var(--color-text-muted)]">{description}</p>
          ) : null}
        </header>
      )}
      {children ? <div className="flex flex-col gap-4 text-sm text-[color:var(--color-text-muted)]">{children}</div> : null}
    </article>
  );
}
