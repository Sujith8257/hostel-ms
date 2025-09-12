import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  AlertTriangle,
  Users,
  Settings,
  HelpCircle,
  Shield,
  Search,
  Activity,
  Database,
  BarChart3,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  title: string;
  icon: any;
  href: string;
  badge?: string;
  roles?: string[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    title: 'Students',
    icon: Users,
    href: '/students',
    roles: ['admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden', 'floor_incharge'],
  },
  {
    title: 'Entry/Exit Logs',
    icon: Activity,
    href: '/entries',
    roles: ['admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden'],
  },
  {
    title: 'Security Alerts',
    icon: AlertTriangle,
    href: '/alerts',
    badge: '2',
  },
  {
    title: 'Room Management',
    icon: Building2,
    href: '/rooms',
    roles: ['admin', 'hostel_director', 'warden', 'deputy_warden'],
  },
  {
    title: 'Security Monitor',
    icon: Shield,
    href: '/security',
    roles: ['admin', 'hostel_director', 'warden', 'deputy_warden'],
  },
  {
    title: 'Visitor Management',
    icon: Search,
    href: '/visitors',
    roles: ['admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden'],
  },
  {
    title: 'Reports',
    icon: BarChart3,
    href: '/reports',
    roles: ['admin', 'hostel_director', 'warden'],
  },
];

const adminNavigation: NavItem[] = [
  {
    title: 'Staff Management',
    icon: Users,
    href: '/admin/staff',
    roles: ['admin', 'hostel_director'],
  },
  {
    title: 'System Settings',
    icon: Settings,
    href: '/admin/settings',
    roles: ['admin', 'hostel_director'],
  },
  {
    title: 'Access Control',
    icon: Activity,
    href: '/admin/access-control',
    roles: ['admin', 'hostel_director'],
  },
  {
    title: 'Notifications',
    icon: Database,
    href: '/admin/notifications',
    roles: ['admin', 'hostel_director'],
  },
];

function SidebarNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { state } = useSidebar();

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  const filteredAdminNavigation = adminNavigation.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      admin: 'Administrator',
      hostel_director: 'Hostel Director',
      warden: 'Warden',
      deputy_warden: 'Deputy Warden',
      assistant_warden: 'Assistant Warden',
      floor_incharge: 'Floor Incharge'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                {state === "expanded" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-0.5 leading-none"
                  >
                    <span className="font-semibold">HostelMS</span>
                    <span className="text-xs text-muted-foreground">Hostel Management System</span>
                  </motion.div>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <NavLink to={item.href} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredAdminNavigation.length > 0 && (
          <>
            <Separator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredAdminNavigation.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.href}
                      >
                        <NavLink to={item.href} className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <Separator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/help" className="flex items-center gap-2">
                    <HelpCircle className="size-4" />
                    <span>Help & Support</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {state === "expanded" && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-2 text-xs text-muted-foreground"
          >
            <div className="font-medium">{user.name}</div>
            <div>{getRoleDisplayName(user.role)}</div>
          </motion.div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function AppSidebar() {
  return <SidebarNav />;
}
