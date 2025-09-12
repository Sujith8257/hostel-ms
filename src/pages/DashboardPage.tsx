import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserCheck, 
  Shield, 
  AlertTriangle, 
  Building2,
  Clock,
  Activity,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { SupabaseDashboard } from '@/components/SupabaseDashboard';

export function DashboardPage() {
  const { user } = useAuth();

  // Mock data for hostel management
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
    
    const roleMap = {
      admin: 'Administrator',
      hostel_director: 'Hostel Director',
      warden: 'Warden',
      deputy_warden: 'Deputy Warden',
      assistant_warden: 'Assistant Warden',
      floor_incharge: 'Floor Incharge'
    };

    return `${greeting}, ${roleMap[user?.role as keyof typeof roleMap] || 'User'}`;
  };

  const getRolePermissions = () => {
    const permissions = {
      admin: ['all'],
      hostel_director: ['all'],
      warden: ['students', 'security', 'alerts', 'rooms'],
      deputy_warden: ['students', 'security', 'alerts'],
      assistant_warden: ['students', 'alerts'],
      floor_incharge: ['students', 'alerts']
    };

    return permissions[user?.role as keyof typeof permissions] || [];
  };

  const canAccess = (feature: string) => {
    const userPermissions = getRolePermissions();
    return userPermissions.includes('all') || userPermissions.includes(feature);
  };

  return (
    <Layout>
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

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="supabase">Live Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {canAccess('students') && (
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <Users className="h-6 w-6" />
                        <span className="text-sm">Manage Students</span>
                      </Button>
                    )}
                    {canAccess('security') && (
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <Shield className="h-6 w-6" />
                        <span className="text-sm">Security Monitor</span>
                      </Button>
                    )}
                    {canAccess('alerts') && (
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <AlertTriangle className="h-6 w-6" />
                        <span className="text-sm">View Alerts</span>
                      </Button>
                    )}
                    {canAccess('rooms') && (
                      <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                        <Building2 className="h-6 w-6" />
                        <span className="text-sm">Room Management</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="supabase">
            <SupabaseDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
