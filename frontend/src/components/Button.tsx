import { clsx } from 'clsx';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<T>;

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-transform duration-200 ease-gentle-ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gem-gradient bg-[length:200%_200%] text-white shadow-card hover:-translate-y-0.5 hover:shadow-card-soft',
  secondary:
    'border border-border bg-white text-heading shadow-sm hover:-translate-y-0.5 hover:shadow-card',
  ghost:
    'text-heading border border-transparent hover:border-border hover:bg-section hover:-translate-y-0.5'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base'
};

export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType;

  return (
    <Component className={clsx(baseClasses, sizeClasses[size], variantClasses[variant], className)} {...rest}>
      {startIcon ? <span aria-hidden className="-ml-1 flex items-center">{startIcon}</span> : null}
      {children}
      {endIcon ? <span aria-hidden className="-mr-1 flex items-center">{endIcon}</span> : null}
    </Component>
  );
}
