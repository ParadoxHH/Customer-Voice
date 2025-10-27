import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface ScreenshotItem {
  id: string;
  title: string;
  description: string;
  src: string;
  alt: string;
}

export interface ScreenshotCarouselProps {
  items: ScreenshotItem[];
  interval?: number;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mediaQuery.matches);
    update();

    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return reduced;
}

export function ScreenshotCarousel({ items, interval = 6500 }: ScreenshotCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const activeItem = useMemo(() => items[index % items.length], [index, items]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, items.length, isPaused, prefersReducedMotion]);

  const handlePrevious = () => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div
      className="relative flex w-full flex-col gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-section p-4 shadow-card">
        <AnimatePresence mode="wait">
          <motion.figure
            key={activeItem.id}
            className="relative overflow-hidden rounded-[1.5rem] bg-white shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: 'easeOut' }}
          >
            <img src={activeItem.src} alt={activeItem.alt} loading="lazy" className="h-full w-full object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/60 to-white/0 p-6">
              <div className="flex flex-col gap-2 text-left text-heading">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-muted">{activeItem.title}</p>
                <p className="text-lg font-semibold">{activeItem.description}</p>
              </div>
            </figcaption>
          </motion.figure>
        </AnimatePresence>

        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            type="button"
            onClick={handlePrevious}
            className="ml-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-heading transition hover:-translate-y-0.5 hover:shadow-card"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            type="button"
            onClick={handleNext}
            className="mr-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-heading transition hover:-translate-y-0.5 hover:shadow-card"
            aria-label="Next screenshot"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            className={clsx(
              'h-3 w-10 rounded-full border border-border/70 bg-section transition hover:border-emerald/50',
              itemIndex === index && 'border-emerald/60 bg-emerald/20'
            )}
            onClick={() => setIndex(itemIndex)}
            aria-label={`Show screenshot ${itemIndex + 1}: ${item.title}`}
            data-active={itemIndex === index}
          />
        ))}
      </div>
    </div>
  );
}
