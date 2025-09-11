/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import type { DbProfile } from '@/types/database-models';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: DbProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, role?: UserRole, phone?: string, organization?: string, justification?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

// Narrow type for login response to avoid any
// Note: Keep types minimal and only what we use to avoid unused declarations errors

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Small helper to keep track of loading toggles
  const setLoading = (value: boolean, reason: string) => {
    console.info('[Auth] setLoading', { value, reason });
    setIsLoading(value);
  };

  // Force navigation to home page with fallbacks to avoid any SPA/router interference
  const HOME_PATH = import.meta.env.BASE_URL || '/';
  const hardRedirectHome = () => {
    try {
      window.location.replace(HOME_PATH);
    } catch {
      window.location.href = HOME_PATH;
    }
    // If navigation didn’t happen immediately, try again shortly
    setTimeout(() => {
      if (window.location.pathname !== HOME_PATH) {
        try {
          window.location.assign(HOME_PATH);
        } catch {
          window.location.href = HOME_PATH;
        }
      }
    }, 50);
    // Last resort: add a cache-busting query to ensure reload
    setTimeout(() => {
      if (window.location.pathname !== HOME_PATH) {
        const sep = HOME_PATH.includes('?') ? '&' : '?';
        window.location.href = `${HOME_PATH}${sep}t=${Date.now()}`;
      }
    }, 200);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setLoading(false, 'initial: no session');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] State change:', event, { hasSession: !!session, hasUser: !!session?.user });
      
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false, 'auth-change: no session');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Use ordering + limit instead of .single() to avoid failure when duplicates exist temporarily
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[Auth] Error fetching profile:', error);
        return;
      }

      const profileData = Array.isArray(data) ? data[0] : data;
      if (!profileData) {
        console.warn('[Auth] No profile found for user', userId);
        return;
      }
      setProfile(profileData as DbProfile);
      // Convert profile to User format for backward compatibility
      const userData: User = {
        id: profileData.id,
        name: profileData.full_name,
        email: profileData.email,
        role: profileData.role as 'admin' | 'warden' | 'student',
        createdAt: new Date(profileData.created_at),
      };
      setUser(userData);
    } catch (err) {
      console.error('[Auth] Exception in fetchUserProfile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true, 'login:start');
      console.log('[Auth] Attempting login for', email);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (!result.success) {
        setLoading(false, 'login:backend result.success=false');
        return { success: false, error: result.error || 'Login failed' };
      }
      const sessionPayload = result.data?.session;
      if (!sessionPayload?.access_token) {
        setLoading(false, 'login:invalid session payload');
        return { success: false, error: 'Invalid session data received' };
      }
      // Set Supabase session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: sessionPayload.access_token,
        refresh_token: sessionPayload.refresh_token,
      });

      if (sessionError) {
        console.error('[Auth] Session set error', sessionError);
        setLoading(false, 'login:setSession error');
        return { success: false, error: sessionError.message };
      }

      // Immediately reflect session in context to avoid navigation races
      try {
        const { data: { session: newSession } } = await supabase.auth.getSession();
        setSession(newSession);
        console.info('[Auth] Session set in context after login', { hasSession: !!newSession, hasUser: !!newSession?.user });
      } catch (getSessionErr) {
        console.warn('[Auth] Could not retrieve session after login (continuing)', getSessionErr);
      }

      // Set user/profile from backend response
      if (result.data?.profile) {
        setProfile(result.data.profile as DbProfile);
        const profileData = result.data.profile;
        const userData: User = {
          id: profileData.id,
          name: profileData.full_name,
          email: profileData.email,
          role: profileData.role as 'admin' | 'warden' | 'student',
          createdAt: new Date(profileData.created_at),
        };
        setUser(userData);
      } else if (result.data?.user?.id) {
        await fetchUserProfile(result.data.user.id);
      }
      setLoading(false, 'login:success');
      // Force navigation to dashboard immediately after successful login
      try {
        console.info('[Auth] Login success, forcing redirect to /dashboard');
        window.location.replace('/dashboard');
      } catch (e) {
        console.warn('[Auth] Redirect to /dashboard failed, falling back', e);
        window.location.href = '/dashboard';
      }
      return { success: true };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      setLoading(false, 'login:exception');
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole = 'warden',
    phone?: string,
    organization?: string,
    justification?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true, 'signup:start');
      
      // Use backend API for signup
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          fullName, 
          role, 
          phone, 
          organization, 
          justification 
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false, 'signup:finally');
    }
  };

  const refreshToken = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.refresh_token) {
        return { success: false, error: 'No refresh token available' };
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: currentSession.refresh_token }),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Set new session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token,
      });

      if (sessionError) {
        return { success: false, error: sessionError.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Token refresh error:', err);
      return { success: false, error: 'Failed to refresh token' };
    }
  };

  const logout = async (): Promise<void> => {
    console.info('[Auth] Logout: start');
    try {
      // Do not set global isLoading to avoid ProtectedRoute spinner loops; rely on local UI state
      // Call backend logout first if we have a session
      const token = session?.access_token;
      if (token) {
        try {
          console.info('[Auth] Logout: calling backend /logout');
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2000);
          try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            });
          } finally {
            clearTimeout(timer);
          }
        } catch (backendError) {
          console.warn('[Auth] Logout: backend logout error (continuing)', backendError);
        }
      } else {
        console.info('[Auth] Logout: no access token present, skipping backend call');
      }

      // Clear Supabase session
      try {
        console.info('[Auth] Logout: supabase.auth.signOut()');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('[Auth] Logout: Supabase signOut error (continuing)', error);
        }
      } catch (supabaseError) {
        console.warn('[Auth] Logout: Supabase signOut threw (continuing)', supabaseError);
      }

      // Always clear local state regardless of API errors
      setUser(null);
      setProfile(null);
      setSession(null);
      console.info('[Auth] Logout: cleared context state');

      // Best-effort: clear all accessible cookies for this site (cannot clear HttpOnly cookies)
      try {
        const cookies = document.cookie ? document.cookie.split('; ') : [];
        const host = window.location.hostname;
        const parts = host.split('.');
        const domainVariants = new Set<string>();
        for (let i = 0; i < parts.length; i++) {
          const d = parts.slice(i).join('.');
          if (d) {
            domainVariants.add(d);
            domainVariants.add('.' + d);
          }
        }
        const segments = window.location.pathname.split('/').filter(Boolean);
        const pathVariants = new Set<string>(['/']);
        for (let i = 0; i < segments.length; i++) {
          pathVariants.add('/' + segments.slice(0, i + 1).join('/'));
        }
        cookies.forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
          // Basic delete
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          // Try domain/path combinations
          domainVariants.forEach((domain) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; path=/`;
            pathVariants.forEach((path) => {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; path=${path}`;
            });
          });
          // Try path-only variants without domain
          pathVariants.forEach((path) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
          });
        });
        console.info(`[Auth] Logout: attempted to clear ${cookies.length} cookie name(s)`);
      } catch (cookieErr) {
        console.warn('[Auth] Logout: cookie clearing failed (continuing)', cookieErr);
      }

      // Best-effort: clear localStorage auth keys (may vary by Supabase config)
      try { localStorage.removeItem('mock_user'); } catch { /* ignore */ }
      try { localStorage.removeItem('supabase.auth.token'); } catch { /* ignore */ }
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k) continue;
          if ((k.startsWith('sb-') && k.includes('auth-token')) || k.startsWith('supabase.')) {
            toRemove.push(k);
          }
        }
        toRemove.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
      } catch { /* ignore */ }

      // Force hard navigation to landing page to avoid router race conditions
      console.info('[Auth] Logout: redirecting to home');
      hardRedirectHome();
    } catch (err) {
      console.error('[Auth] Logout: unexpected error (continuing to redirect)', err);
      setUser(null);
      setProfile(null);
      setSession(null);
      hardRedirectHome();
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, login, signup, logout, refreshToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const useAuthContext = useAuth;