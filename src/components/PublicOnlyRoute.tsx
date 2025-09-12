import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

// If user is authenticated, redirect away from public-only pages (e.g., login/signup)
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, session } = useAuth();
  const location = useLocation();

  // Do not block public routes with a spinner during transient loading states
  // Always render the route when unauthenticated; if authenticated, redirect.

  if (user || session) {
    // Determine redirect destination based on user role (case-insensitive)
    let destination = '/student'; // default fallback
    const userRole = user?.role?.toLowerCase();
    
    if (userRole === 'admin') {
      destination = '/admin';
    } else if (userRole === 'student') {
      destination = '/student';
    } else if (userRole === 'warden') {
      destination = '/warden';
    }
    
    console.info('[PublicOnlyRoute] Auth present (user or session), redirecting based on role', { 
      from: location.pathname, 
      role: user?.role, 
      normalizedRole: userRole,
      destination 
    });
    return <Navigate to={destination} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export default PublicOnlyRoute;
