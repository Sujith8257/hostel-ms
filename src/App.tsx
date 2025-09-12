import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { HelpPage } from '@/pages/HelpPage';
import { SecurityMonitoringPage } from '@/pages/SecurityMonitoringPage';
import { VisitorManagementPage } from '@/pages/VisitorManagementPage';
import { StudentDashboard } from '@/pages/StudentDashboard';
import { StudentProfilePage } from '@/pages/StudentProfilePage';
import { StudentRoomDetailsPage } from '@/pages/StudentRoomDetailsPage';
import { StudentPaymentsPage } from '@/pages/StudentPaymentsPage';
import { StudentAttendancePage } from '@/pages/StudentAttendancePage';
import { WardenDashboard } from '@/pages/WardenDashboard';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { AboutUsPage } from '@/pages/AboutUsPage';
// Hostel Management Pages
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AlertsPage } from '@/pages/AlertsPage';
import { RoomManagementPage } from '@/pages/RoomManagementPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { EntryExitLogsPage } from '@/pages/EntryExitLogsPage';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Toaster } from "@/components/ui/sonner"
import './App.css';
import RouterLogger from '@/components/RouterLogger';
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute';

function AppContent() {
  // Initialize token refresh
  useTokenRefresh();

  return (
    <Router>
      <RouterLogger />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        } />
        <Route path="/signup" element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        } />
        <Route path="/about" element={<AboutUsPage />} />
        
        {/* Role-based Dashboard Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfilePage />} />
        <Route path="/student-room" element={<StudentRoomDetailsPage />} />
        <Route path="/student-payments" element={<StudentPaymentsPage />} />
        <Route path="/student-attendance" element={<StudentAttendancePage />} />
        <Route path="/warden" element={<WardenDashboard />} />
        
        
        {/* Management Pages */}
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/entries" element={<EntryExitLogsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/rooms" element={<RoomManagementPage />} />
        
        <Route path="/security" element={<SecurityMonitoringPage />} />
        
        <Route path="/visitors" element={<VisitorManagementPage />} />
        
        <Route path="/reports" element={<ReportsPage />} />
        
        <Route path="/admin/staff" element={
          <PlaceholderPage 
            title="Staff Management"
            description="Manage hostel staff, roles, and permissions"
            breadcrumbs={[
              { title: 'Dashboard', href: '/dashboard' },
              { title: 'Admin', href: '/admin' },
              { title: 'Staff Management' }
            ]}
          />
        } />
        
        <Route path="/admin/settings" element={
          <PlaceholderPage 
            title="System Settings"
            description="Configure hostel management system settings and preferences"
            breadcrumbs={[
              { title: 'Dashboard', href: '/dashboard' },
              { title: 'Admin', href: '/admin' },
              { title: 'Settings' }
            ]}
          />
        } />
        
        <Route path="/admin/access-control" element={
          <PlaceholderPage 
            title="Access Control"
            description="Configure RFID readers, biometric scanners, and entry points"
            breadcrumbs={[
              { title: 'Dashboard', href: '/dashboard' },
              { title: 'Admin', href: '/admin' },
              { title: 'Access Control' }
            ]}
          />
        } />
        
        <Route path="/admin/notifications" element={
          <PlaceholderPage 
            title="Notification Settings"
            description="Configure alert preferences and notification channels"
            breadcrumbs={[
              { title: 'Dashboard', href: '/dashboard' },
              { title: 'Admin', href: '/admin' },
              { title: 'Notifications' }
            ]}
          />
        } />
        
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
