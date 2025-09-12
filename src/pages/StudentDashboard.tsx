import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Download,
  TrendingUp,
  DollarSign,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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

interface RoomInfo {
  room_number: string;
  building: string;
  floor: number;
  capacity: number;
  occupied: number;
  amenities: string[];
  monthly_rent: number;
}

interface PaymentInfo {
  id: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  payment_date?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  expires_at?: string;
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    attendance_percentage: 0,
    monthly_expenses: 0,
    upcoming_events: 0,
    unread_notifications: 0,
    room_occupancy: 0,
    academic_progress: 0,
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
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
    { name: 'Help & Support', icon: HelpCircle, href: '/help', current: false },
  ];

  // Load mock data
  useEffect(() => {
    const mockProfile: StudentProfile = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@university.edu',
      phone: '+1234567890',
      register_number: 'REG001',
      room_number: 'A-101',
      hostel_status: 'resident',
      course: 'Computer Science',
      year: 3,
      profile_image_url: null,
      is_active: true,
    };

    const mockRoomInfo: RoomInfo = {
      room_number: 'A-101',
      building: 'Block A',
      floor: 1,
      capacity: 2,
      occupied: 2,
      amenities: ['WiFi', 'AC', 'Study Table', 'Wardrobe'],
      monthly_rent: 5000,
    };

    const mockPayments: PaymentInfo[] = [
      {
        id: '1',
        amount: 5000,
        due_date: '2024-01-15',
        status: 'paid',
        description: 'Monthly Hostel Fee - January 2024',
        payment_date: '2024-01-10',
      },
      {
        id: '2',
        amount: 5000,
        due_date: '2024-02-15',
        status: 'pending',
        description: 'Monthly Hostel Fee - February 2024',
      },
      {
        id: '3',
        amount: 2000,
        due_date: '2024-01-20',
        status: 'overdue',
        description: 'Mess Fee - January 2024',
      },
    ];

    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'Hostel Maintenance Notice',
        content: 'Scheduled maintenance for water supply system on January 25th, 2024. Water will be unavailable from 9 AM to 3 PM.',
        priority: 'high',
        created_at: '2024-01-20T10:00:00Z',
        expires_at: '2024-01-25T23:59:59Z',
      },
      {
        id: '2',
        title: 'Mess Menu Update',
        content: 'New vegetarian and non-vegetarian options added to the mess menu. Check the updated menu at the dining hall.',
        priority: 'medium',
        created_at: '2024-01-19T14:30:00Z',
      },
      {
        id: '3',
        title: 'Library Hours Extension',
        content: 'Library will remain open until 11 PM during exam period (January 22 - February 5).',
        priority: 'low',
        created_at: '2024-01-18T09:15:00Z',
        expires_at: '2024-02-05T23:59:59Z',
      },
    ];

    setProfile(mockProfile);
    setRoomInfo(mockRoomInfo);
    setPayments(mockPayments);
    setAnnouncements(mockAnnouncements);

    setStats({
      attendance_percentage: 85,
      monthly_expenses: 7000,
      upcoming_events: 3,
      unread_notifications: 3,
      room_occupancy: 100,
      academic_progress: 78,
    });
  }, []);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
                <h1 className="text-2xl font-bold">Student Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {profile?.name || 'Student'}! Here's your overview.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Student</Badge>
                  <span className="text-sm text-muted-foreground">{profile?.register_number || 'REG001'}</span>
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
                      <h2 className="text-2xl font-bold mb-2">Welcome back, {profile?.name}!</h2>
                      <p className="text-muted-foreground mb-4">
                        {profile?.course} - Year {profile?.year} | Room {profile?.room_number || 'Not Assigned'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{profile?.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{profile?.phone}</span>
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
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                  {roomInfo ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Room {roomInfo.room_number}</h4>
                          <p className="text-sm text-muted-foreground">{roomInfo.building} - Floor {roomInfo.floor}</p>
                        </div>
                        <Badge variant="outline">{roomInfo.occupied}/{roomInfo.capacity} Occupied</Badge>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Occupancy</span>
                          <span>{Math.round((roomInfo.occupied / roomInfo.capacity) * 100)}%</span>
                        </div>
                        <Progress value={(roomInfo.occupied / roomInfo.capacity) * 100} className="h-2" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-1">
                          {roomInfo.amenities.map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Monthly Rent: <span className="font-medium">{formatCurrency(roomInfo.monthly_rent)}</span>
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
                    {payments.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{payment.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDate(payment.due_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          {getPaymentStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      View All Payments
                    </Button>
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
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{announcement.title}</h4>
                        {getPriorityBadge(announcement.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Posted: {formatDate(announcement.created_at)}</span>
                        {announcement.expires_at && (
                          <span>Expires: {formatDate(announcement.expires_at)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Announcements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
