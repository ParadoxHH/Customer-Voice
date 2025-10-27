import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Container, type ContainerProps } from './Container';
import { Badge } from './Badge';

type SectionAlignment = 'start' | 'center';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  alignment?: SectionAlignment;
  containerSize?: ContainerProps['size'];
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  alignment = 'start',
  containerSize = 'default',
  className,
  children,
  ...props
}: SectionProps) {
  const alignClass =
    alignment === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <section
      id={id}
      className={clsx('py-24 sm:py-28 lg:py-32', className)}
      {...props}
    >
      <Container
        size={containerSize}
        className="flex flex-col gap-10"
      >
        {(eyebrow || title || description) && (
          <header className={clsx('flex w-full flex-col gap-4', alignClass)}>
            {eyebrow ? <Badge tone="emerald">{eyebrow}</Badge> : null}
            {title ? (
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-heading sm:text-4xl lg:text-5xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-base text-muted sm:text-lg">
                {description}
              </p>
            ) : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
