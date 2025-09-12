import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Bell, 
  LogOut, 
  Home,
  Building2,
  HelpCircle,
  CreditCard,
  FileText,
  GraduationCap,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Payment {
  id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  payment_method: string | null;
  transaction_id: string | null;
}

export function StudentPaymentsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);

  // Mock payments data - replace with actual API call
  useEffect(() => {
    console.log('[StudentPaymentsPage] Component mounted, setting up mock data');
    const mockPayments: Payment[] = [
      {
        id: '1',
        amount: 5000,
        due_date: '2024-01-15',
        paid_date: '2024-01-10',
        status: 'paid',
        description: 'Monthly Hostel Fee - January 2024',
        payment_method: 'UPI',
        transaction_id: 'TXN123456789'
      },
      {
        id: '2',
        amount: 5000,
        due_date: '2024-02-15',
        paid_date: null,
        status: 'pending',
        description: 'Monthly Hostel Fee - February 2024',
        payment_method: null,
        transaction_id: null
      },
      {
        id: '3',
        amount: 2000,
        due_date: '2024-01-20',
        paid_date: null,
        status: 'overdue',
        description: 'Mess Fee - January 2024',
        payment_method: null,
        transaction_id: null
      }
    ];

    console.log('[StudentPaymentsPage] Setting payments:', mockPayments);
    setPayments(mockPayments);
  }, []);

  const handleLogout = async () => {
    console.log('[StudentPaymentsPage] Logout button clicked');
    try {
      await logout();
      console.log('[StudentPaymentsPage] Logout successful, navigating to landing page');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[StudentPaymentsPage] Logout failed:', error);
      navigate('/', { replace: true });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'paid': { variant: 'default' as const, icon: CheckCircle, text: 'Paid' },
      'pending': { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
      'overdue': { variant: 'destructive' as const, icon: XCircle, text: 'Overdue' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Navigation items for students
  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/student', current: false },
    { name: 'My Profile', icon: User, href: '/student-profile', current: false },
    { name: 'Room Details', icon: Building2, href: '/student-room', current: false },
    { name: 'Payments', icon: CreditCard, href: '/student-payments', current: true },
    { name: 'Attendance', icon: Calendar, href: '/student-attendance', current: false },
  ];

  // Quick actions
  const quickActions = [
    { name: 'Mess Menu', icon: FileText, href: '/mess-menu' },
    { name: 'Complaints', icon: Bell, href: '/complaints' },
    { name: 'Help & Support', icon: HelpCircle, href: '/help' },
  ];

  console.log('[StudentPaymentsPage] Rendering, payments:', payments);

  if (!payments.length) {
    console.log('[StudentPaymentsPage] No payments, showing loading state');
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-card border-r border-border">
            <div className="p-6">
              {/* Logo */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-primary rounded-lg">
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Student Portal</h1>
                  <p className="text-sm text-muted-foreground">Hostel Management System</p>
                </div>
              </div>

              {/* Main Navigation */}
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Main Navigation
                </h3>
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.current
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      to={action.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <action.icon className="h-4 w-4" />
                      <span>{action.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Info */}
              <div className="mt-auto pt-6 border-t border-border">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name || 'Student'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email?.split('@')[0] || 'SU'}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-2">Loading payments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('[StudentPaymentsPage] Rendering main content with payments');

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Portal</h1>
                <p className="text-sm text-muted-foreground">Hostel Management System</p>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Main Navigation
              </h3>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name || 'Student'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email?.split('@')[0] || 'SU'}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Payments</h1>
                <p className="text-muted-foreground">Manage your hostel and mess payments</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Student</Badge>
                  <span className="text-sm text-muted-foreground">{user?.email?.split('@')[0] || 'SU'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Content */}
          <div className="p-6">
            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Paid</p>
                      <p className="text-2xl font-bold">{payments.filter(p => p.status === 'paid').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{payments.filter(p => p.status === 'pending').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                      <p className="text-2xl font-bold">{payments.filter(p => p.status === 'overdue').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  View all your payment transactions and pending dues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => {
                    const statusInfo = getStatusBadge(payment.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-muted rounded-lg">
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">{payment.description}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Due: {formatDate(payment.due_date)}</span>
                              {payment.paid_date && (
                                <span>Paid: {formatDate(payment.paid_date)}</span>
                              )}
                              {payment.payment_method && (
                                <span>Method: {payment.payment_method}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                            <Badge variant={statusInfo.variant} className="mt-1">
                              {statusInfo.text}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            {payment.status !== 'paid' && (
                              <Button size="sm">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay Now
                              </Button>
                            )}
                            {payment.status === 'paid' && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
