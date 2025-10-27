import { clsx } from 'clsx';

const partnerLogos = [
  { name: 'Orbit Hotels', short: 'Orbit', aria: 'Orbit Hotels' },
  { name: 'Nexa Retail', short: 'Nexa', aria: 'Nexa Retail' },
  { name: 'Sprout Eats', short: 'Sprout', aria: 'Sprout Eats' },
  { name: 'Pulse Fitness', short: 'Pulse', aria: 'Pulse Fitness' },
  { name: 'Lumina Labs', short: 'Lumina', aria: 'Lumina Labs' },
  { name: 'EverNorth Bank', short: 'EverNorth', aria: 'EverNorth Bank' }
];

export interface LogoRowProps {
  className?: string;
}

export function LogoRow({ className }: LogoRowProps) {
  return (
    <div
      className={clsx(
        'glass gem-border flex flex-wrap items-center justify-center gap-8 rounded-3xl px-6 py-5 text-xs uppercase tracking-[0.4em] text-white/60 sm:gap-10 sm:px-8 sm:text-sm',
        className
      )}
    >
      {partnerLogos.map((logo) => (
        <span key={logo.name} aria-label={logo.aria} className="whitespace-nowrap">
          {logo.short}
        </span>
      ))}
    </div>
  );
}
