import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Users, 
  Shield, 
  Settings, 
  Database, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Camera,
  UserCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData, useRecentActivity } from '@/hooks/useDashboardData';

export function AdminDashboard() {
  const { user } = useAuth();
  const { stats, isLoading, error } = useDashboardData();
  const { activities } = useRecentActivity(4);

  if (isLoading) {
    return (
      <Layout title="System Administration" breadcrumbs={[{ title: 'Admin Dashboard' }]}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="System Administration" breadcrumbs={[{ title: 'Admin Dashboard' }]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading dashboard data: {error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const systemStats = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      change: `${stats.activeStudents} active`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Today\'s Entries',
      value: stats.todayEntries,
      change: `${stats.todayExits} exits`,
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Pending Alerts',
      value: stats.pendingAlerts,
      change: `${stats.resolvedAlerts} resolved`,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Detection Accuracy',
      value: `${stats.detectionAccuracy}%`,
      change: 'AI Performance',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  const pendingRequests = [
    {
      id: '1',
      name: 'Officer John Martinez',
      email: 'j.martinez@police.gov',
      role: 'investigator',
      organization: 'Metro Police Dept.',
      requestDate: '2024-08-24'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 's.wilson@helpingkids.org',
      role: 'case_manager',
      organization: 'Missing Kids NGO',
      requestDate: '2024-08-23'
    },
    {
      id: '3',
      name: 'Detective Mike Brown',
      email: 'm.brown@police.gov',
      role: 'case_manager',
      organization: 'City Police',
      requestDate: '2024-08-22'
    },
  ];

  const systemHealth = [
    { component: 'AI Processing Engine', status: 'healthy', load: 85 },
    { component: 'Camera Network', status: 'warning', load: 92 },
    { component: 'Database Cluster', status: 'healthy', load: 67 },
    { component: 'Alert System', status: 'healthy', load: 43 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Layout 
      title="System Administration" 
      breadcrumbs={[{ title: 'Admin Dashboard' }]}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 to-purple-600 text-white p-6 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8" />
            <h2 className="text-2xl font-bold">
              Welcome back, {user?.name}
            </h2>
          </div>
          <p className="text-red-100">
            System overview and administrative controls for TraceVision platform.
          </p>
        </motion.div>

        {/* System Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {systemStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Pending User Requests */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Access Requests</CardTitle>
                    <CardDescription>
                      New user registrations requiring approval
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">3</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{request.name}</p>
                        <p className="text-sm text-gray-500">{request.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {request.role.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">{request.organization}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>System Health Monitor</CardTitle>
                <CardDescription>
                  Real-time status of critical system components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemHealth.map((component, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{component.component}</span>
                      <Badge className={getStatusColor(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={component.load} className="flex-1 h-2" />
                      <span className="text-xs text-gray-500 w-10">{component.load}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Administrative Actions</CardTitle>
              <CardDescription>
                Quick access to common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Camera Config</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Database className="h-6 w-6" />
                  <span className="text-sm">AI Models</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">System Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>
                Latest entry/exit logs and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg border">
                      <div className={`p-1 rounded-full ${
                        activity.entry_type === 'entry' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {activity.entry_type === 'entry' ? 
                          <UserCheck className="h-4 w-4 text-green-600" /> :
                          <Activity className="h-4 w-4 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.entry_type === 'entry' ? 'Student Entry' : 'Student Exit'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.student_name} ({activity.register_number}) at {activity.location}
                        </p>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
