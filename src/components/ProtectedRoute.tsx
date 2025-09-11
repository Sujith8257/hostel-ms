import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    console.debug('[ProtectedRoute] isLoading=true, showing spinner', { pathname: location.pathname });
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to login with the current location as state
    console.warn('[ProtectedRoute] No user, redirecting to /login', { from: location.pathname });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.debug('[ProtectedRoute] Access granted', { pathname: location.pathname, user });
  return <>{children}</>;
}
