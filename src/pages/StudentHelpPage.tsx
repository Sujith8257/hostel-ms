import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  User, 
  Bed, 
  CreditCard, 
  Calendar, 
  Bell, 
  FileText, 
  HelpCircle, 
  LogOut, 
  Phone, 
  Mail, 
  MessageCircle, 
  BookOpen, 
  Shield, 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  ExternalLink 
} from 'lucide-react';

const StudentHelpPage: React.FC = () => {
  const { profile, logout } = useAuth();

  const handleLogout = async () => {
    console.log('[StudentHelpPage] Logout button clicked');
    try {
      await logout();
      // Navigation is now handled by the AuthContext logout function
    } catch (error) {
      console.error('[StudentHelpPage] Logout failed:', error);
    }
  };

  const helpCategories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      items: [
        { title: 'How to access your dashboard', description: 'Learn how to navigate your student dashboard' },
        { title: 'Understanding your profile', description: 'Complete your profile information' },
        { title: 'Room assignment process', description: 'How rooms are assigned and managed' },
        { title: 'Payment procedures', description: 'Understanding fee structure and payment methods' }
      ]
    },
    {
      title: 'Account & Profile',
      icon: User,
      items: [
        { title: 'Update personal information', description: 'Change your contact details and preferences' },
        { title: 'Change password', description: 'Secure your account with a new password' },
        { title: 'Profile verification', description: 'Complete your profile verification process' },
        { title: 'Account settings', description: 'Manage your account preferences' }
      ]
    },
    {
      title: 'Room & Facilities',
      icon: Bed,
      items: [
        { title: 'Room amenities', description: 'What amenities are available in your room' },
        { title: 'Maintenance requests', description: 'How to report room maintenance issues' },
        { title: 'Room change requests', description: 'Process for requesting room changes' },
        { title: 'Facility usage', description: 'How to use common facilities' }
      ]
    },
    {
      title: 'Payments & Fees',
      icon: CreditCard,
      items: [
        { title: 'Fee structure', description: 'Understanding your fee breakdown' },
        { title: 'Payment methods', description: 'Available payment options' },
        { title: 'Payment history', description: 'View your payment records' },
        { title: 'Late fees', description: 'Understanding late payment charges' }
      ]
    },
    {
      title: 'Attendance & Records',
      icon: Calendar,
      items: [
        { title: 'Attendance tracking', description: 'How attendance is recorded' },
        { title: 'Leave applications', description: 'Process for applying for leave' },
        { title: 'Academic records', description: 'Access your academic information' },
        { title: 'Disciplinary records', description: 'Understanding disciplinary actions' }
      ]
    },
    {
      title: 'Support & Contact',
      icon: HelpCircle,
      items: [
        { title: 'Contact information', description: 'How to reach hostel administration' },
        { title: 'Emergency contacts', description: 'Important emergency numbers' },
        { title: 'Technical support', description: 'Get help with technical issues' },
        { title: 'Feedback & suggestions', description: 'Share your feedback with us' }
      ]
    }
  ];

  const quickActions = [
    { title: 'Update Profile', icon: User, href: '/student-profile' },
    { title: 'View Room Details', icon: Bed, href: '/student-room' },
    { title: 'Check Payments', icon: CreditCard, href: '/student-payments' },
    { title: 'View Attendance', icon: Calendar, href: '/student-attendance' }
  ];

  const contactInfo = [
    { type: 'Phone', value: '+1 (555) 123-4567', icon: Phone },
    { type: 'Email', value: 'support@hostel.com', icon: Mail },
    { type: 'Live Chat', value: 'Available 24/7', icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-primary rounded-lg">
                <HelpCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Portal</h1>
                <p className="text-sm text-muted-foreground">Hostel Management System</p>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Student Menu
              </h3>
              <nav className="space-y-2">
                <Link
                  to="/student"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/student-profile"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/student-room"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Bed className="h-4 w-4" />
                  <span>Room Details</span>
                </Link>
                <Link
                  to="/student-payments"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Payments</span>
                </Link>
                <Link
                  to="/student-attendance"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Attendance</span>
                </Link>
                <Link
                  to="/student-notifications"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </Link>
                <Link
                  to="/student-documents"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </Link>
                <Link
                  to="/student-help"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to={action.href}>
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.title}
                    </Link>
                  </Button>
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
                  <p className="text-sm font-medium">{profile?.full_name || 'Student'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email?.split('@')[0] || 'SU'}</p>
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
                <h1 className="text-2xl font-bold">Help & Support</h1>
                <p className="text-muted-foreground">Get help and support for your hostel management needs</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Student</Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Online
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Help Content */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
                      Welcome to Help & Support
                    </CardTitle>
                    <CardDescription>
                      Find answers to common questions and get the help you need
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {contactInfo.map((contact) => (
                        <div key={contact.type} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                          <contact.icon className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{contact.type}</p>
                            <p className="text-sm text-gray-600">{contact.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Help Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {helpCategories.map((category) => (
                  <Card key={category.title}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <category.icon className="w-5 h-5 mr-2 text-blue-600" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <div key={item.title} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Support */}
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-6 h-6 mr-2 text-green-600" />
                      Additional Support
                    </CardTitle>
                    <CardDescription>
                      Need more help? We're here to assist you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Emergency Support</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-600">24/7 Emergency Hotline: +1 (555) 911-0000</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-600">Response Time: Within 15 minutes</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">General Support</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">Support Team: Available 9 AM - 6 PM</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">Live Chat: Available 24/7</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHelpPage;