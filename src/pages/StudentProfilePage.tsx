import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Calendar, 
  Bell, 
  LogOut, 
  Home,
  Building2,
  HelpCircle,
  CreditCard,
  FileText,
  GraduationCap,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  register_number: string;
  room_number: string | null;
  hostel_status: 'resident' | 'day_scholar';
  course: string;
  year: number;
  profile_image_url: string | null;
  is_active: boolean;
}

export function StudentProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Mock profile data - replace with actual API call
  useEffect(() => {
    const mockProfile: StudentProfile = {
      id: '1',
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@university.edu',
      phone: '+1234567890',
      register_number: 'REG001',
      room_number: 'A-101',
      hostel_status: 'resident',
      course: 'Computer Science',
      year: 3,
      profile_image_url: null,
      is_active: true
    };
    setProfile(mockProfile);
  }, [user]);

  const handleLogout = async () => {
    console.log('[StudentProfilePage] Logout button clicked');
    try {
      await logout();
      // Navigation is now handled by the AuthContext logout function
    } catch (error) {
      console.error('[StudentProfilePage] Logout failed:', error);
    }
  };

  const handleSave = () => {
    // Implement save logic here
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Navigation items for students
  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/student', current: false },
    { name: 'My Profile', icon: User, href: '/student-profile', current: true },
    { name: 'Room Details', icon: Building2, href: '/student-room', current: false },
    { name: 'Payments', icon: CreditCard, href: '/student-payments', current: false },
    { name: 'Attendance', icon: Calendar, href: '/student-attendance', current: false },
    { name: 'Notifications', icon: Bell, href: '/student-notifications', badge: 3, current: false },
    { name: 'Documents', icon: FileText, href: '/student-documents', current: false },
    { name: 'Help & Support', icon: HelpCircle, href: '/student-help', current: false },
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Portal</h1>
                <p className="text-sm text-muted-foreground">Hostel Management System</p>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Student Menu
              </h3>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Mess Menu
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Document
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name || 'Student'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email?.split('@')[0] || 'SU'}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Portal</h1>
                <p className="text-sm text-muted-foreground">Hostel Management System</p>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Student Menu
              </h3>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Mess Menu
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Document
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{profile?.name || 'Student'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email?.split('@')[0] || 'SU'}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and preferences</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Student</Badge>
                  <span className="text-sm text-muted-foreground">{profile?.email?.split('@')[0] || 'SU'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      {profile.profile_image_url ? (
                        <img
                          src={profile.profile_image_url}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        Change Photo
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details and contact information
                        </CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button onClick={handleSave} size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm font-medium">{profile.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm font-medium">{profile.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm font-medium">{profile.phone}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register_number">Register Number</Label>
                        <p className="text-sm font-medium">{profile.register_number}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Academic Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="course">Course</Label>
                          {isEditing ? (
                            <Input
                              id="course"
                              value={profile.course}
                              onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                            />
                          ) : (
                            <p className="text-sm font-medium">{profile.course}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Year</Label>
                          {isEditing ? (
                            <Input
                              id="year"
                              type="number"
                              value={profile.year}
                              onChange={(e) => setProfile({ ...profile, year: parseInt(e.target.value) })}
                            />
                          ) : (
                            <p className="text-sm font-medium">{profile.year}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Hostel Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="room_number">Room Number</Label>
                          <p className="text-sm font-medium">{profile.room_number || 'Not assigned'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hostel_status">Hostel Status</Label>
                          <Badge variant={profile.hostel_status === 'resident' ? 'default' : 'secondary'}>
                            {profile.hostel_status === 'resident' ? 'Resident' : 'Day Scholar'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
