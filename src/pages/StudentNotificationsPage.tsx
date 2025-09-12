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
  AlertTriangle,
  Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'payment' | 'maintenance' | 'event' | 'urgent';
  priority: 'high' | 'medium' | 'low';
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  action_required: boolean;
}

export function StudentNotificationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock notifications data - replace with actual API call
  useEffect(() => {
    console.log('[StudentNotificationsPage] Component mounted, setting up mock data');
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Hostel Maintenance Notice',
        content: 'Scheduled maintenance for water supply system on January 25th, 2024. Water will be unavailable from 9 AM to 3 PM.',
        type: 'maintenance',
        priority: 'high',
        is_read: false,
        created_at: '2024-01-20T10:00:00Z',
        expires_at: '2024-01-25T23:59:59Z',
        action_required: false
      },
      {
        id: '2',
        title: 'Payment Overdue',
        content: 'Your mess fee payment of ₹2,000 is overdue. Please make the payment immediately to avoid any inconvenience.',
        type: 'payment',
        priority: 'high',
        is_read: false,
        created_at: '2024-01-19T14:30:00Z',
        action_required: true
      },
      {
        id: '3',
        title: 'Mess Menu Update',
        content: 'New vegetarian and non-vegetarian options added to the mess menu. Check the updated menu at the dining hall.',
        type: 'announcement',
        priority: 'medium',
        is_read: true,
        created_at: '2024-01-19T14:30:00Z',
        action_required: false
      },
      {
        id: '4',
        title: 'Cultural Event - Hostel Night',
        content: 'Join us for the annual hostel cultural night on February 15th, 2024. Registration is now open.',
        type: 'event',
        priority: 'medium',
        is_read: false,
        created_at: '2024-01-18T09:15:00Z',
        expires_at: '2024-02-15T23:59:59Z',
        action_required: true
      },
      {
        id: '5',
        title: 'Library Hours Extension',
        content: 'Library will remain open until 11 PM during exam period (January 22 - February 5).',
        type: 'announcement',
        priority: 'low',
        is_read: true,
        created_at: '2024-01-18T09:15:00Z',
        expires_at: '2024-02-05T23:59:59Z',
        action_required: false
      },
      {
        id: '6',
        title: 'URGENT: Fire Drill Tomorrow',
        content: 'Mandatory fire drill will be conducted tomorrow at 10 AM. All students must participate.',
        type: 'urgent',
        priority: 'high',
        is_read: false,
        created_at: '2024-01-17T16:00:00Z',
        action_required: true
      }
    ];

    console.log('[StudentNotificationsPage] Setting notifications:', mockNotifications);
    setNotifications(mockNotifications);
  }, []);

  const handleLogout = async () => {
    console.log('[StudentNotificationsPage] Logout button clicked');
    try {
      await logout();
      // Navigation is now handled by the AuthContext logout function
    } catch (error) {
      console.error('[StudentNotificationsPage] Logout failed:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      'announcement': Info,
      'payment': CreditCard,
      'maintenance': AlertTriangle,
      'event': Calendar,
      'urgent': Bell
    };
    return iconMap[type as keyof typeof iconMap] || Info;
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (type === 'urgent' || priority === 'high') return 'text-red-600';
    if (priority === 'medium') return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      'high': { variant: 'destructive' as const, text: 'High' },
      'medium': { variant: 'secondary' as const, text: 'Medium' },
      'low': { variant: 'outline' as const, text: 'Low' }
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.low;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, is_read: true }))
    );
  };

  // Navigation items for students
  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/student', current: false },
    { name: 'My Profile', icon: User, href: '/student-profile', current: false },
    { name: 'Room Details', icon: Building2, href: '/student-room', current: false },
    { name: 'Payments', icon: CreditCard, href: '/student-payments', current: false },
    { name: 'Attendance', icon: Calendar, href: '/student-attendance', current: false },
    { name: 'Notifications', icon: Bell, href: '/student-notifications', badge: notifications.filter(n => !n.is_read).length, current: true },
    { name: 'Documents', icon: FileText, href: '/student-documents', current: false },
    { name: 'Help & Support', icon: HelpCircle, href: '/student-help', current: false },  
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent' && !n.is_read).length;

  console.log('[StudentNotificationsPage] Rendering, notifications:', notifications);

  if (!notifications.length) {
    console.log('[StudentNotificationsPage] No notifications, showing loading state');
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
              <p className="ml-2">Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('[StudentNotificationsPage] Rendering main content with notifications');

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
          {/* Header */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">Stay updated with hostel announcements and important notices</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Student</Badge>
                  <span className="text-sm text-muted-foreground">{user?.email?.split('@')[0] || 'SU'}</span>
                </div>
                <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications Content */}
          <div className="p-6">
            {/* Notification Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Bell className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{notifications.length}</p>
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
                      <p className="text-sm font-medium text-muted-foreground">Unread</p>
                      <p className="text-2xl font-bold">{unreadCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                      <p className="text-2xl font-bold">{urgentCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => {
                    const NotificationIcon = getNotificationIcon(notification.type);
                    const priorityInfo = getPriorityBadge(notification.priority);
                    const iconColor = getNotificationColor(notification.type, notification.priority);
                    
                    return (
                      <div 
                        key={notification.id} 
                        className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                          !notification.is_read ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg ${!notification.is_read ? 'bg-blue-100' : 'bg-muted'}`}>
                            <NotificationIcon className={`h-5 w-5 ${iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className={`font-medium ${!notification.is_read ? 'text-blue-900' : ''}`}>
                                  {notification.title}
                                  {!notification.is_read && (
                                    <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.content}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge variant={priorityInfo.variant}>
                                  {priorityInfo.text}
                                </Badge>
                                {notification.action_required && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                                    Action Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{formatDate(notification.created_at)}</span>
                              <div className="flex items-center space-x-2">
                                {notification.expires_at && (
                                  <span>Expires: {formatDate(notification.expires_at)}</span>
                                )}
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    Mark as Read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
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
