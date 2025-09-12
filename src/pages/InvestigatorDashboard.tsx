import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Eye,
  CheckCircle,
  User,
  Camera,
  Navigation,
  Phone,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function InvestigatorDashboard() {
  const { user } = useAuth();

  const fieldStats = [
    {
      title: 'Assigned Cases',
      value: 6,
      change: '2 high priority',
      icon: Search,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Active Alerts',
      value: 4,
      change: 'Require field response',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Verifications Today',
      value: 12,
      change: '8 confirmed, 4 false',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Current Location',
      value: 'Zone 3',
      change: 'Downtown District',
      icon: MapPin,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  const assignedCases = [
    {
      id: 'CASE-2024-089',
      name: 'Emma Rodriguez',
      age: 16,
      priority: 'high',
      lastSeen: 'Downtown Mall',
      timeAssigned: '2 hours ago',
      manager: 'Detective Johnson'
    },
    {
      id: 'CASE-2024-087',
      name: 'Michael Thompson',
      age: 34,
      priority: 'medium',
      lastSeen: 'Central Station',
      timeAssigned: '1 day ago',
      manager: 'Detective Smith'
    },
    {
      id: 'CASE-2024-085',
      name: 'David Wilson',
      age: 28,
      priority: 'high',
      lastSeen: 'University Campus',
      timeAssigned: '3 hours ago',
      manager: 'Detective Johnson'
    },
  ];

  const activeAlerts = [
    {
      id: '1',
      caseName: 'Emma Rodriguez',
      location: 'Shopping Center - Camera 15',
      address: '1245 Main Street',
      confidence: 92,
      time: '15 minutes ago',
      distance: '0.8 km away',
      status: 'urgent'
    },
    {
      id: '2',
      caseName: 'David Wilson',
      location: 'Bus Terminal - Camera 3',
      address: '789 Transit Ave',
      confidence: 89,
      time: '35 minutes ago',
      distance: '2.1 km away',
      status: 'new'
    },
    {
      id: '3',
      caseName: 'Michael Thompson',
      location: 'Park Entrance - Camera 8',
      address: '456 Park Road',
      confidence: 87,
      time: '1 hour ago',
      distance: '1.5 km away',
      status: 'new'
    },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getAlertStatusBadge = (status: string) => {
    switch (status) {
      case 'urgent':
        return <Badge className="bg-red-500 text-white animate-pulse">URGENT</Badge>;
      case 'new':
        return <Badge variant="destructive">New</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout 
      title="Field Investigation Dashboard" 
      breadcrumbs={[{ title: 'Investigator Dashboard' }]}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Field Officer {user?.name}
              </h2>
              <p className="text-green-100">
                Real-time alerts and case information for field investigation.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-200">{user?.organization}</p>
              <div className="flex items-center mt-1">
                <div className="h-2 w-2 bg-green-300 rounded-full mr-2"></div>
                <p className="text-sm font-semibold">On Duty</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Urgent Alert Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>URGENT:</strong> High confidence detection of Emma Rodriguez at Shopping Center (0.8km away). 
              Immediate response requested.
              <Button size="sm" className="ml-4 bg-red-600 hover:bg-red-700">
                Respond Now
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Field Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {fieldStats.map((stat, index) => (
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Alerts for Field Response */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Field Alerts</CardTitle>
                    <CardDescription>
                      Detections requiring immediate field verification
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">4 Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    whileHover={{ scale: 1.02 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{alert.caseName}</h4>
                        <p className="text-sm text-gray-600">{alert.location}</p>
                        <p className="text-xs text-gray-500">{alert.address}</p>
                      </div>
                      {getAlertStatusBadge(alert.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {alert.time}
                      </div>
                      <div className="flex items-center">
                        <Navigation className="h-3 w-3 mr-1" />
                        {alert.distance}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Confidence</span>
                        <span className="text-xs font-medium">{alert.confidence}%</span>
                      </div>
                      <Progress value={alert.confidence} className="h-2" />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Navigation className="h-3 w-3 mr-1" />
                        Navigate
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Assigned Cases */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>My Assigned Cases</CardTitle>
                <CardDescription>
                  Missing persons cases under investigation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignedCases.map((caseItem) => (
                  <div key={caseItem.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{caseItem.name}</h4>
                          <span className="text-sm text-gray-500">({caseItem.age} years)</span>
                        </div>
                        <p className="text-sm text-gray-600">{caseItem.id}</p>
                      </div>
                      {getPriorityBadge(caseItem.priority)}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Last seen: {caseItem.lastSeen}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Assigned: {caseItem.timeAssigned}
                      </div>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        Manager: {caseItem.manager}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Field Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Field Operations</CardTitle>
              <CardDescription>
                Quick access to field investigation tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <Camera className="h-5 w-5" />
                  <span className="text-sm">Photo Report</span>
                </Button>
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm">Mark Location</span>
                </Button>
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <Phone className="h-5 w-5" />
                  <span className="text-sm">Call Dispatch</span>
                </Button>
                <Button className="h-16 flex-col space-y-2" variant="outline">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">File Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Communication Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>
                Recent messages and coordination updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { from: 'Detective Johnson', message: 'Emma Rodriguez case - check shopping center security footage', time: '10 min ago', urgent: true },
                  { from: 'Dispatch', message: 'New alert for David Wilson case in your area', time: '25 min ago', urgent: false },
                  { from: 'Detective Smith', message: 'Michael Thompson case update - witness statement received', time: '1 hour ago', urgent: false },
                ].map((msg, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${msg.urgent ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{msg.from}</p>
                      <div className="flex items-center">
                        {msg.urgent && <Badge variant="destructive" className="mr-2 text-xs">Urgent</Badge>}
                        <span className="text-xs text-gray-500">{msg.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{msg.message}</p>
                    <Button size="sm" variant="ghost" className="mt-2 p-0 h-auto">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
