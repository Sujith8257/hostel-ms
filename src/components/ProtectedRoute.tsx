import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, session, isLoading } = useAuth();
  const location = useLocation();

  console.debug('[ProtectedRoute] State check', { 
    isLoading, 
    hasUser: !!user, 
    hasSession: !!session, 
    userRole: user?.role,
    pathname: location.pathname 
  });

  if (isLoading) {
    console.debug('[ProtectedRoute] isLoading=true, showing spinner', { pathname: location.pathname });
    return <LoadingSpinner />;
  }

  // Consider a valid session as authenticated, even if profile/user is still loading
  if (!user && !session) {
    // Redirect to login with the current location as state
    console.warn('[ProtectedRoute] No user, redirecting to /login', { from: location.pathname });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.debug('[ProtectedRoute] Access granted', { pathname: location.pathname, user });
  return <>{children}</>;
}
