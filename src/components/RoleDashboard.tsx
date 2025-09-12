import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { HostelDirectorDashboard } from '@/pages/HostelDirectorDashboard';
import { WardenDashboard } from '@/pages/WardenDashboard';
import { AssociateWardenDashboard } from '@/pages/AssociateWardenDashboard';
import { CaretakerDashboard } from '@/pages/CaretakerDashboard';
import { CaseManagerDashboard } from '@/pages/CaseManagerDashboard';
import { InvestigatorDashboard } from '@/pages/InvestigatorDashboard';
import { DashboardPage } from '@/pages/DashboardPage';

export function RoleDashboard() {
  const { user } = useAuth();

  if (!user) {
    return null; // This shouldn't happen due to ProtectedRoute, but just in case
  }

  // Type assertion to help TypeScript understand the full role type
  const userRole = user.role as 'admin' | 'hostel_director' | 'warden' | 'deputy_warden' | 'assistant_warden' | 'caretaker' | 'student' | 'case_manager' | 'investigator';

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'hostel_director':
      return <HostelDirectorDashboard />;
    case 'warden':
      return <WardenDashboard />;
    case 'deputy_warden':
    case 'assistant_warden':
      return <AssociateWardenDashboard />;
    case 'caretaker':
      return <CaretakerDashboard />;
    case 'case_manager':
      return <CaseManagerDashboard />;
    case 'investigator':
      return <InvestigatorDashboard />;
    default:
      // Fallback to general dashboard for any other roles
      return <DashboardPage />;
  }
}
