import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Navigate, useLocation } from 'react-router-dom';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

// If user is authenticated, redirect away from public-only pages (e.g., login/signup)
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    console.debug('[PublicOnlyRoute] isLoading=true, showing spinner', { pathname: location.pathname });
    return <LoadingSpinner />;
  }

  if (user) {
    console.info('[PublicOnlyRoute] User present, redirecting to /dashboard', { from: location.pathname });
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export default PublicOnlyRoute;
