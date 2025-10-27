import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type GridVariant = 'single' | 'double' | 'triple' | 'quad' | 'auto';

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GridVariant;
  gap?: 'sm' | 'md' | 'lg';
};

const variantMap: Record<GridVariant, string> = {
  single: 'grid-cols-1',
  double: 'grid-cols-1 md:grid-cols-2',
  triple: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  quad: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
  auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
};

const gapMap = {
  sm: 'gap-4 sm:gap-5',
  md: 'gap-6 sm:gap-8',
  lg: 'gap-8 sm:gap-10'
} as const;

export function Grid({ variant = 'triple', gap = 'md', className, ...props }: GridProps) {
  return (
    <div
      {...props}
      className={clsx(
        'grid',
        variantMap[variant],
        gapMap[gap],
        className
      )}
    />
  );
}
