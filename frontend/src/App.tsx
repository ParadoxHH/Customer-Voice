import { NavLink, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import SourcesPage from './pages/Sources';
import CompetitorsPage from './pages/Competitors';
import DigestsPage from './pages/Digests';

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Sources', to: '/sources' },
  { label: 'Competitors', to: '/competitors' },
  { label: 'Digests', to: '/digests' }
];

function App() {
  return (
    <div className="app-shell">
      <aside className="app-header">
        <h1>Customer Voice</h1>
        <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Monitor sentiment, spot topics, and ship proactive responses.
        </p>
        <nav className="bottom-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/competitors" element={<CompetitorsPage />} />
          <Route path="/digests" element={<DigestsPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
