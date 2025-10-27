import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  LayoutDashboard,
  PlugZap,
  Users2,
  Sparkles,
  Settings2
} from 'lucide-react';
import DashboardPage from './pages/Dashboard';
import SourcesPage from './pages/Sources';
import CompetitorsPage from './pages/Competitors';
import DigestsPage from './pages/Digests';
import SettingsPage from './pages/Settings';
import { NavBar, type NavItem } from './components/NavBar';
import { SideNav } from './components/SideNav';

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Sources', to: '/sources', icon: <PlugZap className="h-4 w-4" /> },
  { label: 'Competitors', to: '/competitors', icon: <Users2 className="h-4 w-4" /> },
  { label: 'Digests', to: '/digests', icon: <Sparkles className="h-4 w-4" /> },
  { label: 'Settings', to: '/settings', icon: <Settings2 className="h-4 w-4" /> }
];

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-obsidian text-white md:pl-72">
      <SideNav
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navItems={navItems}
        footer={
          <p className="mt-8 px-4 text-xs text-white/40">
            &copy; {new Date().getFullYear()} Customer Voice.
          </p>
        }
      />
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          role="presentation"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <NavBar onMenuClick={() => setDrawerOpen(true)} />
        <main className="relative flex-1 px-4 pb-20 pt-6 md:px-10 md:pt-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="/competitors" element={<CompetitorsPage />} />
              <Route path="/digests" element={<DigestsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
