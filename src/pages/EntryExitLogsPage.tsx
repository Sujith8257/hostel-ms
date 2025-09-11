import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogIn,
  LogOut,
  Eye,
  Users,
  Timer,
  BarChart3,
  Shield,
  Settings,
  LogOut as LogOutIcon,
  BarChart3 as BarChart3Icon,
  HelpCircle,
  Building2,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface EntryLog {
  id: string;
  student_id: string | null;
  register_number: string;
  student_name: string;
  entry_type: 'entry' | 'exit' | 'failed_attempt';
  timestamp: string;
  confidence_score: number | null;
  image_url: string | null;
  location: string;
  created_at: string;
}

interface EntryLogStats {
  totalToday: number;
  successfulToday: number;
  failedToday: number;
  uniqueStudentsToday: number;
  averageConfidence: number;
  lastEntry: string | null;
}

const FACE_RECOGNITION_API_BASE = 'http://localhost:8005';

export function EntryExitLogsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<EntryLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<EntryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [stats, setStats] = useState<EntryLogStats>({
    totalToday: 0,
    successfulToday: 0,
    failedToday: 0,
    uniqueStudentsToday: 0,
    averageConfidence: 0,
    lastEntry: null,
  });

  const calculateStats = useCallback(() => {
    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
    
    const totalToday = todayLogs.length;
    const successfulToday = todayLogs.filter(log => log.entry_type !== 'failed_attempt').length;
    const failedToday = todayLogs.filter(log => log.entry_type === 'failed_attempt').length;
    
    const uniqueStudents = new Set(todayLogs.map(log => log.register_number));
    const uniqueStudentsToday = uniqueStudents.size;
    
    const confidenceScores = todayLogs
      .filter(log => log.confidence_score !== null)
      .map(log => log.confidence_score!);
    
    const averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
      : 0;
    
    const lastEntry = logs.length > 0 ? logs[0].timestamp : null;

    setStats({
      totalToday,
      successfulToday,
      failedToday,
      uniqueStudentsToday,
      averageConfidence,
      lastEntry,
    });
  }, [logs]);

  const filterLogs = useCallback(() => {
    let filtered = logs;

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(log => new Date(log.timestamp) >= today);
          break;
        case 'yesterday':
          filtered = filtered.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= yesterday && logDate < today;
          });
          break;
        case 'this_week':
          filtered = filtered.filter(log => new Date(log.timestamp) >= thisWeek);
          break;
      }
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.student_name.toLowerCase().includes(term) ||
        log.register_number.toLowerCase().includes(term) ||
        log.location.toLowerCase().includes(term)
      );
    }

    // Apply entry type filter
    if (entryTypeFilter !== 'all') {
      filtered = filtered.filter(log => log.entry_type === entryTypeFilter);
    }

    // Apply location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(log => log.location === locationFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, entryTypeFilter, locationFilter, dateFilter]);

  // Load data on component mount
  useEffect(() => {
    loadLogs();
  }, []);

  // Filter logs when filters change
  useEffect(() => {
    filterLogs();
  }, [filterLogs]);

  // Calculate stats when logs change
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch logs from face recognition API
      const response = await fetch(`${FACE_RECOGNITION_API_BASE}/api/recent_entries?limit=1000`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.entries) {
        // Sort logs by timestamp (newest first)
        const sortedLogs = data.entries.sort((a: EntryLog, b: EntryLog) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(sortedLogs);
        console.log(`Loaded ${sortedLogs.length} entry logs`);
      } else {
        throw new Error(data.error || 'Failed to load entry logs');
      }
    } catch (err) {
      console.error('Error loading entry logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entry logs');
      toast.error('Failed to load entry logs');
      // Set empty logs as fallback
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEntryTypeBadge = (entryType: string) => {
    switch (entryType) {
      case 'entry':
        return (
          <Badge className="bg-green-100 text-green-800">
            <LogIn className="h-3 w-3 mr-1" />
            Entry
          </Badge>
        );
      case 'exit':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <LogOut className="h-3 w-3 mr-1" />
            Exit
          </Badge>
        );
      case 'failed_attempt':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {entryType}
          </Badge>
        );
    }
  };

  const getConfidenceBadge = (confidence: number | null) => {
    if (confidence === null) return null;
    
    const percentage = Math.round(confidence * 100);
    let className = "";
    
    if (percentage >= 80) {
      className = "bg-green-100 text-green-800";
    } else if (percentage >= 60) {
      className = "bg-yellow-100 text-yellow-800";
    } else {
      className = "bg-red-100 text-red-800";
    }

    return (
      <Badge className={className}>
        {percentage}%
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUniqueLocations = () => {
    const locations = new Set(logs.map(log => log.location));
    return Array.from(locations);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Navigation items (same as AdminDashboard)
  const navigationItems = [
    { name: 'Dashboard', icon: Activity, href: '/admin', current: false },
    { name: 'Students', icon: Users, href: '/students', current: false },
    { name: 'Entry/Exit Logs', icon: Clock, href: '/entries', current: true },
    { name: 'Security Alerts', icon: AlertTriangle, href: '/alerts', badge: 2, current: false },
    { name: 'Room Management', icon: Building2, href: '/rooms', current: false },
    { name: 'Security Monitor', icon: Eye, href: '/security', current: false },
    { name: 'Visitor Management', icon: UserPlus, href: '/visitors', current: false },
    { name: 'Reports', icon: BarChart3Icon, href: '/reports', current: false },
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
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading entry/exit logs...</p>
          </div>
        </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Error loading entry logs</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadLogs} className="mr-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.open(`${FACE_RECOGNITION_API_BASE}`, '_blank')}>
              <Eye className="h-4 w-4 mr-2" />
              Open Face Recognition Dashboard
            </Button>
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
                <LogOutIcon className="h-4 w-4 mr-2" />
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
                <h1 className="text-2xl font-bold">Entry/Exit Logs</h1>
                <p className="text-muted-foreground">Real-time face recognition entry and exit logs from the hostel management system</p>
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
            <div className="flex items-center justify-end gap-2 mb-6">
              <Button variant="outline" size="sm" onClick={loadLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`${FACE_RECOGNITION_API_BASE}`, '_blank')}>
                <Eye className="h-4 w-4 mr-2" />
                Face Recognition Dashboard
              </Button>
            </div>

      <div className="space-y-6">

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Entries</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalToday}</div>
              <p className="text-xs text-muted-foreground">
                Total recognition attempts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successfulToday}</div>
              <p className="text-xs text-muted-foreground">
                Successful entries/exits
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedToday}</div>
              <p className="text-xs text-muted-foreground">
                Failed attempts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.uniqueStudentsToday}</div>
              <p className="text-xs text-muted-foreground">
                Students accessed today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageConfidence > 0 ? `${Math.round(stats.averageConfidence * 100)}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Recognition accuracy
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
              <Timer className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.lastEntry ? formatTimestamp(stats.lastEntry) : 'No data'}
              </div>
              <p className="text-xs text-muted-foreground">
                Most recent entry
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name, register number, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={entryTypeFilter} onValueChange={setEntryTypeFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Entry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="exit">Exit</SelectItem>
                    <SelectItem value="failed_attempt">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {getUniqueLocations().map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Entry/Exit Logs ({filteredLogs.length})</CardTitle>
              <CardDescription>
                {filteredLogs.length === logs.length 
                  ? 'All available logs from the face recognition system'
                  : `Filtered from ${logs.length} total logs`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Entry Type</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Time Ago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No entry logs found</p>
                            {searchTerm || entryTypeFilter !== 'all' || locationFilter !== 'all' || dateFilter !== 'all' ? (
                              <p className="text-sm">Try adjusting your search or filters</p>
                            ) : (
                              <p className="text-sm">No face recognition activities recorded yet</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {new Date(log.timestamp).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{log.student_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {log.register_number}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getEntryTypeBadge(log.entry_type)}
                          </TableCell>
                          <TableCell>
                            {getConfidenceBadge(log.confidence_score)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {log.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatTimestamp(log.timestamp)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Face recognition system status and connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Face Recognition API</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">Last Sync</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Entry/exit logs are automatically generated when students 
                  use face recognition for authentication at hostel entry points. The system 
                  records successful authentications as well as failed attempts for security monitoring.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}