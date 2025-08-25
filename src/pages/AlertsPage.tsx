import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Clock, Eye, CheckCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

export function AlertsPage() {
  const alerts = [
    {
      id: '1',
      personName: 'Sarah Thompson',
      caseId: 'CASE-2024-001',
      detectionTime: '2024-08-25 14:30:15',
      location: 'Downtown Station - Camera 12',
      confidence: 94,
      status: 'new',
      imageUrl: '/api/placeholder/200/200'
    },
    {
      id: '2',
      personName: 'Michael Johnson',
      caseId: 'CASE-2024-002',
      detectionTime: '2024-08-25 13:45:22',
      location: 'Shopping Mall - Camera 8',
      confidence: 87,
      status: 'verified',
      imageUrl: '/api/placeholder/200/200'
    },
    {
      id: '3',
      personName: 'Emily Davis',
      caseId: 'CASE-2024-003',
      detectionTime: '2024-08-25 12:15:33',
      location: 'Bus Terminal - Camera 3',
      confidence: 91,
      status: 'new',
      imageUrl: '/api/placeholder/200/200'
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive">New</Badge>;
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
      title="Alert Dashboard" 
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Alert Dashboard' }
      ]}
    >
      <div className="space-y-6">
        {/* Alert Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">New Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">8</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Verified Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">12</div>
              <p className="text-xs text-muted-foreground">Confirmed matches</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">False Positives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">3</div>
              <p className="text-xs text-muted-foreground">Marked as incorrect</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Real-time Alerts</CardTitle>
              <CardDescription>
                Latest detection alerts from the AI monitoring system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Placeholder for detection image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Eye className="h-6 w-6 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{alert.personName}</h3>
                            <p className="text-sm text-muted-foreground">Case: {alert.caseId}</p>
                          </div>
                          {getStatusBadge(alert.status)}
                        </div>
                        
                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {alert.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {alert.detectionTime}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Confidence Score</span>
                            <span className="text-sm font-medium">{alert.confidence}%</span>
                          </div>
                          <Progress value={alert.confidence} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {alert.status === 'new' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* High Priority Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>High Priority:</strong> Multiple detections of Sarah Thompson in the downtown area. 
              Confidence scores above 90%. Consider immediate field response.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </Layout>
  );
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}
