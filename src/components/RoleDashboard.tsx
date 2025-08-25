import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { CaseManagerDashboard } from '@/pages/CaseManagerDashboard';
import { InvestigatorDashboard } from '@/pages/InvestigatorDashboard';
import { DashboardPage } from '@/pages/DashboardPage';

export function RoleDashboard() {
  const { user } = useAuth();

  if (!user) {
    return null; // This shouldn't happen due to ProtectedRoute, but just in case
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'case_manager':
      return <CaseManagerDashboard />;
    case 'investigator':
      return <InvestigatorDashboard />;
    default:
      // Fallback to general dashboard for any other roles
      return <DashboardPage />;
  }
}
