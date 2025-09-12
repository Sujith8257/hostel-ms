import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Bell, 
  LogOut, 
  Home,
  Building2,
  HelpCircle,
  Phone,
  Mail,
  CreditCard,
  FileText,
  TrendingUp,
  BookOpen,
  GraduationCap,
  IndianRupee
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface StudentProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  register_number: string;
  room_number: string | null;
  hostel_status: 'resident' | 'day_scholar' | 'former_resident';
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  building_id: string | null;
}


interface StudentStats {
  attendance_percentage: number;
  monthly_expenses: number;
  upcoming_events: number;
  unread_notifications: number;
  room_occupancy: number;
  academic_progress: number;
}

export function StudentDashboard() {
  const { profile, logout } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats] = useState<StudentStats>({
    attendance_percentage: 85,
    monthly_expenses: 7000,
    upcoming_events: 3,
    unread_notifications: 3,
    room_occupancy: 100,
    academic_progress: 78,
  });

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is now handled by the AuthContext logout function
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items for students
  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/student-dashboard', current: true },
    { name: 'My Profile', icon: User, href: '/student-profile', current: false },
    { name: 'Room Details', icon: Building2, href: '/student-room', current: false },
    { name: 'Payments', icon: CreditCard, href: '/student-payments', current: false },
    { name: 'Attendance', icon: Calendar, href: '/student-attendance', current: false },
    { name: 'Notifications', icon: Bell, href: '/student-notifications', badge: 3, current: false },
    { name: 'Documents', icon: FileText, href: '/student-documents', current: false },
    { name: 'Help & Support', icon: HelpCircle, href: '/student-help', current: false },
  ];

  // Load real student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!profile?.email) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('[StudentDashboard] Fetching student data for email:', profile.email);
        
        // Fetch student data from the students table using email
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('email', profile.email)
          .single();

        if (studentError) {
          console.log('[StudentDashboard] No student record found, using profile data:', studentError);
          // If no student record found, create a basic student profile from the profile data
          const basicStudentProfile: StudentProfile = {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            phone: null,
            register_number: 'N/A',
            room_number: null,
            hostel_status: 'resident',
            profile_image_url: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            building_id: null,
          };
          setStudentProfile(basicStudentProfile);
          return;
        }

        if (studentData) {
          console.log('[StudentDashboard] Student data fetched:', studentData);
          setStudentProfile(studentData as StudentProfile);
        }
      } catch (error) {
        console.error('[StudentDashboard] Error in fetchStudentData:', error);
        // Create a basic student profile from the profile data as fallback
        const basicStudentProfile: StudentProfile = {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: null,
          register_number: 'N/A',
          room_number: null,
          hostel_status: 'resident',
          profile_image_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          building_id: null,
        };
        setStudentProfile(basicStudentProfile);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [profile?.email, profile?.full_name, profile?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Show loading only if we don't have profile data yet
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
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
                  <p className="text-sm font-medium">{studentProfile?.full_name || profile?.full_name || 'Student'}</p>
                  <p className="text-xs text-muted-foreground">{(studentProfile?.email || profile?.email)?.split('@')[0] || 'SU'}</p>
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
                <h1 className="text-2xl font-bold">Student Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {studentProfile?.full_name || profile?.full_name || 'Student'}! Here's your overview.</p>
                {isLoading && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Loading additional data...
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Student</Badge>
                  <span className="text-sm text-muted-foreground">{studentProfile?.register_number || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            {/* Welcome Section */}
            <div className="mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Welcome back, {studentProfile?.full_name || profile?.full_name}!</h2>
                      <p className="text-muted-foreground mb-4">
                        {studentProfile?.hostel_status || 'Student'} | Room {studentProfile?.room_number || 'Not Assigned'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{studentProfile?.email || profile?.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{studentProfile?.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{stats.attendance_percentage}%</div>
                      <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                  <IndianRupee
                   className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.monthly_expenses)}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcoming_events}</div>
                  <p className="text-xs text-muted-foreground">
                    Events this week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unread_notifications}</div>
                  <p className="text-xs text-muted-foreground">
                    Unread messages
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Academic Progress</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.academic_progress}%</div>
                  <p className="text-xs text-muted-foreground">
                    Current semester
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Room Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Information</CardTitle>
                  <CardDescription>Your current room details and occupancy</CardDescription>
                </CardHeader>
                <CardContent>
                  {studentProfile?.room_number ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Room {studentProfile.room_number}</h4>
                          <p className="text-sm text-muted-foreground">Hostel Accommodation</p>
                        </div>
                        <Badge variant="outline">{studentProfile.hostel_status}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="font-medium">{studentProfile.is_active ? 'Active' : 'Inactive'}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No room assigned</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Your payment history and upcoming dues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Payment information will be available soon</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        View All Payments
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Announcements */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Important updates and notices from hostel administration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Announcements will be available soon</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View All Announcements
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
