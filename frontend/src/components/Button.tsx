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
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 ease-gem-ease focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[length:200%_200%] text-white shadow-[0_20px_45px_rgba(15,82,186,0.25)] focus-visible:ring-2 focus-visible:ring-emerald/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  secondary:
    'glass text-[color:var(--color-text-body)] hover:text-white focus-visible:ring-2 focus-visible:ring-emerald/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
  ghost:
    'text-[color:var(--color-text-muted)] hover:text-white focus-visible:ring-2 focus-visible:ring-emerald/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
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
    <Component
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        variant === 'primary' ? 'bg-gem-gradient hover:brightness-[1.08]' : '',
        className
      )}
      {...rest}
    >
      {startIcon ? <span aria-hidden className="-ml-1 flex items-center">{startIcon}</span> : null}
      {children}
      {endIcon ? <span aria-hidden className="-mr-1 flex items-center">{endIcon}</span> : null}
    </Component>
  );
}
