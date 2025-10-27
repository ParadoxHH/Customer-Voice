import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import type { NavItem } from './NavBar';
import logo from '../assets/logo.svg';

interface SideNavProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  footer?: ReactNode;
}

export function SideNav({ open, onClose, navItems, footer }: SideNavProps) {
  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-40 w-72 transform bg-[var(--color-side)] px-4 py-6 text-[var(--color-text-primary)] backdrop-blur-xl transition duration-300 ease-out md:static md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
      aria-label="Sidebar navigation"
    >
      <div className="hidden items-center gap-3 px-2 md:flex">
        <img src={logo} alt="Customer Voice logo" className="h-8 w-8 rounded-2xl shadow-lg shadow-emerald/30" />
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Customer Voice</span>
      </div>
      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald',
                isActive
                  ? 'bg-gem-gradient text-white shadow-lg shadow-emerald/40'
                  : 'text-white/70 hover:bg-white/10'
              )
            }
            onClick={onClose}
          >
            <span className="text-[var(--color-text-primary)]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      {footer && <div className="mt-auto hidden md:block">{footer}</div>}
    </aside>
  );
}

export default SideNav;
