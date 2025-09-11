import { useState, useEffect } from 'react';
import { 
  studentService, 
  entryLogService, 
  alertService, 
  subscribeToEntryLogs, 
  subscribeToAlerts, 
  subscribeToStudents 
} from '@/lib/services';
import type { DbStudent, DbEntryLog, DbAlert } from '@/types/database-models';

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  todayEntries: number;
  todayExits: number;
  pendingAlerts: number;
  resolvedAlerts: number;
  systemUptime: string;
  detectionAccuracy: number;
}

export function useDashboardData() {
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [entryLogs, setEntryLogs] = useState<DbEntryLog[]>([]);
  const [alerts, setAlerts] = useState<DbAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    todayEntries: 0,
    todayExits: 0,
    pendingAlerts: 0,
    resolvedAlerts: 0,
    systemUptime: '99.9%',
    detectionAccuracy: 94.2
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from raw data
  const calculateStats = (
    studentsData: DbStudent[], 
    entryLogsData: DbEntryLog[], 
    alertsData: DbAlert[]
  ): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayLogs = entryLogsData.filter(log => 
      log.timestamp.startsWith(today)
    );
    
    const todayEntries = todayLogs.filter(log => log.entry_type === 'entry').length;
    const todayExits = todayLogs.filter(log => log.entry_type === 'exit').length;
    
    const pendingAlerts = alertsData.filter(alert => 
      !alert.resolved_at && alert.status !== 'resolved'
    ).length;
    
    const resolvedAlerts = alertsData.filter(alert => 
      alert.resolved_at || alert.status === 'resolved'
    ).length;

    return {
      totalStudents: studentsData.length,
      activeStudents: studentsData.filter(s => s.is_active).length,
      todayEntries,
      todayExits,
      pendingAlerts,
      resolvedAlerts,
      systemUptime: '99.9%', // This would come from system monitoring
      detectionAccuracy: 94.2 // This would come from ML model metrics
    };
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [studentsData, entryLogsData, alertsData] = await Promise.all([
          studentService.getStudents(),
          entryLogService.getEntryLogs(100), // Get recent logs
          alertService.getAlerts()
        ]);

        setStudents(studentsData);
        setEntryLogs(entryLogsData);
        setAlerts(alertsData);
        setStats(calculateStats(studentsData, entryLogsData, alertsData));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const studentsChannel = subscribeToStudents((payload) => {
      if (payload.eventType === 'INSERT') {
        setStudents(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setStudents(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
      } else if (payload.eventType === 'DELETE') {
        setStudents(prev => prev.filter(s => s.id !== payload.old.id));
      }
    });

    const entryLogsChannel = subscribeToEntryLogs((payload) => {
      if (payload.eventType === 'INSERT') {
        setEntryLogs(prev => [payload.new, ...prev.slice(0, 99)]); // Keep only recent 100
      }
    });

    const alertsChannel = subscribeToAlerts((payload) => {
      if (payload.eventType === 'INSERT') {
        setAlerts(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
      } else if (payload.eventType === 'DELETE') {
        setAlerts(prev => prev.filter(a => a.id !== payload.old.id));
      }
    });

    return () => {
      void studentsChannel.unsubscribe();
      void entryLogsChannel.unsubscribe();
      void alertsChannel.unsubscribe();
    };
  }, []);

  // Recalculate stats when data changes
  useEffect(() => {
    setStats(calculateStats(students, entryLogs, alerts));
  }, [students, entryLogs, alerts]);

  return {
    students,
    entryLogs,
    alerts,
    stats,
    isLoading,
    error,
    refetch: async () => {
      try {
        setError(null);
        const [studentsData, entryLogsData, alertsData] = await Promise.all([
          studentService.getStudents(),
          entryLogService.getEntryLogs(100),
          alertService.getAlerts()
        ]);

        setStudents(studentsData);
        setEntryLogs(entryLogsData);
        setAlerts(alertsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh data');
      }
    }
  };
}

// Hook for recent activity/logs
export function useRecentActivity(limit = 10) {
  const [activities, setActivities] = useState<DbEntryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentLogs = async () => {
      try {
        const logs = await entryLogService.getEntryLogs(limit);
        setActivities(logs);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentLogs();

    // Subscribe to new entry logs
    const channel = subscribeToEntryLogs((payload) => {
      if (payload.eventType === 'INSERT') {
        setActivities(prev => [payload.new, ...prev.slice(0, limit - 1)]);
      }
    });

    return () => void channel.unsubscribe();
  }, [limit]);

  return { activities, isLoading };
}

// Hook for unresolved alerts
export function useUnresolvedAlerts() {
  const [alerts, setAlerts] = useState<DbAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUnresolvedAlerts = async () => {
      try {
        const allAlerts = await alertService.getAlerts();
        const unresolved = allAlerts.filter(alert => 
          !alert.resolved_at && alert.status !== 'resolved'
        );
        setAlerts(unresolved);
      } catch (err) {
        console.error('Error fetching unresolved alerts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnresolvedAlerts();

    // Subscribe to alert changes
    const channel = subscribeToAlerts((payload) => {
      if (payload.eventType === 'INSERT') {
        // Only add if not resolved
        if (!payload.new.resolved_at && payload.new.status !== 'resolved') {
          setAlerts(prev => [payload.new, ...prev]);
        }
      } else if (payload.eventType === 'UPDATE') {
        if (payload.new.resolved_at || payload.new.status === 'resolved') {
          // Remove resolved alert
          setAlerts(prev => prev.filter(a => a.id !== payload.new.id));
        } else {
          // Update existing alert
          setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
        }
      } else if (payload.eventType === 'DELETE') {
        setAlerts(prev => prev.filter(a => a.id !== payload.old.id));
      }
    });

    return () => void channel.unsubscribe();
  }, []);

  return { alerts, isLoading };
}