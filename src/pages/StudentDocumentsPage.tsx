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
  Upload,
  File,
  FileImage,
  FileType,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Document {
  id: string;
  name: string;
  type: 'form' | 'menu' | 'policy' | 'certificate' | 'receipt' | 'other';
  category: 'hostel' | 'mess' | 'academic' | 'administrative';
  status: 'available' | 'pending' | 'expired' | 'draft';
  file_size: string;
  last_updated: string;
  download_count: number;
  description: string;
  is_required: boolean;
  expires_at?: string;
}

export function StudentDocumentsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);

  // Mock documents data - replace with actual API call
  useEffect(() => {
    console.log('[StudentDocumentsPage] Component mounted, setting up mock data');
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Hostel Joining Form',
        type: 'form',
        category: 'hostel',
        status: 'available',
        file_size: '2.3 MB',
        last_updated: '2024-01-15T10:00:00Z',
        download_count: 45,
        description: 'Official hostel joining form for new residents',
        is_required: true
      },
      {
        id: '2',
        name: 'Mess Menu - January 2024',
        type: 'menu',
        category: 'mess',
        status: 'available',
        file_size: '1.8 MB',
        last_updated: '2024-01-01T09:00:00Z',
        download_count: 120,
        description: 'Complete mess menu for January 2024 with all meal options',
        is_required: false
      },
      {
        id: '3',
        name: 'Hostel Rules & Regulations',
        type: 'policy',
        category: 'hostel',
        status: 'available',
        file_size: '3.1 MB',
        last_updated: '2024-01-10T14:30:00Z',
        download_count: 89,
        description: 'Complete hostel rules and regulations handbook',
        is_required: true
      },
      {
        id: '4',
        name: 'Mess Fee Receipt - January 2024',
        type: 'receipt',
        category: 'mess',
        status: 'available',
        file_size: '0.5 MB',
        last_updated: '2024-01-12T16:45:00Z',
        download_count: 1,
        description: 'Payment receipt for January 2024 mess fees',
        is_required: false
      },
      {
        id: '5',
        name: 'Hostel Identity Card Application',
        type: 'form',
        category: 'hostel',
        status: 'pending',
        file_size: '1.2 MB',
        last_updated: '2024-01-18T11:20:00Z',
        download_count: 0,
        description: 'Application form for hostel identity card',
        is_required: true
      },
      {
        id: '6',
        name: 'Mess Menu - February 2024',
        type: 'menu',
        category: 'mess',
        status: 'draft',
        file_size: '1.9 MB',
        last_updated: '2024-01-20T08:15:00Z',
        download_count: 0,
        description: 'Draft mess menu for February 2024 (coming soon)',
        is_required: false,
        expires_at: '2024-02-01T00:00:00Z'
      },
      {
        id: '7',
        name: 'Academic Transcript Request Form',
        type: 'form',
        category: 'academic',
        status: 'available',
        file_size: '0.8 MB',
        last_updated: '2024-01-05T13:00:00Z',
        download_count: 23,
        description: 'Form to request official academic transcripts',
        is_required: false
      },
      {
        id: '8',
        name: 'Hostel Maintenance Report',
        type: 'other',
        category: 'administrative',
        status: 'expired',
        file_size: '4.2 MB',
        last_updated: '2023-12-15T10:30:00Z',
        download_count: 12,
        description: 'Monthly hostel maintenance report (expired)',
        is_required: false,
        expires_at: '2024-01-01T00:00:00Z'
      }
    ];

    console.log('[StudentDocumentsPage] Setting documents:', mockDocuments);
    setDocuments(mockDocuments);
  }, []);

  const handleLogout = async () => {
    console.log('[StudentDocumentsPage] Logout button clicked');
    try {
      await logout();
      // Navigation is now handled by the AuthContext logout function
    } catch (error) {
      console.error('[StudentDocumentsPage] Logout failed:', error);
    }
  };

  const getFileIcon = (type: string) => {
    const iconMap = {
      'form': FileType,
      'menu': FileImage,
      'policy': FileText,
      'certificate': FileText,
      'receipt': FileText,
      'other': File
    };
    return iconMap[type as keyof typeof iconMap] || File;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'available': { variant: 'default' as const, icon: CheckCircle, text: 'Available', color: 'text-green-600' },
      'pending': { variant: 'secondary' as const, icon: Clock, text: 'Pending', color: 'text-yellow-600' },
      'expired': { variant: 'destructive' as const, icon: AlertCircle, text: 'Expired', color: 'text-red-600' },
      'draft': { variant: 'outline' as const, icon: FileText, text: 'Draft', color: 'text-gray-600' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      'hostel': 'bg-blue-100 text-blue-800',
      'mess': 'bg-green-100 text-green-800',
      'academic': 'bg-purple-100 text-purple-800',
      'administrative': 'bg-gray-100 text-gray-800'
    };
    return colorMap[category as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (documentId: string) => {
    // Mock download functionality
    console.log(`Downloading document ${documentId}`);
    // In real implementation, this would trigger actual file download
  };

  const handleUpload = () => {
    // Mock upload functionality
    console.log('Opening file upload dialog');
    // In real implementation, this would open file upload dialog
  };

  // Navigation items for students
  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/student', current: false },
    { name: 'My Profile', icon: User, href: '/student-profile', current: false },
    { name: 'Room Details', icon: Building2, href: '/student-room', current: false },
    { name: 'Payments', icon: CreditCard, href: '/student-payments', current: false },
    { name: 'Attendance', icon: Calendar, href: '/student-attendance', current: false },
    { name: 'Notifications', icon: Bell, href: '/student-notifications', badge: 3, current: false },
    { name: 'Documents', icon: FileText, href: '/student-documents', current: true },
    { name: 'Help & Support', icon: HelpCircle, href: '/student-help', current: false },  
  ];

  const availableCount = documents.filter(d => d.status === 'available').length;
  const requiredCount = documents.filter(d => d.is_required).length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;

  console.log('[StudentDocumentsPage] Rendering, documents:', documents);

  if (!documents.length) {
    console.log('[StudentDocumentsPage] No documents, showing loading state');
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
                  Student Menu
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
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
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
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Mess Menu
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Request Document
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
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
              <p className="ml-2">Loading documents...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('[StudentDocumentsPage] Rendering main content with documents');

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
                Student Menu
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
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
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
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Mess Menu
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Document
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
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
                <h1 className="text-2xl font-bold">Documents</h1>
                <p className="text-muted-foreground">Access hostel forms, menus, policies, and important documents</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Student</Badge>
                  <span className="text-sm text-muted-foreground">{user?.email?.split('@')[0] || 'SU'}</span>
                </div>
                <Button onClick={handleUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </div>
          </div>

          {/* Documents Content */}
          <div className="p-6">
            {/* Document Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Available</p>
                      <p className="text-2xl font-bold">{availableCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Required</p>
                      <p className="text-2xl font-bold">{requiredCount}</p>
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
                      <p className="text-2xl font-bold">{pendingCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>
                  Browse and download hostel-related documents, forms, and resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((document) => {
                    const FileIcon = getFileIcon(document.type);
                    const statusInfo = getStatusBadge(document.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-muted rounded-lg">
                            <FileIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{document.name}</h4>
                              {document.is_required && (
                                <Badge variant="outline" className="text-red-600 border-red-200">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{document.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Updated: {formatDate(document.last_updated)}</span>
                              <span>Size: {document.file_size}</span>
                              <span>Downloads: {document.download_count}</span>
                              <Badge className={getCategoryColor(document.category)}>
                                {document.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge variant={statusInfo.variant} className="mb-2">
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.text}
                            </Badge>
                            {document.expires_at && (
                              <p className="text-xs text-muted-foreground">
                                Expires: {formatDate(document.expires_at)}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            {document.status === 'available' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleDownload(document.id)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
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
