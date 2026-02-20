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

const DASHBOARD_REQUEST_TIMEOUT_MS = 10000;
const DASHBOARD_SAFETY_TIMEOUT_MS = 15000;
const RECENT_STUDENTS_LIMIT = 8;

interface StudentSummary {
  totalStudents: number;
  activeStudents: number;
}

async function fetchDashboardDataWithTimeout(timeoutMs = DASHBOARD_REQUEST_TIMEOUT_MS) {
  const fetchPromise = Promise.all([
    studentService.getRecentStudents(RECENT_STUDENTS_LIMIT),
    entryLogService.getEntryLogs(100), // Get recent logs
    alertService.getAlerts(),
    studentService.getStudentSummary()
  ]) as Promise<[DbStudent[], DbEntryLog[], DbAlert[], StudentSummary]>;

  if (timeoutMs <= 0) {
    return fetchPromise;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Dashboard data request timed out after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);
  });

  try {
    return await Promise.race<[DbStudent[], DbEntryLog[], DbAlert[]]>([
      fetchPromise,
      timeoutPromise
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

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
  const [studentSummary, setStudentSummary] = useState<StudentSummary>({
    totalStudents: 0,
    activeStudents: 0
  });
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
    summary: StudentSummary, 
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
      totalStudents: summary.totalStudents,
      activeStudents: summary.activeStudents,
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
    let isMounted = true;
    const safetyTimeout = setTimeout(() => {
      if (!isMounted) {
        return;
      }
      console.warn('[useDashboardData] Forcing completion due to safety timeout');
      setIsLoading(false);
      setError((prev) => prev ?? 'Dashboard data is taking longer than expected. Showing last known values.');
    }, DASHBOARD_SAFETY_TIMEOUT_MS);

    const fetchInitialData = async () => {
      try {
        if (!isMounted) {
          return;
        }
        setIsLoading(true);
        setError(null);

        const [studentsData, entryLogsData, alertsData, summaryData] = await fetchDashboardDataWithTimeout();

        if (!isMounted) {
          return;
        }

        setStudentSummary(summaryData);
        setStudents(studentsData);
        setEntryLogs(entryLogsData);
        setAlerts(alertsData);
        setStats(calculateStats(summaryData, entryLogsData, alertsData));
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error('Error fetching dashboard data:', err);
        setStudentSummary({ totalStudents: 0, activeStudents: 0 });
        setStudents([]);
        setEntryLogs([]);
        setAlerts([]);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        if (!isMounted) {
          return;
        }
        clearTimeout(safetyTimeout);
        setIsLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const studentsChannel = subscribeToStudents((payload) => {
      if (payload.eventType === 'INSERT') {
        setStudents(prev => [payload.new, ...prev].slice(0, RECENT_STUDENTS_LIMIT));
        setStudentSummary(prev => ({
          totalStudents: prev.totalStudents + 1,
          activeStudents: prev.activeStudents + (payload.new.is_active ? 1 : 0)
        }));
      } else if (payload.eventType === 'UPDATE') {
        setStudents(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
        if (payload.old) {
          const wasActive = payload.old.is_active;
          const isActive = payload.new.is_active;
          if (wasActive !== isActive) {
            setStudentSummary(prev => ({
              totalStudents: prev.totalStudents,
              activeStudents: prev.activeStudents + (isActive ? 1 : -1)
            }));
          }
        }
      } else if (payload.eventType === 'DELETE') {
        setStudents(prev => prev.filter(s => s.id !== payload.old?.id));
        if (payload.old) {
          setStudentSummary(prev => ({
            totalStudents: Math.max(0, prev.totalStudents - 1),
            activeStudents: Math.max(0, prev.activeStudents - (payload.old.is_active ? 1 : 0))
          }));
        }
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
    setStats(calculateStats(studentSummary, entryLogs, alerts));
  }, [studentSummary, entryLogs, alerts]);

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
        const [studentsData, entryLogsData, alertsData, summaryData] = await fetchDashboardDataWithTimeout();

        setStudentSummary(summaryData);
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