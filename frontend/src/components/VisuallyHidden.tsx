import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  return <span {...props} className={clsx('visually-hidden', className)} />;
}
