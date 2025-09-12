import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, User, Shield, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { User as UserType } from '@/types';

// Mock users for development when Supabase is unavailable
const MOCK_USERS: UserType[] = [
  {
    id: 'mock-admin-1',
    name: 'System Administrator',
    email: 'admin@hostelms.com',
    role: 'admin',
    organization: 'HostelMS System',
    createdAt: new Date()
  },
  {
    id: 'mock-warden-1',
    name: 'Hostel Warden',
    email: 'warden@hostelms.com',
    role: 'warden',
    organization: 'University Hostel',
    createdAt: new Date()
  },
  {
    id: 'mock-student-1',
    name: 'Test Student',
    email: 'student@hostelms.com',
    role: 'student',
    organization: 'University',
    createdAt: new Date()
  }
];

export function DevelopmentAuthFallback() {
  const { user } = useAuth();
  const [mockUser, setMockUser] = useState<UserType | null>(null);

  const selectMockUser = (selectedUser: UserType) => {
    setMockUser(selectedUser);
    // You could also store this in localStorage for persistence
    localStorage.setItem('mock_user', JSON.stringify(selectedUser));
  };

  const clearMockAuth = () => {
    setMockUser(null);
    localStorage.removeItem('mock_user');
  };

  // If real auth is working, don't show this fallback
  if (user) {
    return null;
  }

  const getUserIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'warden':
        return <User className="h-4 w-4" />;
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

    const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'warden':
        return 'default';
      case 'student':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Development Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Supabase authentication is not available. Use these mock users for development testing.
          </AlertDescription>
        </Alert>

        {mockUser ? (
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{mockUser.name}</span>
                <Badge variant={getRoleColor(mockUser.role)}>
                  {getUserIcon(mockUser.role)}
                  <span className="ml-1">{mockUser.role}</span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{mockUser.email}</p>
            </div>
            <Button onClick={clearMockAuth} variant="outline" className="w-full">
              Clear Mock User
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select a mock user to test different role permissions:
            </p>
            
            {MOCK_USERS.map((user) => (
              <Button
                key={user.id}
                onClick={() => selectMockUser(user)}
                variant="outline"
                className="w-full justify-between h-auto p-3"
              >
                <div className="flex items-center gap-3">
                  {getUserIcon(user.role)}
                  <div className="text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <Badge variant={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
              </Button>
            ))}
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            💡 To fix Supabase authentication, check the CORS configuration in your Supabase dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}