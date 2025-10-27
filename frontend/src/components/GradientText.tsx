import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type GradientTextProps = HTMLAttributes<HTMLSpanElement>;

export function GradientText({ className, ...props }: GradientTextProps) {
  return <span {...props} className={clsx('gradient-text', className)} />;
}
