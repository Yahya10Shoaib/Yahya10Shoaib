import { Navigate, useLocation } from 'react-router-dom';

const ADMIN_KEY = 'isAdmin';

export function isAdmin(): boolean {
  return localStorage.getItem(ADMIN_KEY) === 'true';
}

export function setAdmin(value: boolean): void {
  if (value) localStorage.setItem(ADMIN_KEY, 'true');
  else localStorage.removeItem(ADMIN_KEY);
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isAdmin()) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
