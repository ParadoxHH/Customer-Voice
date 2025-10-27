import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface GradientUnderlineProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function GradientUnderline({ children, className, ...props }: GradientUnderlineProps) {
  return (
    <span {...props} className={clsx('gradient-underline', className)}>
      {children}
    </span>
  );
}
