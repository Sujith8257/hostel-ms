import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  MapPin,
  Search,
  Eye,
  Filter,
  Calendar,
  Home,
  UserPlus,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData, useUnresolvedAlerts, useRecentActivity } from '@/hooks/useDashboardData';
import type { DbStudent } from '@/types/database-models';

export function WardenDashboard() {
  const { user } = useAuth();
  const { stats, students, isLoading, error } = useDashboardData();
  const { alerts } = useUnresolvedAlerts();
  const { activities } = useRecentActivity(5);

  if (isLoading) {
    return (
      <Layout title="Warden Dashboard" breadcrumbs={[{ title: 'Warden Dashboard' }]}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Warden Dashboard" breadcrumbs={[{ title: 'Warden Dashboard' }]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading dashboard data: {error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const hostelStats = [
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
      change: 'Need attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: 'All cameras online',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  // Get recent students for display
  const recentStudents = students.slice(0, 5);

  const getStatusBadge = (student: DbStudent) => {
    if (!student.is_active) {
      return <Badge variant="outline">Inactive</Badge>;
    }
    
    switch (student.hostel_status) {
      case 'resident':
        return <Badge className="bg-green-100 text-green-800">Resident</Badge>;
      case 'day_scholar':
        return <Badge className="bg-blue-100 text-blue-800">Day Scholar</Badge>;
      case 'former_resident':
        return <Badge variant="outline">Former</Badge>;
      default:
        return <Badge variant="outline">{student.hostel_status}</Badge>;
    }
  };

  return (
    <Layout 
      title="Warden Dashboard" 
      breadcrumbs={[{ title: 'Warden Dashboard' }]}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name}
              </h2>
              <p className="text-blue-100">
                Monitor hostel activity and manage student entry/exit logs.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">Hostel Management System</p>
              <p className="text-lg font-semibold">Warden</p>
            </div>
          </div>
        </motion.div>

        {/* Hostel Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {hostelStats.map((stat, index) => (
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Student Management */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Management</CardTitle>
                    <CardDescription>
                      Recent student registrations and status
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStudents.length > 0 ? (
                    recentStudents.map((student) => (
                      <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-lg">{student.full_name}</h3>
                              {getStatusBadge(student)}
                            </div>
                            <p className="text-sm text-gray-600">ID: {student.register_number}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-1" />
                            Room: {student.room_number || 'Not assigned'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Joined: {new Date(student.created_at).toLocaleDateString()}
                          </div>
                          {student.email && (
                            <div className="flex items-center">
                              <span className="text-sm">📧 {student.email}</span>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center">
                              <span className="text-sm">📱 {student.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                          <Button size="sm" variant="outline">
                            <Activity className="h-4 w-4 mr-1" />
                            Entry Logs
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No students registered yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity & Alerts */}
          <div className="space-y-6">
            {/* Priority Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>
                    Unauthorized detections requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.length > 0 ? (
                    alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">Unauthorized Detection</h4>
                          <Badge variant="destructive">
                            {alert.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {alert.location}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                          {alert.confidence_score && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">Confidence</span>
                                <span className="text-xs font-medium">{alert.confidence_score}%</span>
                              </div>
                              <Progress value={alert.confidence_score} className="h-1" />
                            </>
                          )}
                          <Button size="sm" className="w-full mt-2">
                            Review Alert
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">No pending alerts</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest entry/exit logs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg border">
                        <div className={`p-1 rounded-full ${
                          activity.entry_type === 'entry' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <Activity className={`h-3 w-3 ${
                            activity.entry_type === 'entry' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium">{activity.student_name}</p>
                          <p className="text-xs text-gray-500">
                            {activity.entry_type} at {activity.location}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used hostel management functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <UserPlus className="h-5 w-5" />
                  <span className="text-sm">Add Student</span>
                </Button>
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <Search className="h-5 w-5" />
                  <span className="text-sm">Search Students</span>
                </Button>
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">View Alerts</span>
                </Button>
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <Activity className="h-5 w-5" />
                  <span className="text-sm">Entry Logs</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}