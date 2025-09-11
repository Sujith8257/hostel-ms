import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { AboutUsPage } from '@/pages/AboutUsPage';
// Hostel Management Pages
import { DashboardPage } from '@/pages/DashboardPage';
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
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/students" element={
          <ProtectedRoute>
            <StudentsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/entries" element={
          <ProtectedRoute>
            <EntryExitLogsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/alerts" element={
          <ProtectedRoute>
            <AlertsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/rooms" element={
          <ProtectedRoute>
            <RoomManagementPage />
          </ProtectedRoute>
        } />
        
        <Route path="/security" element={
          <ProtectedRoute>
            <PlaceholderPage 
              title="Security Monitoring"
              description="Real-time security monitoring and unauthorized access detection"
              breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Security' }
              ]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/visitors" element={
          <ProtectedRoute>
            <PlaceholderPage 
              title="Visitor Management"
              description="Register and track visitor access to hostel premises"
              breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Visitors' }
              ]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <PlaceholderPage 
              title="Reports & Analytics"
              description="Generate detailed reports on hostel operations and security metrics"
              breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Reports' }
              ]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/staff" element={
          <ProtectedRoute>
            <PlaceholderPage 
              title="Staff Management"
              description="Manage hostel staff, roles, and permissions"
              breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Admin', href: '/admin' },
                { title: 'Staff Management' }
              ]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <PlaceholderPage 
              title="System Settings"
              description="Configure hostel management system settings and preferences"
              breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Admin', href: '/admin' },
                { title: 'Settings' }
              ]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/access-control" element={
          <ProtectedRoute>
            <PlaceholderPage 
              title="Access Control"
              description="Configure RFID readers, biometric scanners, and entry points"
              breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Admin', href: '/admin' },
                { title: 'Access Control' }
              ]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/notifications" element={
          <ProtectedRoute>
            <PlaceholderPage 
              title="Notification Settings"
              description="Configure alert preferences and notification channels"
              breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Admin', href: '/admin' },
                { title: 'Notifications' }
              ]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/help" element={
          <ProtectedRoute>
            <PlaceholderPage 
              title="Help & Support"
              description="Documentation, user guides, and support resources"
              breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Help' }
              ]}
            />
          </ProtectedRoute>
        } />
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
