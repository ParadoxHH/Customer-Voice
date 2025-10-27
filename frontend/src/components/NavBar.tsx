import { Menu } from 'lucide-react';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import logo from '../assets/logo.svg';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

interface NavBarProps {
  onMenuClick: () => void;
  slot?: ReactNode;
}

export function NavBar({ onMenuClick, slot }: NavBarProps) {
  return (
    <header
      className={clsx(
        'sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[rgba(11,15,20,0.9)]',
        'px-4 py-3 backdrop-blur-xl md:hidden'
      )}
      aria-label="Primary navigation"
    >
      <button
        type="button"
        onClick={onMenuClick}
        className="btn-ghost rounded-full border border-white/10 bg-white/5 p-2"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-emerald/40">
          <img src={logo} alt="" className="h-full w-full" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Customer Voice</p>
          <p className="text-xs text-white/60">Insights in real-time</p>
        </div>
      </div>
      <div>{slot}</div>
    </header>
  );
}

export default NavBar;
