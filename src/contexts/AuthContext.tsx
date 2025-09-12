import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import type { DbProfile } from '@/types/database-models';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// async function myProcess() {
//   console.log("Starting the process...");
//   await sleep(15000); // Pauses the function here for 15 seconds
//   console.log("Process resumed after 15 seconds.");
// }
// myProcess();

interface AuthContextType {
  user: User | null;
  profile: DbProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, role?: UserRole, phone?: string, organization?: string, justification?: string) => Promise<{ success: boolean; error?: string }>;
  // logout: () => Promise<void>;
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
      console.log('[AuthProvider] Initial supabase.auth.getSession:', session);
      setSession(session);
      if (session?.user) {
        console.log('[AuthProvider] Session user found after reload:', session.user);
        await fetchUserProfile(session.user.id);
      } else {
        console.log('[AuthProvider] No session user found after reload.');
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
        console.log('[AuthProvider] Auth state change: session user found:', session.user);
        await fetchUserProfile(session.user.id);
      } else {
        console.log('[AuthProvider] Auth state change: no session user. Clearing context.');
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
        console.log('[Auth] setUser called with:', userData);
    } catch (err) {
      console.error('[Auth] Exception in fetchUserProfile:', err);
    } finally {
      setIsLoading(false);
    }
  };

const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    setIsLoading(true);
    console.log('[Auth] Step 1: Starting login for', email);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    console.log('[Auth] Step 2: Login response received', response);
    
    const result = await response.json();
    console.log('[Auth] Step 3: Parsed response JSON', result);

    if (!result.success) {
      console.warn('[Auth] Step 4: Login failed', result.error);
      setIsLoading(false);
      return { success: false, error: result.error || 'Login failed' };
    }

    const sessionPayload = result.data?.session;
    console.log('[Auth] Step 5: Session payload', sessionPayload);

    if (!sessionPayload?.access_token) {
      console.error('[Auth] Step 6: Invalid session data', sessionPayload);
      setIsLoading(false);
      return { success: false, error: 'Invalid session data received' };
    }
 
//     await supabase.auth.setSession({
//   access_token: sessionPayload.access_token,
//   refresh_token: sessionPayload.refresh_token,
// });
    // // Set Supabase session
    //   let sessionError;
    //   try {
    //     const timeout = setTimeout(() => {
    //       console.warn('[Auth] Step 6b: setSession is taking too long...');
    //     }, 5000);
    //     const result = await supabase.auth.setSession({
    //       access_token: sessionPayload.access_token,
    //       refresh_token: sessionPayload.refresh_token,
    //     });
    //     clearTimeout(timeout);
    //     sessionError = result.error;
    //     console.log('[Auth] Step 7: Supabase setSession result', sessionError);
    //   } catch (err) {
    //     console.error('[Auth] Step 7a: setSession threw error', err);
    //     setIsLoading(false);
    //     return { success: false, error: 'setSession threw: ' + err };
    //   }

    //   if (sessionError) {
    //     console.error('[Auth] Step 8: Session set error', sessionError);
    //     setIsLoading(false);
    //     return { success: false, error: sessionError.message };
    //   }

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
      console.log('[Auth] Step 8: Set user', userData);
      console.log('[Auth] Step 9: Set user and profile', userData, profileData);
    } else if (result.data?.user?.id) {
      console.log('[Auth] Step 10: Fetching user profile for', result.data.user.id);
      await fetchUserProfile(result.data.user.id);
    }
 await supabase.auth.setSession({
   access_token: sessionPayload.access_token,
   refresh_token: sessionPayload.refresh_token,
 });
 
 // Determine redirect based on user role
 let redirectPath = '/student'; // default
 if (result.data?.profile?.role) {
   const role = result.data.profile.role.toLowerCase();
   if (role === 'admin') {
     redirectPath = '/admin';
   } else if (role === 'warden') {
     redirectPath = '/warden';
   } else if (role === 'student') {
     redirectPath = '/student';
   }
 }
 
 console.log('[Auth] Redirecting to:', redirectPath, 'for role:', result.data?.profile?.role);
 window.location.href = redirectPath;

    // Do not handle navigation here. Let the caller (component) handle navigation after login.
    setIsLoading(false);
    return { success: true };
  } catch (err) {
    console.error('[Auth] Step 12: Login error (catch block)', err);
    setIsLoading(false);
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

;

  return (
    <AuthContext.Provider value={{ user, profile, session, login, signup, refreshToken, isLoading }}>
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