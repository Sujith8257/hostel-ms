import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Shield, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Clock,
  Building2,
  Eye,
  HelpCircle,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export function WardenDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation is now handled by the AuthContext logout function
  };

  const navigationItems = [
    // Main Navigation
    { name: 'Dashboard', icon: Activity, href: '/warden', current: true },
    { name: 'Students', icon: Users, href: '/warden/students' },
    { name: 'Entry/Exit Logs', icon: Clock, href: '/warden/entries' },
    { name: 'Security Alerts', icon: AlertTriangle, href: '/warden/alerts', badge: 2 },
  ];

  const helpItems = [
    { name: 'Help & Support', icon: HelpCircle, href: '/warden/help' },
  ];

  const stats = {
    totalStudents: 1247,
    presentStudents: 1156,
    absentStudents: 91,
    unauthorizedAttempts: 3,
    activeAlerts: 2,
    roomOccupancy: 92.4,
    todayEntries: 856,
    todayExits: 743
  };

  const recentAlerts = [
    {
      id: 1,
      type: 'unauthorized_entry',
      message: 'Unauthorized person detected at Block A entrance',
      time: '5 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'suspicious_activity',
      message: 'Multiple failed RFID attempts at Block B',
      time: '15 minutes ago',
      severity: 'medium'
    }
  ];

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, Warden`;
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
                <h1 className="text-2xl font-bold">HostelMS</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Warden</Badge>
                  <span className="text-sm text-muted-foreground">{user?.email?.split('@')[0] || 'Warden'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{getWelcomeMessage()}</h1>
                  <p className="text-muted-foreground">
                    Welcome to the Hostel Management System dashboard
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    System Online
                  </Badge>
                  <Badge variant={stats.activeAlerts > 0 ? "destructive" : "secondary"}>
                    {stats.activeAlerts} Active Alerts
                  </Badge>
                </div>
              </motion.div>

              {/* Key Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +2.5% from last month
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.presentStudents}</div>
                    <p className="text-xs text-muted-foreground">
                      {((stats.presentStudents / stats.totalStudents) * 100).toFixed(1)}% attendance
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Room Occupancy</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.roomOccupancy}%</div>
                    <Progress value={stats.roomOccupancy} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.unauthorizedAttempts}</div>
                    <p className="text-xs text-muted-foreground">
                      Unauthorized attempts today
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity & Alerts */}
              <div className="grid gap-6 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Today's Activity
                      </CardTitle>
                      <CardDescription>Entry/Exit summary for today</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Entries</span>
                        <Badge variant="outline">{stats.todayEntries}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Exits</span>
                        <Badge variant="outline">{stats.todayExits}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Currently Inside</span>
                        <Badge variant="secondary">{stats.todayEntries - stats.todayExits}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Recent Security Alerts
                      </CardTitle>
                      <CardDescription>Latest security notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentAlerts.length > 0 ? (
                        <div className="space-y-3">
                          {recentAlerts.map((alert) => (
                            <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                              <div className={`h-2 w-2 rounded-full mt-2 ${
                                alert.severity === 'high' ? 'bg-red-500' : 
                                alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">{alert.message}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {alert.time}
                                </p>
                              </div>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" className="w-full">
                            View All Alerts
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent alerts</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
