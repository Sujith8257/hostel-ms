import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Activity,
  UserCheck,
  Clock,
  Building,
  ClipboardList,
  BookOpen,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { associateWardenApi } from '@/api/client';

export function AssociateWardenDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await associateWardenApi.getDashboard();
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
    assignedFloors: 2,
    totalStudents: 84,
    presentToday: 78,
    absentToday: 6,
    pendingTasks: 3,
    completedTasks: 12,
    attendanceRate: 92.9,
    roomOccupancy: 95
  };

  const assignedFloors = [
    {
      id: '1',
      floor: 2,
      building: 'Block A',
      totalRooms: 20,
      occupiedRooms: 19,
      totalStudents: 42,
      presentStudents: 39
    },
    {
      id: '2',
      floor: 3,
      building: 'Block A',
      totalRooms: 20,
      occupiedRooms: 20,
      totalStudents: 42,
      presentStudents: 39
    }
  ];

  const todaysTasks = [
    {
      id: 1,
      type: 'attendance',
      title: 'Mark Morning Attendance',
      description: 'Mark attendance for all students in assigned floors',
      status: 'completed',
      time: '8:00 AM'
    },
    {
      id: 2,
      type: 'inspection',
      title: 'Room Inspection - Floor 2',
      description: 'Monthly cleanliness and safety inspection',
      status: 'in_progress',
      time: '2:00 PM'
    },
    {
      id: 3,
      type: 'incident',
      title: 'Follow up on Noise Complaint',
      description: 'Room 201 - loud music late night',
      status: 'pending',
      time: '4:00 PM'
    }
  ];

  const recentIncidents = [
    {
      id: 1,
      room: '201',
      type: 'Noise Complaint',
      severity: 'low',
      time: 'Yesterday 11:30 PM',
      status: 'resolved'
    },
    {
      id: 2,
      room: '305',
      type: 'Maintenance Issue',
      severity: 'medium',
      time: 'Today 9:15 AM',
      status: 'pending'
    }
  ];

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const roleDisplay = user?.role === 'deputy_warden' ? 'Deputy Warden' : 'Assistant Warden';
    return `${greeting}, ${roleDisplay} ${user?.name || 'User'}`;
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
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Building className="h-8 w-8" />
            <h2 className="text-2xl font-bold">
              {getWelcomeMessage()}
            </h2>
          </div>
          <p className="text-green-100">
            Floor-level supervision and student welfare management.
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
              <CardTitle className="text-sm font-medium">Assigned Floors</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedFloors}</div>
              <p className="text-xs text-muted-foreground">
                Under your supervision
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                In your floors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
              <Progress value={stats.attendanceRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.presentToday} present, {stats.absentToday} absent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedTasks} completed today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Assigned Floors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Assigned Floors</CardTitle>
                <CardDescription>Overview of floors under your supervision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignedFloors.map((floor) => (
                  <div key={floor.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Floor {floor.floor} - {floor.building}</p>
                      <p className="text-sm text-muted-foreground">
                        {floor.totalStudents} students, {floor.occupiedRooms}/{floor.totalRooms} rooms occupied
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">Occupancy:</span>
                        <Progress value={(floor.occupiedRooms / floor.totalRooms) * 100} className="w-16 h-2" />
                        <span className="text-xs">{Math.round((floor.occupiedRooms / floor.totalRooms) * 100)}%</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="outline">
                        {floor.presentStudents}/{floor.totalStudents} Present
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Attendance: {Math.round((floor.presentStudents / floor.totalStudents) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Your scheduled activities and duties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-600' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {task.type === 'attendance' && <UserCheck className="h-4 w-4" />}
                      {task.type === 'inspection' && <Shield className="h-4 w-4" />}
                      {task.type === 'incident' && <AlertTriangle className="h-4 w-4" />}
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
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Recent issues and their resolution status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`h-5 w-5 ${
                        incident.severity === 'high' ? 'text-red-500' :
                        incident.severity === 'medium' ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                      <div>
                        <p className="font-medium">Room {incident.room} - {incident.type}</p>
                        <p className="text-sm text-muted-foreground">{incident.time}</p>
                      </div>
                    </div>
                    <Badge variant={incident.status === 'resolved' ? 'default' : 'secondary'}>
                      {incident.status}
                    </Badge>
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
              <CardDescription>Common tasks and management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Mark Attendance</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Room Inspection</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">Report Incident</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}