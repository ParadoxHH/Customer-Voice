import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface FAQItemProps extends HTMLAttributes<HTMLDivElement> {
  question: string;
  answer: ReactNode;
  defaultOpen?: boolean;
}

export function FAQItem({ question, answer, defaultOpen = false, className, ...props }: FAQItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      {...props}
      className={clsx('rounded-3xl border border-border bg-white shadow-card transition', open && 'border-emerald/40', className)}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-heading sm:text-lg">{question}</span>
        <ChevronDown
          className={clsx(
            'h-5 w-5 shrink-0 text-emerald transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0'
          )}
          aria-hidden
        />
      </button>
      <div
        className={clsx(
          'overflow-hidden px-6 text-sm text-muted transition-[max-height,opacity] duration-200 ease-gentle-ease',
          open ? 'max-h-72 pb-6 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {answer}
      </div>
    </div>
  );
}
