import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AppShell from './pages/AppShell';

export const routes: RouteObject[] = [
  { path: '/', element: <Landing /> },
  { path: '/app', element: <AppShell /> },
  { path: '*', element: <Navigate to="/" replace /> }
];
