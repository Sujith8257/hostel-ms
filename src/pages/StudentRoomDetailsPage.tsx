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
  Users,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Bed,
  Lightbulb,
  Fan,
  Thermometer
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoomDetails {
  room_number: string;
  building: string;
  floor: number;
  capacity: number;
  occupied: number;
  monthly_rent: number;
  amenities: string[];
  room_type: 'single' | 'double' | 'triple' | 'quad';
  status: 'available' | 'occupied' | 'maintenance';
  description: string;
}

interface Roommate {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  year: number;
  profile_image_url: string | null;
}

export function StudentRoomDetailsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [roommates, setRoommates] = useState<Roommate[]>([]);

  // Mock room details data - replace with actual API call
  useEffect(() => {
    console.log('[StudentRoomDetailsPage] Component mounted, setting up mock data');
    const mockRoomDetails: RoomDetails = {
      room_number: 'A-101',
      building: 'Block A',
      floor: 1,
      capacity: 2,
      occupied: 2,
      monthly_rent: 5000,
      amenities: ['WiFi', 'AC', 'Furniture', 'Attached Bathroom', 'Study Table', 'Wardrobe'],
      room_type: 'double',
      status: 'occupied',
      description: 'Spacious double room with modern amenities and great ventilation.'
    };

    const mockRoommates: Roommate[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@university.edu',
        phone: '+1234567890',
        course: 'Computer Science',
        year: 3,
        profile_image_url: null
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@university.edu',
        phone: '+1234567891',
        course: 'Engineering',
        year: 2,
        profile_image_url: null
      }
    ];

    console.log('[StudentRoomDetailsPage] Setting room details:', mockRoomDetails);
    setRoomDetails(mockRoomDetails);
    setRoommates(mockRoommates);
  }, []);

  const handleLogout = async () => {
    console.log('[StudentRoomDetailsPage] Logout button clicked');
    try {
      await logout();
      console.log('[StudentRoomDetailsPage] Logout successful, navigating to landing page');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[StudentRoomDetailsPage] Logout failed:', error);
      navigate('/', { replace: true });
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'WiFi': Wifi,
      'AC': Thermometer,
      'Furniture': Bed,
      'Attached Bathroom': Bed,
      'Study Table': Bed,
      'Wardrobe': Bed,
      'Parking': Car,
      'Cafeteria': Coffee,
      'Mess': Utensils,
      'Lighting': Lightbulb,
      'Fan': Fan
    };
    return iconMap[amenity] || Bed;
  };

  const getRoomTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'single': 'bg-blue-100 text-blue-800',
      'double': 'bg-green-100 text-green-800',
      'triple': 'bg-yellow-100 text-yellow-800',
      'quad': 'bg-purple-100 text-purple-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  // Navigation items for students
  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: '/student', current: false },
    { name: 'My Profile', icon: User, href: '/student-profile', current: false },
    { name: 'Room Details', icon: Building2, href: '/student-room', current: true },
    { name: 'Payments', icon: CreditCard, href: '/student-payments', current: false },
    { name: 'Attendance', icon: Calendar, href: '/student-attendance', current: false },
  ];

  // Quick actions
  const quickActions = [
    { name: 'Mess Menu', icon: FileText, href: '/mess-menu' },
    { name: 'Complaints', icon: Bell, href: '/complaints' },
    { name: 'Help & Support', icon: HelpCircle, href: '/help' },
  ];

  console.log('[StudentRoomDetailsPage] Rendering, roomDetails:', roomDetails);

  if (!roomDetails) {
    console.log('[StudentRoomDetailsPage] No room details, showing loading state');
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
              <p className="ml-2">Loading room details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('[StudentRoomDetailsPage] Rendering main content with room details');

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
                <h1 className="text-2xl font-bold">Room Details</h1>
                <p className="text-muted-foreground">View your room information and amenities</p>
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

          {/* Room Details Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Room Overview */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Room {roomDetails.room_number}</span>
                    </CardTitle>
                    <CardDescription>
                      {roomDetails.building} - Floor {roomDetails.floor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Room Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoomTypeColor(roomDetails.room_type)}>
                          {roomDetails.room_type.charAt(0).toUpperCase() + roomDetails.room_type.slice(1)}
                        </Badge>
                        <Badge variant={roomDetails.status === 'occupied' ? 'default' : 'secondary'}>
                          {roomDetails.status.charAt(0).toUpperCase() + roomDetails.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₹{roomDetails.monthly_rent}</p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                    </div>

                    {/* Room Description */}
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{roomDetails.description}</p>
                    </div>

                    {/* Room Capacity */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{roomDetails.occupied}</p>
                        <p className="text-sm text-muted-foreground">Occupied</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Bed className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{roomDetails.capacity}</p>
                        <p className="text-sm text-muted-foreground">Total Capacity</p>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="font-semibold mb-4">Amenities</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {roomDetails.amenities.map((amenity) => {
                          const IconComponent = getAmenityIcon(amenity);
                          return (
                            <div key={amenity} className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                              <IconComponent className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{amenity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Roommates */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Roommates</span>
                    </CardTitle>
                    <CardDescription>
                      {roommates.length} of {roomDetails.capacity} occupants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {roommates.map((roommate) => (
                        <div key={roommate.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {roommate.profile_image_url ? (
                              <img
                                src={roommate.profile_image_url}
                                alt={roommate.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{roommate.name}</p>
                            <p className="text-xs text-muted-foreground">{roommate.course} - Year {roommate.year}</p>
                          </div>
                        </div>
                      ))}
                      
                      {roommates.length < roomDetails.capacity && (
                        <div className="text-center py-4 text-muted-foreground">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Vacant bed available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Request Maintenance
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Contact Warden
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
