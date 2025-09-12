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
  CreditCard,
  FileText,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'late' | 'partial';
  remarks: string | null;
}

export function StudentAttendancePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Mock attendance data - replace with actual API call
  useEffect(() => {
    console.log('[StudentAttendancePage] Component mounted, setting up mock data');
    const mockAttendance: AttendanceRecord[] = [
      {
        id: '1',
        date: '2024-01-15',
        check_in: '08:30',
        check_out: '22:45',
        status: 'present',
        remarks: null
      },
      {
        id: '2',
        date: '2024-01-14',
        check_in: '09:15',
        check_out: '23:00',
        status: 'late',
        remarks: 'Late arrival due to traffic'
      },
      {
        id: '3',
        date: '2024-01-13',
        check_in: '08:00',
        check_out: null,
        status: 'partial',
        remarks: 'Left early for family emergency'
      },
      {
        id: '4',
        date: '2024-01-12',
        check_in: null,
        check_out: null,
        status: 'absent',
        remarks: 'Sick leave'
      },
      {
        id: '5',
        date: '2024-01-11',
        check_in: '08:45',
        check_out: '22:30',
        status: 'present',
        remarks: null
      }
    ];

    console.log('[StudentAttendancePage] Setting attendance:', mockAttendance);
    setAttendance(mockAttendance);
  }, []);

  const handleLogout = async () => {
    console.log('[StudentAttendancePage] Logout button clicked');
    try {
      await logout();
      console.log('[StudentAttendancePage] Logout successful, navigating to landing page');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[StudentAttendancePage] Logout failed:', error);
      navigate('/', { replace: true });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'present': { variant: 'default' as const, icon: CheckCircle, text: 'Present', color: 'text-green-600' },
      'absent': { variant: 'destructive' as const, icon: XCircle, text: 'Absent', color: 'text-red-600' },
      'late': { variant: 'secondary' as const, icon: Clock, text: 'Late', color: 'text-yellow-600' },
      'partial': { variant: 'outline' as const, icon: Clock, text: 'Partial', color: 'text-orange-600' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.present;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const partial = attendance.filter(a => a.status === 'partial').length;
    const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, partial, attendancePercentage };
  };

  // Navigation items for students
  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/student', current: false },
    { name: 'My Profile', icon: User, href: '/student-profile', current: false },
    { name: 'Room Details', icon: Building2, href: '/student-room', current: false },
    { name: 'Payments', icon: CreditCard, href: '/student-payments', current: false },
    { name: 'Attendance', icon: Calendar, href: '/student-attendance', current: true },
  ];

  // Quick actions
  const quickActions = [
    { name: 'Mess Menu', icon: FileText, href: '/mess-menu' },
    { name: 'Complaints', icon: Bell, href: '/complaints' },
    { name: 'Help & Support', icon: HelpCircle, href: '/help' },
  ];

  const stats = getAttendanceStats();

  console.log('[StudentAttendancePage] Rendering, attendance:', attendance);

  if (!attendance.length) {
    console.log('[StudentAttendancePage] No attendance, showing loading state');
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
                  Main Navigation
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
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      to={action.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <action.icon className="h-4 w-4" />
                      <span>{action.name}</span>
                    </Link>
                  ))}
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
              <p className="ml-2">Loading attendance...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('[StudentAttendancePage] Rendering main content with attendance');

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
                Main Navigation
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
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.name}</span>
                  </Link>
                ))}
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
          {/* Header */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Attendance</h1>
                <p className="text-muted-foreground">Track your hostel attendance and check-in/out records</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Student</Badge>
                  <span className="text-sm text-muted-foreground">{user?.email?.split('@')[0] || 'SU'}</span>
                </div>
                <Button>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Check In/Out
                </Button>
              </div>
            </div>
          </div>

          {/* Attendance Content */}
          <div className="p-6">
            {/* Attendance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Present</p>
                      <p className="text-2xl font-bold">{stats.present}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Absent</p>
                      <p className="text-2xl font-bold">{stats.absent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Late</p>
                      <p className="text-2xl font-bold">{stats.late}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Attendance %</p>
                      <p className="text-2xl font-bold">{stats.attendancePercentage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Records */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  Your recent attendance history and check-in/out times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendance.map((record) => {
                    const statusInfo = getStatusBadge(record.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-muted rounded-lg">
                            <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{formatDate(record.date)}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Check In: {formatTime(record.check_in)}</span>
                              <span>Check Out: {formatTime(record.check_out)}</span>
                              {record.remarks && (
                                <span>Remarks: {record.remarks}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.text}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
