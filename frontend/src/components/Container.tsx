import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ContainerSize = 'default' | 'wide';

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
};

const sizeMap: Record<ContainerSize, string> = {
  default: 'max-w-7xl',
  wide: 'max-w-[96rem]'
};

export function Container({ className, size = 'default', ...props }: ContainerProps) {
  return (
    <div
      {...props}
      className={clsx(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeMap[size],
        className
      )}
    />
  );
}
