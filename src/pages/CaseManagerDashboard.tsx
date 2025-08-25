import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  MapPin,
  Plus,
  Search,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function CaseManagerDashboard() {
  const { user } = useAuth();

  const caseStats = [
    {
      title: 'My Active Cases',
      value: 12,
      change: '+3 this week',
      icon: FolderOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'New Alerts Today',
      value: 8,
      change: '4 unreviewed',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Cases Resolved',
      value: 23,
      change: '+5 this month',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Success Rate',
      value: '76%',
      change: '+12% vs last month',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  const recentCases = [
    {
      id: 'CASE-2024-089',
      name: 'Emma Rodriguez',
      age: 16,
      status: 'active',
      priority: 'high',
      lastSeen: 'Downtown Mall',
      dateReported: '2024-08-23',
      alerts: 3,
      investigator: 'Officer Chen'
    },
    {
      id: 'CASE-2024-087',
      name: 'Michael Thompson',
      age: 34,
      status: 'active',
      priority: 'medium',
      lastSeen: 'Central Station',
      dateReported: '2024-08-22',
      alerts: 1,
      investigator: 'Detective Jones'
    },
    {
      id: 'CASE-2024-085',
      name: 'Sarah Kim',
      age: 22,
      status: 'found',
      priority: 'high',
      lastSeen: 'University Campus',
      dateReported: '2024-08-20',
      alerts: 7,
      investigator: 'Officer Martinez'
    },
  ];

  const priorityAlerts = [
    {
      id: '1',
      caseName: 'Emma Rodriguez',
      location: 'Shopping Center - Camera 15',
      confidence: 92,
      time: '15 minutes ago',
      status: 'new'
    },
    {
      id: '2',
      caseName: 'Michael Thompson',
      location: 'Bus Terminal - Camera 3',
      confidence: 87,
      time: '45 minutes ago',
      status: 'reviewing'
    },
    {
      id: '3',
      caseName: 'David Wilson',
      location: 'Park Entrance - Camera 8',
      confidence: 94,
      time: '1 hour ago',
      status: 'new'
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'found':
        return <Badge className="bg-green-100 text-green-800">Found</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <Layout 
      title="Case Management Dashboard" 
      breadcrumbs={[{ title: 'Case Manager Dashboard' }]}
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
                Manage active cases and monitor detection alerts for missing persons.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">{user?.organization}</p>
              <p className="text-lg font-semibold">Case Manager</p>
            </div>
          </div>
        </motion.div>

        {/* Case Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {caseStats.map((stat, index) => (
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
          {/* Active Cases */}
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
                    <CardTitle>Active Cases</CardTitle>
                    <CardDescription>
                      Missing persons cases under your management
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Case
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCases.map((caseItem) => (
                    <div key={caseItem.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg">{caseItem.name}</h3>
                            <span className="text-sm text-gray-500">({caseItem.age} years old)</span>
                          </div>
                          <p className="text-sm text-gray-600">Case: {caseItem.id}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(caseItem.priority)}
                          {getStatusBadge(caseItem.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Last seen: {caseItem.lastSeen}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Reported: {caseItem.dateReported}
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {caseItem.alerts} alerts
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {caseItem.investigator}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Search className="h-4 w-4 mr-1" />
                          View Alerts
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Priority Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Priority Alerts</CardTitle>
                <CardDescription>
                  High-confidence detections requiring review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {priorityAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{alert.caseName}</h4>
                      <Badge variant={alert.status === 'new' ? 'destructive' : 'secondary'}>
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
                        {alert.time}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Confidence</span>
                        <span className="text-xs font-medium">{alert.confidence}%</span>
                      </div>
                      <Progress value={alert.confidence} className="h-1" />
                      <Button size="sm" className="w-full mt-2">
                        Review Alert
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used case management functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Create Case</span>
                </Button>
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <Search className="h-5 w-5" />
                  <span className="text-sm">Search Cases</span>
                </Button>
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">Review Alerts</span>
                </Button>
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm">Detection Map</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
