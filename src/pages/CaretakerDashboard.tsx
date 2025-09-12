import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Building,
  Brush,
  Settings,
  Activity,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { caretakerApi } from '@/api/client';

export function CaretakerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await caretakerApi.getDashboard();
        if (response.success) {
          console.log('Dashboard data:', response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data for demonstration
  const stats = {
    assignedRooms: 25,
    completedTasks: 8,
    pendingTasks: 3,
    maintenanceRequests: 5,
    cleaningTasksToday: 12,
    completionRate: 85,
    workHours: 6.5,
    totalIssuesResolved: 23
  };

  const todaysTasks = [
    {
      id: 1,
      type: 'cleaning',
      title: 'Clean Common Area - Floor 2',
      room: 'Common Hall',
      priority: 'medium',
      status: 'completed',
      estimatedTime: '2 hours',
      completedTime: '1.5 hours'
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Fix Leaky Faucet',
      room: 'Room 205',
      priority: 'high',
      status: 'in_progress',
      estimatedTime: '1 hour',
      completedTime: null
    },
    {
      id: 3,
      type: 'cleaning',
      title: 'Deep Clean Bathroom',
      room: 'Floor 2 Bathroom',
      priority: 'medium',
      status: 'pending',
      estimatedTime: '1.5 hours',
      completedTime: null
    },
    {
      id: 4,
      type: 'maintenance',
      title: 'Replace Light Bulbs',
      room: 'Corridor 2A',
      priority: 'low',
      status: 'pending',
      estimatedTime: '30 minutes',
      completedTime: null
    }
  ];

  const maintenanceRequests = [
    {
      id: 1,
      room: '203',
      issue: 'Air conditioner not working',
      priority: 'high',
      reportedBy: 'Student A',
      reportedTime: '2 hours ago',
      status: 'assigned'
    },
    {
      id: 2,
      room: '207',
      issue: 'Electrical outlet sparking',
      priority: 'urgent',
      reportedBy: 'Student B',
      reportedTime: '1 hour ago',
      status: 'new'
    },
    {
      id: 3,
      room: '201',
      issue: 'Door lock jammed',
      priority: 'medium',
      reportedBy: 'Student C',
      reportedTime: '3 hours ago',
      status: 'in_progress'
    }
  ];

  const weeklyProgress = [
    { day: 'Mon', completed: 12, total: 15 },
    { day: 'Tue', completed: 14, total: 16 },
    { day: 'Wed', completed: 11, total: 13 },
    { day: 'Thu', completed: 13, total: 14 },
    { day: 'Fri', completed: 8, total: 12 },
    { day: 'Sat', completed: 0, total: 8 },
    { day: 'Sun', completed: 0, total: 6 }
  ];

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.name || 'Caretaker'}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Wrench className="h-8 w-8" />
            <h2 className="text-2xl font-bold">
              {getWelcomeMessage()}
            </h2>
          </div>
          <p className="text-orange-100">
            Maintenance and cleaning operations management dashboard.
          </p>
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
              <CardTitle className="text-sm font-medium">Assigned Rooms</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedRooms}</div>
              <p className="text-xs text-muted-foreground">
                Under your care
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}/{stats.completedTasks + stats.pendingTasks}</div>
              <Progress value={(stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingTasks} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.maintenanceRequests}</div>
              <p className="text-xs text-muted-foreground">
                Active requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Hours Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.workHours}h</div>
              <p className="text-xs text-muted-foreground">
                8h scheduled
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Your scheduled work assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-600' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {task.type === 'cleaning' && <Brush className="h-4 w-4" />}
                      {task.type === 'maintenance' && <Wrench className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{task.title}</p>
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{task.room}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority} priority
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {task.completedTime || task.estimatedTime}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Maintenance Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Issues reported by students and staff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mt-1 ${
                      request.priority === 'urgent' ? 'text-red-500' :
                      request.priority === 'high' ? 'text-orange-500' :
                      request.priority === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Room {request.room}</p>
                        <Badge variant={request.status === 'new' ? 'destructive' : 'secondary'}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{request.issue}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Reported by {request.reportedBy}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {request.reportedTime}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>Task completion overview for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weeklyProgress.map((day) => (
                  <div key={day.day} className="text-center space-y-2">
                    <p className="text-sm font-medium">{day.day}</p>
                    <div className="mx-auto w-12 h-12 rounded-full border-4 border-muted flex items-center justify-center relative">
                      <span className="text-xs font-bold">{day.completed}/{day.total}</span>
                      <div
                        className="absolute inset-0 rounded-full border-4 border-primary"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${
                            50 + 50 * Math.cos((day.completed / day.total * 360 - 90) * Math.PI / 180)
                          }% ${
                            50 + 50 * Math.sin((day.completed / day.total * 360 - 90) * Math.PI / 180)
                          }%, 50% 50%)`
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-sm">Mark Task Complete</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Report Issue</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Request Supplies</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">View Schedule</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}