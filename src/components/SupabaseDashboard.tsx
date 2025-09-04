import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { studentService, entryLogService, alertService } from '@/lib/services';
import type { DbStudent, DbEntryLog, DbAlert } from '@/types/database-models';
import { SupabaseConnectionTest } from './SupabaseConnectionTest';

export function SupabaseDashboard() {
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [entryLogs, setEntryLogs] = useState<DbEntryLog[]>([]);
  const [alerts, setAlerts] = useState<DbAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentsData, entryLogsData, alertsData] = await Promise.all([
        studentService.getStudents(),
        entryLogService.getEntryLogs(10),
        alertService.getAlerts()
      ]);

      setStudents(studentsData);
      setEntryLogs(entryLogsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Supabase Dashboard</h2>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connection Test */}
      <div className="flex justify-center">
        <SupabaseConnectionTest />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              {students.filter(s => s.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Entries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entryLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 10 entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {alerts.length} total alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.register_number} • {student.room_number || 'No room'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={student.is_active ? 'default' : 'secondary'}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {student.hostel_status}
                    </Badge>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No students found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Entry Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entryLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{log.student_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.register_number} • {log.location}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={log.entry_type === 'entry' ? 'default' : 'secondary'}>
                      {log.entry_type}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {entryLogs.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No entry logs found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alert at {alert.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                    {alert.confidence_score && ` • Confidence: ${(alert.confidence_score * 100).toFixed(1)}%`}
                  </p>
                  {alert.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{alert.notes}</p>
                  )}
                </div>
                <Badge variant={alert.status === 'pending' ? 'destructive' : 'default'}>
                  {alert.status}
                </Badge>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No alerts found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}