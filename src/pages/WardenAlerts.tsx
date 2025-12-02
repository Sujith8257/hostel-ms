import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  Shield,
  Users,
  Clock,
  Camera,
  MapPin,
  Search,
  Filter,
  Bell,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  User,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const FACE_RECOGNITION_API_BASE = 'http://localhost:8005';

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

interface Alert {
  id: string;
  type: 'unauthorized_entry' | 'rfid_failure' | 'suspicious_activity' | 'emergency' | 'system_error' | 'failed_attempt';
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  studentId?: string;
  studentName?: string;
  cameraId?: string;
  actionTaken?: string;
  confidenceScore?: number;
}

const mockAlerts: Alert[] = [
  {
    id: 'ALT001',
    type: 'unauthorized_entry',
    title: 'Unauthorized Entry Attempt',
    description: 'Unknown individual attempted to enter Block A using invalid RFID card',
    location: 'Block A - Main Entrance',
    timestamp: new Date('2024-01-15T14:30:00'),
    severity: 'high',
    status: 'active',
    cameraId: 'CAM_A_001'
  },
  {
    id: 'ALT002',
    type: 'rfid_failure',
    title: 'RFID System Malfunction',
    description: 'Multiple RFID card reading failures detected at Block B entrance',
    location: 'Block B - Main Entrance',
    timestamp: new Date('2024-01-15T13:45:00'),
    severity: 'medium',
    status: 'investigating',
    cameraId: 'CAM_B_001'
  },
  {
    id: 'ALT003',
    type: 'suspicious_activity',
    title: 'Loitering Detected',
    description: 'Individual has been present in parking area for over 2 hours without authorization',
    location: 'Parking Area - Zone C',
    timestamp: new Date('2024-01-15T12:15:00'),
    severity: 'medium',
    status: 'investigating',
    cameraId: 'CAM_P_003'
  },
  {
    id: 'ALT004',
    type: 'emergency',
    title: 'Emergency Button Activated',
    description: 'Emergency alert triggered from Floor 3 common area',
    location: 'Block A - Floor 3 Common Area',
    timestamp: new Date('2024-01-15T11:20:00'),
    severity: 'critical',
    status: 'resolved',
    actionTaken: 'Security responded in 2 minutes. False alarm - accidental activation.'
  },
  {
    id: 'ALT005',
    type: 'unauthorized_entry',
    title: 'Tailgating Incident',
    description: 'Student Raj Kumar (ID: ST2023001) allowed unauthorized person to follow through entrance',
    location: 'Block C - Side Entrance',
    timestamp: new Date('2024-01-15T10:30:00'),
    severity: 'high',
    status: 'resolved',
    studentId: 'ST2023001',
    studentName: 'Raj Kumar',
    cameraId: 'CAM_C_002',
    actionTaken: 'Student counseled. Visitor registered retroactively.'
  },
  {
    id: 'ALT006',
    type: 'system_error',
    title: 'Camera Offline',
    description: 'Security camera CAM_D_001 has been offline for 15 minutes',
    location: 'Block D - Rear Entrance',
    timestamp: new Date('2024-01-15T09:45:00'),
    severity: 'medium',
    status: 'investigating'
  }
];

export function AlertsPage() {
  const { user, logout } = useAuth();

  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Helper function to check if a log entry is a failed attempt
  const isFailedAttempt = useCallback((log: EntryLog): boolean => {
    if (log.entry_type === 'failed_attempt') {
      return true;
    }
    const nameLower = (log.student_name || '').toLowerCase().trim();
    if (nameLower.includes('face detected') && nameLower.includes('no match')) {
      return true;
    }
    if (nameLower.includes('no match found') || nameLower.includes('no matching student')) {
      return true;
    }
    const regLower = (log.register_number || '').toLowerCase().trim();
    if (regLower.includes('no match') || regLower.includes('failed') || 
        (regLower.includes('face') && regLower.includes('detected'))) {
      return true;
    }
    return false;
  }, []);

  // Fetch failed attempts from entry logs
  const loadFailedAttempts = useCallback(async () => {
    try {
      const response = await fetch(`${FACE_RECOGNITION_API_BASE}/api/recent_entries?limit=1000`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch entry logs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.entries) {
        // Filter for failed attempts
        const failedAttempts = data.entries.filter((log: EntryLog) => isFailedAttempt(log));
        
        // Convert failed attempts to alerts
        const failedAlerts: Alert[] = failedAttempts.map((log: EntryLog) => ({
          id: `FAILED_${log.id}`,
          type: 'failed_attempt',
          title: log.student_name === 'Face detected, no match found' 
            ? 'Face Recognition Failed - Unknown Person'
            : `Failed Entry Attempt - ${log.student_name || 'Unknown'}`,
          description: log.student_name === 'Face detected, no match found'
            ? 'Face was detected but no matching student found in database. Unauthorized access attempt.'
            : `Failed entry attempt by ${log.student_name || log.register_number}. Face recognition confidence: ${log.confidence_score ? (log.confidence_score * 100).toFixed(1) + '%' : 'N/A'}`,
          location: log.location || 'Unknown Location',
          timestamp: new Date(log.timestamp || log.created_at),
          severity: 'high',
          status: 'active',
          studentId: log.register_number !== 'UNKNOWN' ? log.register_number : undefined,
          studentName: log.student_name !== 'Face detected, no match found' ? log.student_name : undefined,
          confidenceScore: log.confidence_score || undefined
        }));

        // Merge with existing alerts (avoid duplicates)
        setAlerts(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newFailedAlerts = failedAlerts.filter(a => !existingIds.has(a.id));
          return [...prev, ...newFailedAlerts];
        });
      }
    } catch (error) {
      console.error('Error loading failed attempts:', error);
    }
  }, [isFailedAttempt]);

  // Load failed attempts on component mount
  useEffect(() => {
    loadFailedAttempts();
    // Refresh every 30 seconds
    const interval = setInterval(loadFailedAttempts, 30000);
    return () => clearInterval(interval);
  }, [loadFailedAttempts]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesType = filterType === 'all' || alert.type === filterType;
    
    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'unauthorized_entry': return AlertTriangle;
      case 'rfid_failure': return Shield;
      case 'suspicious_activity': return Eye;
      case 'emergency': return AlertCircle;
      case 'system_error': return XCircle;
      case 'failed_attempt': return XCircle;
      default: return Bell;
    }
  };

  const alertStats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    resolved: alerts.filter(a => a.status === 'resolved').length
  };

  const handleStatusUpdate = (alertId: string, newStatus: Alert['status']) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ));
  };

  const handleLogout = async () => {
    await logout();
    // Navigation is now handled by the AuthContext logout function
  };

  // Navigation items (same as AdminDashboard)
  const navigationItems = [
    { name: 'Dashboard', icon: Activity, href: '/warden', current: false },
    { name: 'Students', icon: Users, href: '/warden/students', current: false },
    { name: 'Entry/Exit Logs', icon: Clock, href: '/warden/entries', current: false },
    { name: 'Security Alerts', icon: AlertTriangle, href: '/warden/alerts', badge: 2, current: true },
  ];


  const helpItems = [
    { name: 'Help & Support', icon: HelpCircle, href: '/warden/help' },
  ];

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
                  <p className="text-sm font-medium">{user?.name || 'Warden User'}</p>
                  <p className="text-xs text-muted-foreground">Warden</p>
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
                <h1 className="text-2xl font-bold">Security Alerts</h1>
                <p className="text-muted-foreground">Monitor and manage security incidents and unauthorized access attempts</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Warden</Badge>
                  <span className="text-sm text-muted-foreground">{user?.email?.split('@')[0] || 'AU4'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            <div className="space-y-6">

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alertStats.total}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{alertStats.active}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{alertStats.critical}</div>
              <p className="text-xs text-muted-foreground">High priority</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{alertStats.resolved}</div>
              <p className="text-xs text-muted-foreground">Successfully handled</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label htmlFor="search-input" className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-input"
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="severity-select" className="text-sm font-medium">Severity</label>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger id="severity-select">
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="status-select" className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="status-select">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="type-select" className="text-sm font-medium">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="type-select">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="unauthorized_entry">Unauthorized Entry</SelectItem>
                    <SelectItem value="rfid_failure">RFID Failure</SelectItem>
                    <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="system_error">System Error</SelectItem>
                    <SelectItem value="failed_attempt">Failed Attempt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

              {/* Alerts List */}
              <div className="space-y-4">
                {filteredAlerts.map((alert) => {
                  const TypeIcon = getTypeIcon(alert.type);
                  
                  return (
                    <div key={alert.id}>
                      <Card className={`${alert.severity === 'critical' ? 'border-red-500' : ''}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                alert.severity === 'critical' ? 'bg-red-100' :
                                alert.severity === 'high' ? 'bg-orange-100' :
                                alert.severity === 'medium' ? 'bg-yellow-100' :
                                'bg-blue-100'
                              }`}>
                                <TypeIcon className={`h-5 w-5 ${
                                  alert.severity === 'critical' ? 'text-red-600' :
                                  alert.severity === 'high' ? 'text-orange-600' :
                                  alert.severity === 'medium' ? 'text-yellow-600' :
                                  'text-blue-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <CardTitle className="text-lg">{alert.title}</CardTitle>
                                  <Badge className={getSeverityColor(alert.severity)}>
                                    {alert.severity.toUpperCase()}
                                  </Badge>
                                  <Badge className={getStatusColor(alert.status)}>
                                    {alert.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                <CardDescription className="text-base mb-2">
                                  {alert.description}
                                </CardDescription>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{alert.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{alert.timestamp.toLocaleString()}</span>
                                  </div>
                                  {alert.cameraId && (
                                    <div className="flex items-center space-x-1">
                                      <Camera className="h-4 w-4" />
                                      <span>{alert.cameraId}</span>
                                    </div>
                                  )}
                                  {alert.studentName && (
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-4 w-4" />
                                      <span>{alert.studentName} ({alert.studentId})</span>
                                    </div>
                                  )}
                                </div>
                                {alert.actionTaken && (
                                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                      <strong>Action Taken:</strong> {alert.actionTaken}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              {alert.status === 'active' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(alert.id, 'investigating')}
                                  >
                                    Investigate
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(alert.id, 'resolved')}
                                  >
                                    Resolve
                                  </Button>
                                </>
                              )}
                              {alert.status === 'investigating' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(alert.id, 'resolved')}
                                >
                                  Resolve
                                </Button>
                              )}
                              {alert.cameraId && (
                                <Button size="sm" variant="outline">
                                  <Camera className="h-4 w-4 mr-1" />
                                  View Camera
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {filteredAlerts.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle className="text-xl mb-2">No alerts found</CardTitle>
                    <CardDescription>
                      No alerts match your current filter criteria. Try adjusting your search or filters.
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
