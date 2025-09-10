import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useTokenRefresh() {
  const { refreshToken, logout } = useAuth();

  const handleTokenRefresh = useCallback(async () => {
    try {
      const result = await refreshToken();
      if (!result.success) {
        console.warn('Token refresh failed, logging out user');
        await logout();
      }
    } catch (error) {
      console.error('Error during token refresh:', error);
      await logout();
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    const setupTokenRefresh = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        // Refresh token every 50 minutes (tokens expire in 1 hour)
        refreshInterval = setInterval(handleTokenRefresh, 50 * 60 * 1000);
      }
    };

    setupTokenRefresh();

    // Listen for auth state changes to setup/cleanup refresh interval
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        // Clear existing interval and set new one
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
        refreshInterval = setInterval(handleTokenRefresh, 50 * 60 * 1000);
      } else {
        // Clear interval when logged out
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      }
    });

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      subscription.unsubscribe();
    };
  }, [handleTokenRefresh]);

  return { refreshToken: handleTokenRefresh };
}