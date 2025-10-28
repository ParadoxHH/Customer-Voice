import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Container } from './Container';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-section text-muted">
        <Container>
          <div className="mx-auto max-w-sm rounded-3xl border border-border bg-white px-8 py-10 text-center shadow-card">
            <p className="text-base font-medium text-heading">Checking your access…</p>
            <p className="mt-2 text-sm text-muted">This only takes a moment.</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
