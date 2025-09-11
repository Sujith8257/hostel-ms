import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Bed, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Eye,
  Clock,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

export function RoomManagementPage() {
  // Mock data for room management
  const stats = {
    totalRooms: 156,
    occupiedRooms: 144,
    availableRooms: 12,
    maintenanceRooms: 3,
    occupancyRate: 92.3,
    totalCapacity: 624,
    currentOccupancy: 576
  };

  const roomTypes = [
    { type: '2-Sharing', count: 48, occupied: 45, available: 3, color: 'bg-blue-500' },
    { type: '4-Sharing', count: 78, occupied: 72, available: 6, color: 'bg-green-500' },
    { type: '5-Sharing', count: 30, occupied: 27, available: 3, color: 'bg-purple-500' }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'check_in',
      student: 'John Doe',
      room: 'A-101',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'check_out',
      student: 'Jane Smith',
      room: 'B-205',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'maintenance',
      room: 'C-301',
      time: '6 hours ago',
      status: 'in_progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Layout 
      breadcrumbs={[
        { title: 'Dashboard', href: '/admin' },
        { title: 'Room Management' }
      ]}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
            <p className="text-muted-foreground">
              Manage hostel rooms, occupancy, and student assignments
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              System Online
            </Badge>
            <Badge variant={stats.maintenanceRooms > 0 ? "destructive" : "secondary"}>
              {stats.maintenanceRooms} Under Maintenance
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
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
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
              <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.occupiedRooms}</div>
              <p className="text-xs text-muted-foreground">
                {stats.occupancyRate}% occupancy rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.availableRooms}</div>
              <p className="text-xs text-muted-foreground">
                Ready for new students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.maintenanceRooms}</div>
              <p className="text-xs text-muted-foreground">
                Under repair
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rooms">Room Details</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Room Type Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Room Type Distribution</CardTitle>
                  <CardDescription>Breakdown of rooms by type and occupancy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roomTypes.map((roomType, index) => (
                      <div key={roomType.type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${roomType.color}`} />
                            <span className="font-medium">{roomType.type}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {roomType.occupied}/{roomType.count} occupied
                          </div>
                        </div>
                        <Progress 
                          value={(roomType.occupied / roomType.count) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{roomType.available} available</span>
                          <span>{((roomType.occupied / roomType.count) * 100).toFixed(1)}% occupied</span>
                        </div>
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
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common room management tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Assign Student</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Building2 className="h-6 w-6" />
                      <span className="text-sm">Add Room</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="text-sm">Maintenance</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Eye className="h-6 w-6" />
                      <span className="text-sm">View Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
                <CardDescription>Detailed view of all rooms and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>Room details table will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest room assignments and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className={`p-1 rounded-full ${
                          activity.type === 'check_in' ? 'bg-green-100' : 
                          activity.type === 'check_out' ? 'bg-blue-100' : 'bg-yellow-100'
                        }`}>
                          {activity.type === 'check_in' ? 
                            <Users className="h-4 w-4 text-green-600" /> :
                            activity.type === 'check_out' ?
                            <LogOut className="h-4 w-4 text-blue-600" /> :
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          }
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.type === 'check_in' ? 'Student Check-in' :
                             activity.type === 'check_out' ? 'Student Check-out' : 'Maintenance'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.student && `${activity.student} - `}Room {activity.room}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
