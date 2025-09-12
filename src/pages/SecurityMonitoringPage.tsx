import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  Camera, 
  Users, 
  Clock, 
  MapPin, 
  Activity,
  Settings,
  User,
  LogOut,
  BarChart3,
  HelpCircle,
  Building2,
  UserPlus,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  id: string;
  type: 'unauthorized_access' | 'suspicious_activity' | 'system_alert' | 'camera_offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  timestamp: string;
  description: string;
  status: 'active' | 'resolved' | 'investigating';
  camera_id?: string;
  confidence_score?: number;
}

interface SecurityStats {
  activeAlerts: number;
  camerasOnline: number;
  camerasOffline: number;
  unauthorizedAttempts: number;
  suspiciousActivities: number;
  lastIncident: string | null;
}

export function SecurityMonitoringPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    activeAlerts: 0,
    camerasOnline: 0,
    camerasOffline: 0,
    unauthorizedAttempts: 0,
    suspiciousActivities: 0,
    lastIncident: null,
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
    { name: 'Security Monitor', icon: Eye, href: '/security', current: true },
    { name: 'Visitor Management', icon: UserPlus, href: '/visitors', current: false },
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
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'unauthorized_access',
        severity: 'high',
        location: 'Main Entrance - Camera 01',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        description: 'Unknown person attempted to access restricted area',
        status: 'investigating',
        camera_id: 'CAM-01',
        confidence_score: 0.85
      },
      {
        id: '2',
        type: 'suspicious_activity',
        severity: 'medium',
        location: 'Hallway B - Camera 03',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        description: 'Person loitering in restricted hallway',
        status: 'active',
        camera_id: 'CAM-03',
        confidence_score: 0.72
      },
      {
        id: '3',
        type: 'camera_offline',
        severity: 'medium',
        location: 'Parking Area - Camera 07',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        description: 'Camera connection lost',
        status: 'active',
        camera_id: 'CAM-07'
      },
      {
        id: '4',
        type: 'system_alert',
        severity: 'low',
        location: 'System',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        description: 'Motion detection sensitivity adjusted',
        status: 'resolved'
      }
    ];

    setEvents(mockEvents);
    setStats({
      activeAlerts: 3,
      camerasOnline: 8,
      camerasOffline: 1,
      unauthorizedAttempts: 2,
      suspiciousActivities: 1,
      lastIncident: mockEvents[0].timestamp,
    });
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-100 text-red-800">Active</Badge>;
      case 'investigating':
        return <Badge className="bg-yellow-100 text-yellow-800">Investigating</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'unauthorized_access':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'suspicious_activity':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'camera_offline':
        return <Camera className="h-4 w-4 text-gray-500" />;
      case 'system_alert':
        return <Settings className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
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
                  <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
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
                <h1 className="text-2xl font-bold">Security Monitoring</h1>
                <p className="text-muted-foreground">Real-time security monitoring and unauthorized access detection</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Administrator</Badge>
                  <span className="text-sm text-muted-foreground">{user?.email?.split('@')[0] || 'AU4'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            {/* Monitoring Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant={isMonitoring ? "destructive" : "default"}
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  className="flex items-center space-x-2"
                >
                  {isMonitoring ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause Monitoring
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Monitoring
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
                </span>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.activeAlerts}</div>
                  <p className="text-xs text-muted-foreground">
                    Security incidents
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cameras Online</CardTitle>
                  <Camera className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.camerasOnline}</div>
                  <p className="text-xs text-muted-foreground">
                    Active cameras
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cameras Offline</CardTitle>
                  <Camera className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.camerasOffline}</div>
                  <p className="text-xs text-muted-foreground">
                    Disconnected
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unauthorized Attempts</CardTitle>
                  <Shield className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.unauthorizedAttempts}</div>
                  <p className="text-xs text-muted-foreground">
                    Today's attempts
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
                  <Eye className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.suspiciousActivities}</div>
                  <p className="text-xs text-muted-foreground">
                    Detected today
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Incident</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.lastIncident ? formatTimestamp(stats.lastIncident) : 'None'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Most recent alert
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>
                  Real-time security events and alerts from monitoring systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No security events detected</p>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getEventIcon(event.type)}
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{event.description}</h4>
                              {getSeverityBadge(event.severity)}
                              {getStatusBadge(event.status)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(event.timestamp)}</span>
                              </div>
                              {event.camera_id && (
                                <div className="flex items-center space-x-1">
                                  <Camera className="h-3 w-3" />
                                  <span>{event.camera_id}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {event.confidence_score && (
                            <Badge variant="outline">
                              {Math.round(event.confidence_score * 100)}% confidence
                            </Badge>
                          )}
                          <Button variant="outline" size="sm">
                            View Details
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
