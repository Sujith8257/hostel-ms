import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

// If user is authenticated, redirect away from public-only pages (e.g., login/signup)
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Do not block public routes with a spinner during transient loading states
  // Always render the route when unauthenticated; if authenticated, redirect.

  if (user) {
    console.info('[PublicOnlyRoute] User present, redirecting to /dashboard', { from: location.pathname });
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export default PublicOnlyRoute;
