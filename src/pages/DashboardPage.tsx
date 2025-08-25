import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  MapPin,
  Camera,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Active Cases',
      value: 24,
      change: '+2 from last week',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'New Alerts Today',
      value: 8,
      change: '+3 from yesterday',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Detections This Week',
      value: 156,
      change: '+23% from last week',
      icon: Eye,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Cases Resolved',
      value: 12,
      change: '+4 this month',
      icon: CheckCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  const recentAlerts = [
    {
      id: '1',
      personName: 'Sarah Thompson',
      location: 'Downtown Station',
      time: '10 minutes ago',
      confidence: 94,
      status: 'new' as const,
    },
    {
      id: '2',
      personName: 'Michael Johnson',
      location: 'Shopping Mall',
      time: '25 minutes ago',
      confidence: 87,
      status: 'verified' as const,
    },
    {
      id: '3',
      personName: 'Emily Davis',
      location: 'Bus Terminal',
      time: '1 hour ago',
      confidence: 91,
      status: 'new' as const,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary">New</Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'false_positive':
        return <Badge variant="outline">False Positive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout 
      title="Dashboard" 
      breadcrumbs={[{ title: 'Dashboard' }]}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name}
          </h2>
          <p className="text-blue-100">
            Here's what's happening with missing persons detection today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
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
          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>
                      Latest detection alerts from AI monitoring
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.personName}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{alert.location}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{alert.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {alert.confidence}% confidence
                        </div>
                        <Progress value={alert.confidence} className="w-16 h-2 mt-1" />
                      </div>
                      <div>
                        {getStatusBadge(alert.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Frequently used functions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.role !== 'investigator' && (
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Case
                  </Button>
                )}
                
                <Button className="w-full justify-start" variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Search Missing Persons
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="mr-2 h-4 w-4" />
                  View Detection Map
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Camera className="mr-2 h-4 w-4" />
                  Camera Status
                </Button>
                
                {user?.role === 'admin' && (
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    System Analytics
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Real-time monitoring of TraceVision components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">AI Processing</p>
                    <p className="text-xs text-muted-foreground">Running normally</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Camera Network</p>
                    <p className="text-xs text-muted-foreground">127/132 cameras online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-xs text-muted-foreground">High load detected</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
