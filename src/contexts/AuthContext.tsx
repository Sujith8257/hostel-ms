import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy credentials for testing
const DUMMY_USERS: User[] = [
  {
    id: '1',
    name: 'System Administrator',
    email: 'admin@hostelms.com',
    role: 'admin',
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    email: 'director@hostelms.com',
    role: 'hostel_director',
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Mr. Suresh Warden',
    email: 'warden@hostelms.com',
    role: 'warden',
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'Ms. Priya Deputy',
    email: 'deputy@hostelms.com',
    role: 'deputy_warden',
    createdAt: new Date()
  },
  {
    id: '5',
    name: 'Mr. Amit Assistant',
    email: 'assistant@hostelms.com',
    role: 'assistant_warden',
    createdAt: new Date()
  },
  {
    id: '6',
    name: 'Ms. Kavya Floor',
    email: 'floor@hostelms.com',
    role: 'floor_incharge',
    floorNumber: 2,
    hostelBlock: 'Block A',
    createdAt: new Date()
  }
];

const DUMMY_PASSWORDS: Record<string, string> = {
  'admin@hostelms.com': 'admin123',
  'director@hostelms.com': 'director123',
  'warden@hostelms.com': 'warden123',
  'deputy@hostelms.com': 'deputy123',
  'assistant@hostelms.com': 'assistant123',
  'floor@hostelms.com': 'floor123'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('hostelms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = DUMMY_USERS.find(u => u.email === email);
    if (foundUser && DUMMY_PASSWORDS[email] === password) {
      setUser(foundUser);
      localStorage.setItem('hostelms_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostelms_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
