import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Building2,
  Shield,
  Settings,
  LogOut,
  BarChart3,
  HelpCircle,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  purpose: 'meeting' | 'delivery' | 'maintenance' | 'other';
  host_student_id: string;
  host_student_name: string;
  check_in_time: string;
  check_out_time: string | null;
  status: 'checked_in' | 'checked_out' | 'expired';
  location: string;
  notes: string;
  created_at: string;
}

interface VisitorStats {
  totalVisitors: number;
  checkedIn: number;
  checkedOut: number;
  todayVisitors: number;
  averageVisitDuration: number;
  lastVisitor: string | null;
}

export function VisitorManagementPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [isAddVisitorOpen, setIsAddVisitorOpen] = useState(false);
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    checkedIn: 0,
    checkedOut: 0,
    todayVisitors: 0,
    averageVisitDuration: 0,
    lastVisitor: null,
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items (same as AdminDashboard)
  const navigationItems = [
    { name: 'Dashboard', icon: Activity, href: '/admin', current: false },
    { name: 'Students', icon: Users, href: '/students', current: false },
    { name: 'Entry/Exit Logs', icon: Clock, href: '/entries', current: false },
    { name: 'Security Alerts', icon: AlertTriangle, href: '/alerts', badge: 2, current: false },
    { name: 'Room Management', icon: Building2, href: '/rooms', current: false },
    { name: 'Security Monitor', icon: Eye, href: '/security', current: false },
    { name: 'Visitor Management', icon: UserPlus, href: '/visitors', current: true },
    { name: 'Reports', icon: BarChart3, href: '/reports', current: false },
  ];

  const adminItems = [
    { name: 'Staff Management', icon: Users, href: '/admin/staff' },
    { name: 'System Settings', icon: Settings, href: '/admin/settings' },
    { name: 'Access Control', icon: Shield, href: '/admin/access-control' },
    { name: 'Notifications', icon: AlertTriangle, href: '/admin/notifications' },
  ];

  const helpItems = [
    { name: 'Help & Support', icon: HelpCircle, href: '/help' },
  ];

  // Load mock data
  useEffect(() => {
    const mockVisitors: Visitor[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1234567890',
        purpose: 'meeting',
        host_student_id: 'STU001',
        host_student_name: 'Alice Johnson',
        check_in_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        check_out_time: null,
        status: 'checked_in',
        location: 'Main Entrance',
        notes: 'Meeting with student for project discussion',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '+1234567891',
        purpose: 'delivery',
        host_student_id: 'STU002',
        host_student_name: 'Bob Brown',
        check_in_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        check_out_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'checked_out',
        location: 'Main Entrance',
        notes: 'Package delivery',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike.davis@email.com',
        phone: '+1234567892',
        purpose: 'maintenance',
        host_student_id: 'STU003',
        host_student_name: 'Carol White',
        check_in_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        check_out_time: null,
        status: 'checked_in',
        location: 'Service Entrance',
        notes: 'HVAC maintenance work',
        created_at: new Date().toISOString()
      }
    ];

    setVisitors(mockVisitors);
    setFilteredVisitors(mockVisitors);
    setIsLoading(false);

    // Calculate stats
    const today = new Date().toDateString();
    const todayVisitors = mockVisitors.filter(v => 
      new Date(v.check_in_time).toDateString() === today
    ).length;

    const checkedIn = mockVisitors.filter(v => v.status === 'checked_in').length;
    const checkedOut = mockVisitors.filter(v => v.status === 'checked_out').length;

    setStats({
      totalVisitors: mockVisitors.length,
      checkedIn,
      checkedOut,
      todayVisitors,
      averageVisitDuration: 2.5, // hours
      lastVisitor: mockVisitors[0]?.name || null,
    });
  }, []);

  // Filter visitors
  useEffect(() => {
    let filtered = visitors;

    if (searchTerm) {
      filtered = filtered.filter(visitor =>
        visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.host_student_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === statusFilter);
    }

    if (purposeFilter !== 'all') {
      filtered = filtered.filter(visitor => visitor.purpose === purposeFilter);
    }

    setFilteredVisitors(filtered);
  }, [visitors, searchTerm, statusFilter, purposeFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked_in':
        return <Badge className="bg-green-100 text-green-800">Checked In</Badge>;
      case 'checked_out':
        return <Badge className="bg-blue-100 text-blue-800">Checked Out</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPurposeBadge = (purpose: string) => {
    switch (purpose) {
      case 'meeting':
        return <Badge className="bg-blue-100 text-blue-800">Meeting</Badge>;
      case 'delivery':
        return <Badge className="bg-green-100 text-green-800">Delivery</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-800">Maintenance</Badge>;
      case 'other':
        return <Badge className="bg-gray-100 text-gray-800">Other</Badge>;
      default:
        return <Badge variant="outline">{purpose}</Badge>;
    }
  };

  const formatDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return 'Still here';
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    } else {
      return `${diffMins}m`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleCheckOut = (visitorId: string) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === visitorId 
        ? { 
            ...visitor, 
            status: 'checked_out' as const,
            check_out_time: new Date().toISOString()
          }
        : visitor
    ));
    toast.success('Visitor checked out successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-card border-r border-border">
            <div className="p-6">
              {/* Logo */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-primary rounded-lg">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">HostelMS</h1>
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
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Administration */}
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Administration
                </h3>
                <nav className="space-y-2">
                  {adminItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Help & Support */}
              <div className="mb-8">
                <nav className="space-y-2">
                  {helpItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* User Info */}
              <div className="mt-auto pt-6 border-t border-border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Admin User 41542</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
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
                  <h1 className="text-2xl font-bold">Visitor Management</h1>
                  <p className="text-muted-foreground">Register and track visitor access to hostel premises</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-muted rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary">Administrator</Badge>
                    <span className="text-sm text-muted-foreground">AU4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Content */}
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading visitors...</p>
                </div>
              </div>
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
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">HostelMS</h1>
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
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Administration */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Administration
              </h3>
              <nav className="space-y-2">
                {adminItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Help & Support */}
            <div className="mb-8">
              <nav className="space-y-2">
                {helpItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Admin User 41542</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
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
                <h1 className="text-2xl font-bold">Visitor Management</h1>
                <p className="text-muted-foreground">Register and track visitor access to hostel premises</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Administrator</Badge>
                  <span className="text-sm text-muted-foreground">AU4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Dialog open={isAddVisitorOpen} onOpenChange={setIsAddVisitorOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Visitor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Visitor</DialogTitle>
                      <DialogDescription>
                        Register a new visitor to the hostel premises.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input id="name" className="col-span-3" placeholder="Visitor name" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input id="email" type="email" className="col-span-3" placeholder="visitor@email.com" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                          Phone
                        </Label>
                        <Input id="phone" className="col-span-3" placeholder="+1234567890" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="purpose" className="text-right">
                          Purpose
                        </Label>
                        <Select>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Visitor</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVisitors}</div>
                  <p className="text-xs text-muted-foreground">
                    All time visitors
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Checked In</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently on premises
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
                  <XCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.checkedOut}</div>
                  <p className="text-xs text-muted-foreground">
                    Left premises
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.todayVisitors}</div>
                  <p className="text-xs text-muted-foreground">
                    Visited today
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.averageVisitDuration}h</div>
                  <p className="text-xs text-muted-foreground">
                    Average visit time
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Visitor</CardTitle>
                  <User className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">
                    {stats.lastVisitor ? stats.lastVisitor.split(' ')[0] : 'None'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Most recent visitor
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or host student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                      <SelectItem value="checked_out">Checked Out</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Purposes</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Visitors List */}
            <Card>
              <CardHeader>
                <CardTitle>Visitors ({filteredVisitors.length})</CardTitle>
                <CardDescription>
                  {filteredVisitors.length === visitors.length 
                    ? 'All registered visitors'
                    : `Filtered from ${visitors.length} total visitors`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVisitors.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No visitors found</p>
                      {searchTerm || statusFilter !== 'all' || purposeFilter !== 'all' ? (
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No visitors have been registered yet</p>
                      )}
                    </div>
                  ) : (
                    filteredVisitors.map((visitor) => (
                      <div key={visitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-muted rounded-lg">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{visitor.name}</h4>
                              {getStatusBadge(visitor.status)}
                              {getPurposeBadge(visitor.purpose)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{visitor.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{visitor.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>Host: {visitor.host_student_name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{visitor.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>In: {formatTimestamp(visitor.check_in_time)}</span>
                              </div>
                              {visitor.check_out_time && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Out: {formatTimestamp(visitor.check_out_time)}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Duration: {formatDuration(visitor.check_in_time, visitor.check_out_time)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {visitor.status === 'checked_in' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCheckOut(visitor.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Check Out
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
