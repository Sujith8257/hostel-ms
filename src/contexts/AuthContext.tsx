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
interface BackendLoginResponse {
  success: boolean;
  error?: string;
  data?: {
    user?: { id: string; email?: string };
    profile?: Partial<DbProfile> & { id?: string; full_name?: string; role?: UserRole; email?: string; created_at?: string };
    session?: { access_token: string; refresh_token: string };
  };
}

type MinimalProfile = Partial<DbProfile> & { id?: string; full_name?: string; role?: UserRole; email?: string; created_at?: string };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
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
        setIsLoading(false);
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

<<<<<<< HEAD
      const profileData = Array.isArray(data) ? data[0] : data;

      if (!profileData) {
        console.warn('[Auth] No profile found for user', userId);
        return;
=======
      if (profileData) {
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
>>>>>>> db49fe8 (major fix 2)
      }

      setProfile(profileData as DbProfile);
      // Map profile to User (ensure we use profileData.user_id for auth linkage but keep existing id usage for backwards compat)
      const userData: User = {
        id: profileData.id, // internal profile id (kept to avoid cascading changes)
        name: profileData.full_name,
        email: profileData.email,
        role: profileData.role,
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
      setIsLoading(true);
<<<<<<< HEAD
      console.log('[Auth] Attempting login for', email);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
=======
      const response = await fetch('/api/auth/login', {
>>>>>>> db49fe8 (major fix 2)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
<<<<<<< HEAD

  let result: BackendLoginResponse = { success: false };
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('[Auth] Failed to parse login response JSON', parseError);
        setIsLoading(false);
        return { success: false, error: 'Invalid server response' };
      }

      if (!result.success) {
        console.warn('[Auth] Login failed', result.error);
        setIsLoading(false);
        return { success: false, error: result.error || 'Login failed' };
      }

      const sessionPayload = result.data?.session;
      if (!sessionPayload?.access_token) {
        console.error('[Auth] Missing access token in login response');
        setIsLoading(false);
        return { success: false, error: 'Invalid session data received' };
      }

      // Set Supabase session FIRST so subsequent queries are authenticated
=======
      const result = await response.json();
      if (!result.success) {
        setIsLoading(false);
        return { success: false, error: result.error || 'Login failed' };
      }
      const sessionPayload = result.data?.session;
      if (!sessionPayload?.access_token) {
        setIsLoading(false);
        return { success: false, error: 'Invalid session data received' };
      }
      // Set Supabase session
>>>>>>> db49fe8 (major fix 2)
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: sessionPayload.access_token,
        refresh_token: sessionPayload.refresh_token,
      });
<<<<<<< HEAD

      if (sessionError) {
        console.error('[Auth] Session set error', sessionError);
        setIsLoading(false);
        return { success: false, error: sessionError.message };
      }

      // Immediately set user/profile from response to avoid extra round-trip + handle duplicate profiles scenario
      if (result.data?.profile) {
  setProfile(result.data.profile as DbProfile);
  const profileData = result.data.profile as MinimalProfile;
        const userData: User = {
          id: profileData.id || result.data?.user?.id || 'unknown-user',
          // NOTE: using profile row id; if you need auth user id elsewhere, consider adding a separate field
          name: profileData.full_name || 'User',
          email: profileData.email || result.data?.user?.email || 'unknown@example.com',
          role: (profileData.role || 'warden') as UserRole, // default to warden to keep UI functional
          createdAt: new Date(profileData.created_at || Date.now())
        };
        setUser(userData);
        // We don't have the full Session type payload here; rely on supabase.auth.onAuthStateChange to populate
        // Set loading false so UI (ProtectedRoute) can render dashboard
        setIsLoading(false);
      } else {
        // Fallback: fetch explicitly if backend did not return profile and user id is present
        if (result.data?.user?.id) {
          await fetchUserProfile(result.data.user.id);
        }
      }

      console.log('[Auth] Login successful, user state set');
      return { success: true };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      setIsLoading(false);
      return { success: false, error: 'Network error. Please check your connection.' };
=======
      if (sessionError) {
        setIsLoading(false);
        return { success: false, error: sessionError.message };
      }
      // Set user/profile from backend response
      if (result.data?.profile) {
        setProfile(result.data.profile as DbProfile);
        const profileData = result.data.profile;
        const userData: User = {
          id: profileData.id,
          user_id: profileData.user_id,
          name: profileData.full_name,
          email: profileData.email,
          role: profileData.role as 'admin' | 'warden' | 'student',
          createdAt: new Date(profileData.created_at),
        };
        setUser(userData);
      } else if (result.data?.user?.id) {
        await fetchUserProfile(result.data.user.id);
      }
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
>>>>>>> db49fe8 (major fix 2)
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
      setIsLoading(true);
      
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
      setIsLoading(false);
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
    try {
      setIsLoading(true);
      
      // Call backend logout first if we have a session
      const token = session?.access_token;
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          // Don't check response status - logout should always succeed on frontend
        } catch (backendError) {
          console.error('Backend logout error (continuing anyway):', backendError);
        }
      }
      
      // Clear Supabase session
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase logout error (continuing anyway):', error);
        }
      } catch (supabaseError) {
        console.error('Supabase logout error (continuing anyway):', supabaseError);
      }
      
      // Always clear local state regardless of API errors
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Clear any localStorage items
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('mock_user');
      
      // Force navigation to home page
      window.location.href = '/';
      
    } catch (err) {
      console.error('Logout error (continuing anyway):', err);
      // Force clear session even on error
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('mock_user');
      window.location.href = '/';
    } finally {
      setIsLoading(false);
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
