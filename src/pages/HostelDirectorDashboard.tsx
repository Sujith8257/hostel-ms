import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2,
  Users, 
  Shield, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Settings,
  UserCheck,
  Clock,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { directorApi } from '@/api/client';

export function HostelDirectorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await directorApi.getDashboard();
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
    totalBuildings: 4,
    totalStudents: 2847,
    occupancyRate: 85.3,
    staffMembers: 28,
    securityAlerts: 2,
    maintenanceRequests: 12,
    monthlyRevenue: 2840000,
    satisfactionScore: 4.2
  };

  const buildings = [
    {
      id: '1',
      name: 'Block A - Men\'s Hostel',
      occupancy: 92,
      capacity: 240,
      floors: 4,
      warden: 'Mr. Rajesh Kumar',
      status: 'operational'
    },
    {
      id: '2',
      name: 'Block B - Women\'s Hostel',
      occupancy: 88,
      capacity: 180,
      floors: 3,
      warden: 'Ms. Priya Sharma',
      status: 'operational'
    },
    {
      id: '3',
      name: 'Block C - PG Block',
      occupancy: 75,
      capacity: 120,
      floors: 5,
      warden: 'Mr. Suresh Patel',
      status: 'maintenance'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'security',
      message: 'Unauthorized entry detected at Block A',
      time: '2 hours ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'maintenance',
      message: 'HVAC system maintenance completed in Block B',
      time: '4 hours ago',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'occupancy',
      message: 'New batch of 45 students checked in',
      time: '6 hours ago',
      severity: 'low'
    }
  ];

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, Director ${user?.name || 'User'}`;
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
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="h-8 w-8" />
            <h2 className="text-2xl font-bold">
              {getWelcomeMessage()}
            </h2>
          </div>
          <p className="text-purple-100">
            Institution-wide overview and strategic management for all hostel operations.
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
              <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBuildings}</div>
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
              <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all hostels
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
              <Progress value={stats.occupancyRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.securityAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Buildings Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Hostel Buildings</CardTitle>
                <CardDescription>Overview of all buildings under management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {buildings.map((building) => (
                  <div key={building.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{building.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Warden: {building.warden}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">Occupancy:</span>
                        <Progress value={building.occupancy} className="w-16 h-2" />
                        <span className="text-xs">{building.occupancy}%</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={building.status === 'operational' ? 'default' : 'secondary'}>
                        {building.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {building.floors} floors
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest events across all hostels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${
                      activity.severity === 'high' ? 'bg-red-100 text-red-600' :
                      activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'security' && <Shield className="h-4 w-4" />}
                      {activity.type === 'maintenance' && <Settings className="h-4 w-4" />}
                      {activity.type === 'occupancy' && <Users className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Director Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Director Actions</CardTitle>
              <CardDescription>Strategic management and oversight tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Manage Buildings</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <UserCheck className="h-6 w-6" />
                  <span className="text-sm">Staff Assignments</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Policies</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}