import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Building2, 
  Users,
  Bed, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Eye,
  Clock,
  LogOut,
  Wrench,
  FileText,
  Shield,
  Settings,
  UserPlus,
  BarChart3,
  HelpCircle,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function RoomManagementPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for dialogs
  const [assignStudentOpen, setAssignStudentOpen] = useState(false);
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  // Form states
  const [assignForm, setAssignForm] = useState({
    studentId: '',
    roomId: '',
    notes: ''
  });
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    building: '',
    floor: '',
    roomType: '',
    capacity: '',
    rent: '',
    description: ''
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    roomId: '',
    issue: '',
    priority: '',
    description: ''
  });

  // Mock data for room management
  const stats = {
    totalRooms: 156,
    occupiedRooms: 144,
    availableRooms: 12,
    maintenanceRooms: 3,
    occupancyRate: 92.3,
    totalCapacity: 624,
    currentOccupancy: 576
  };

  const roomTypes = [
    { type: '2-Sharing', count: 48, occupied: 45, available: 3, color: 'bg-blue-500' },
    { type: '4-Sharing', count: 78, occupied: 72, available: 6, color: 'bg-green-500' },
    { type: '5-Sharing', count: 30, occupied: 27, available: 3, color: 'bg-purple-500' }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'check_in',
      student: 'John Doe',
      room: 'A-101',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'check_out',
      student: 'Jane Smith',
      room: 'B-205',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'maintenance',
      room: 'C-301',
      time: '6 hours ago',
      status: 'in_progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Handler functions
  const handleAssignStudent = () => {
    if (!assignForm.studentId || !assignForm.roomId) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Here you would typically make an API call
    toast.success('Student assigned to room successfully');
    setAssignStudentOpen(false);
    setAssignForm({ studentId: '', roomId: '', notes: '' });
  };

  const handleAddRoom = () => {
    if (!roomForm.roomNumber || !roomForm.building || !roomForm.roomType) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Here you would typically make an API call
    toast.success('Room added successfully');
    setAddRoomOpen(false);
    setRoomForm({ roomNumber: '', building: '', floor: '', roomType: '', capacity: '', rent: '', description: '' });
  };

  const handleMaintenance = () => {
    if (!maintenanceForm.roomId || !maintenanceForm.issue) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Here you would typically make an API call
    toast.success('Maintenance request submitted successfully');
    setMaintenanceOpen(false);
    setMaintenanceForm({ roomId: '', issue: '', priority: '', description: '' });
  };

  const handleViewReports = () => {
    toast.info('Generating room management reports...');
    setReportsOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    // Navigation is now handled by the AuthContext logout function
  };

  // Navigation items (same as AdminDashboard)
  const navigationItems = [
    { name: 'Dashboard', icon: Activity, href: '/admin', current: false },
    { name: 'Students', icon: Users, href: '/students', current: false },
    { name: 'Entry/Exit Logs', icon: Clock, href: '/entries', current: false },
    { name: 'Security Alerts', icon: AlertTriangle, href: '/alerts', badge: 2, current: false },
    { name: 'Room Management', icon: Building2, href: '/rooms', current: true },
    { name: 'Security Monitor', icon: Eye, href: '/security', current: false },
    { name: 'Visitor Management', icon: UserPlus, href: '/visitors', current: false },
    { name: 'Reports', icon: BarChart3, href: '/reports', current: false },
  ];

  const adminItems = [
    { name: 'Staff Management', icon: Users, href: '/admin/staff' },
    { name: 'System Settings', icon: Settings, href: '/admin/settings' },
    { name: 'Access Control', icon: Shield, href: '/admin/access-control' },
    { name: 'Notifications', icon: AlertTriangle, href: '/admin/notifications' },
  ];

  const helpItems = [
    { name: 'Help & Support', icon: HelpCircle, href: '/help' },
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
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">HostelMS</h1>
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
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Administration */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Administration
              </h3>
              <nav className="space-y-2">
                {adminItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Help & Support */}
            <div className="mb-8">
              <nav className="space-y-2">
                {helpItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* User Info */}
            <div className="mt-auto pt-6 border-t border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
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
                <h1 className="text-2xl font-bold">Room Management</h1>
                <p className="text-muted-foreground">Manage hostel rooms, occupancy, and student assignments</p>
        </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Administrator</Badge>
                  <span className="text-sm text-muted-foreground">{user?.email?.split('@')[0] || 'AU4'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
      <div className="space-y-6">
              {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center"
        >

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    System Online
                  </Badge>
                  <Badge variant={stats.maintenanceRooms > 0 ? "destructive" : "secondary"}>
                    {stats.maintenanceRooms} Under Maintenance
                  </Badge>
          </div>
        </motion.div>

              {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRooms}</div>
                <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +2.5% from last month
                      </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.occupiedRooms}</div>
                <p className="text-xs text-muted-foreground">
                      {stats.occupancyRate}% occupancy rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
                    <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.availableRooms}</div>
                <p className="text-xs text-muted-foreground">
                      Ready for new students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.maintenanceRooms}</div>
                <p className="text-xs text-muted-foreground">
                      Under repair
                </p>
              </CardContent>
            </Card>
          </motion.div>

              {/* Tabs for different views */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="rooms">Room Details</TabsTrigger>
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Room Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
              <Card>
                <CardHeader>
                        <CardTitle>Room Type Distribution</CardTitle>
                        <CardDescription>Breakdown of rooms by type and occupancy</CardDescription>
                </CardHeader>
                <CardContent>
                        <div className="space-y-4">
                          {roomTypes.map((roomType) => (
                            <div key={roomType.type} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${roomType.color}`} />
                                  <span className="font-medium">{roomType.type}</span>
                      </div>
                                <div className="text-sm text-muted-foreground">
                                  {roomType.occupied}/{roomType.count} occupied
                    </div>
                    </div>
                              <Progress 
                                value={(roomType.occupied / roomType.count) * 100} 
                                className="h-2"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{roomType.available} available</span>
                                <span>{((roomType.occupied / roomType.count) * 100).toFixed(1)}% occupied</span>
                    </div>
                    </div>
                          ))}
                  </div>
                </CardContent>
              </Card>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
              <Card>
                <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common room management tasks</CardDescription>
                </CardHeader>
                <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          {/* Assign Student Dialog */}
                          <Dialog open={assignStudentOpen} onOpenChange={setAssignStudentOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                                <Users className="h-6 w-6" />
                                <span className="text-sm">Assign Student</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Assign Student to Room</DialogTitle>
                                <DialogDescription>
                                  Assign a student to an available room in the hostel.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="studentId">Student ID *</Label>
                                  <Input
                                    id="studentId"
                                    placeholder="Enter student ID"
                                    value={assignForm.studentId}
                                    onChange={(e) => setAssignForm({...assignForm, studentId: e.target.value})}
                                  />
                              </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="roomId">Room Number *</Label>
                                  <Select value={assignForm.roomId} onValueChange={(value) => setAssignForm({...assignForm, roomId: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="A-101">A-101 (2-Sharing)</SelectItem>
                                      <SelectItem value="A-102">A-102 (2-Sharing)</SelectItem>
                                      <SelectItem value="B-201">B-201 (4-Sharing)</SelectItem>
                                      <SelectItem value="B-202">B-202 (4-Sharing)</SelectItem>
                                      <SelectItem value="C-301">C-301 (5-Sharing)</SelectItem>
                                    </SelectContent>
                                  </Select>
                  </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Additional notes (optional)"
                                    value={assignForm.notes}
                                    onChange={(e) => setAssignForm({...assignForm, notes: e.target.value})}
                                  />
                    </div>
                  </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setAssignStudentOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAssignStudent}>
                                  Assign Student
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Add Room Dialog */}
                          <Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                                <Building2 className="h-6 w-6" />
                                <span className="text-sm">Add Room</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                                <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription>
                                  Add a new room to the hostel management system.
              </DialogDescription>
            </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="roomNumber">Room Number *</Label>
                <Input
                                      id="roomNumber"
                                      placeholder="e.g., A-101"
                                      value={roomForm.roomNumber}
                                      onChange={(e) => setRoomForm({...roomForm, roomNumber: e.target.value})}
                />
              </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="building">Building *</Label>
                                    <Select value={roomForm.building} onValueChange={(value) => setRoomForm({...roomForm, building: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                                        <SelectItem value="Building A">Building A</SelectItem>
                                        <SelectItem value="Building B">Building B</SelectItem>
                                        <SelectItem value="Building C">Building C</SelectItem>
                  </SelectContent>
                </Select>
                                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="floor">Floor</Label>
                  <Input
                                      id="floor"
                                      placeholder="Floor number"
                                      value={roomForm.floor}
                                      onChange={(e) => setRoomForm({...roomForm, floor: e.target.value})}
                  />
                </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="roomType">Room Type *</Label>
                                    <Select value={roomForm.roomType} onValueChange={(value) => setRoomForm({...roomForm, roomType: value})}>
                  <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                                        <SelectItem value="2_sharing">2-Sharing</SelectItem>
                                        <SelectItem value="4_sharing">4-Sharing</SelectItem>
                                        <SelectItem value="5_sharing">5-Sharing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="capacity">Capacity</Label>
                <Input
                                      id="capacity"
                                      placeholder="Number of beds"
                                      value={roomForm.capacity}
                                      onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                />
              </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="rent">Rent Amount</Label>
                                    <Input
                                      id="rent"
                                      placeholder="Monthly rent"
                                      value={roomForm.rent}
                                      onChange={(e) => setRoomForm({...roomForm, rent: e.target.value})}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                                    placeholder="Room description (optional)"
                                    value={roomForm.description}
                                    onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                />
              </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setAddRoomOpen(false)}>
                  Cancel
                </Button>
                                <Button onClick={handleAddRoom}>
                                  Add Room
                                </Button>
              </div>
          </DialogContent>
        </Dialog>

                          {/* Maintenance Dialog */}
                          <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                                <AlertTriangle className="h-6 w-6" />
                                <span className="text-sm">Maintenance</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                                <DialogTitle>Submit Maintenance Request</DialogTitle>
              <DialogDescription>
                                  Report a maintenance issue for a specific room.
              </DialogDescription>
            </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="maintenanceRoomId">Room Number *</Label>
                                  <Select value={maintenanceForm.roomId} onValueChange={(value) => setMaintenanceForm({...maintenanceForm, roomId: value})}>
                    <SelectTrigger>
                                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="A-101">A-101</SelectItem>
                                      <SelectItem value="A-102">A-102</SelectItem>
                                      <SelectItem value="B-201">B-201</SelectItem>
                                      <SelectItem value="B-202">B-202</SelectItem>
                                      <SelectItem value="C-301">C-301</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="issue">Issue Type *</Label>
                                  <Select value={maintenanceForm.issue} onValueChange={(value) => setMaintenanceForm({...maintenanceForm, issue: value})}>
                  <SelectTrigger>
                                      <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                                      <SelectItem value="plumbing">Plumbing</SelectItem>
                                      <SelectItem value="electrical">Electrical</SelectItem>
                                      <SelectItem value="furniture">Furniture</SelectItem>
                                      <SelectItem value="cleaning">Cleaning</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="priority">Priority</Label>
                                  <Select value={maintenanceForm.priority} onValueChange={(value) => setMaintenanceForm({...maintenanceForm, priority: value})}>
                  <SelectTrigger>
                                      <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="maintenanceDescription">Description</Label>
                <Textarea
                                    id="maintenanceDescription"
                                    placeholder="Describe the maintenance issue"
                                    value={maintenanceForm.description}
                                    onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                />
              </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setMaintenanceOpen(false)}>
                  Cancel
                </Button>
                                <Button onClick={handleMaintenance}>
                                  Submit Request
                                </Button>
              </div>
          </DialogContent>
        </Dialog>

                          {/* View Reports Dialog */}
                          <Dialog open={reportsOpen} onOpenChange={setReportsOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={handleViewReports}>
                                <Eye className="h-6 w-6" />
                                <span className="text-sm">View Reports</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                                <DialogTitle>Room Management Reports</DialogTitle>
              <DialogDescription>
                                  Generate and view various reports for room management.
              </DialogDescription>
            </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-3">
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <FileText className="h-5 w-5 text-blue-600" />
              <div>
                                        <p className="font-medium">Occupancy Report</p>
                                        <p className="text-sm text-muted-foreground">Current room occupancy status</p>
                  </div>
                          </div>
                                    <Button size="sm">Generate</Button>
                        </div>
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <TrendingUp className="h-5 w-5 text-green-600" />
                                      <div>
                                        <p className="font-medium">Revenue Report</p>
                                        <p className="text-sm text-muted-foreground">Monthly rent collection summary</p>
                </div>
              </div>
                                    <Button size="sm">Generate</Button>
                </div>
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Wrench className="h-5 w-5 text-orange-600" />
                <div>
                                        <p className="font-medium">Maintenance Report</p>
                                        <p className="text-sm text-muted-foreground">Pending and completed maintenance</p>
                </div>
              </div>
                                    <Button size="sm">Generate</Button>
              </div>
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Users className="h-5 w-5 text-purple-600" />
              <div>
                                        <p className="font-medium">Student Assignment Report</p>
                                        <p className="text-sm text-muted-foreground">Student room assignments and history</p>
              </div>
                                    </div>
                                    <Button size="sm">Generate</Button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button variant="outline" onClick={() => setReportsOpen(false)}>
                                  Close
                </Button>
              </div>
          </DialogContent>
        </Dialog>
      </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="rooms" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Room Details</CardTitle>
                      <CardDescription>Detailed view of all rooms and their status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p>Room details table will be implemented here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest room assignments and changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentActivity.length > 0 ? (
                          recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <div className={`p-1 rounded-full ${
                                activity.type === 'check_in' ? 'bg-green-100' : 
                                activity.type === 'check_out' ? 'bg-blue-100' : 'bg-yellow-100'
                              }`}>
                                {activity.type === 'check_in' ? 
                                  <Users className="h-4 w-4 text-green-600" /> :
                                  activity.type === 'check_out' ?
                                  <LogOut className="h-4 w-4 text-blue-600" /> :
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                }
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {activity.type === 'check_in' ? 'Student Check-in' :
                                   activity.type === 'check_out' ? 'Student Check-out' : 'Maintenance'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {activity.student && `${activity.student} - `}Room {activity.room}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(activity.status)}>
                                  {activity.status}
                                </Badge>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {activity.time}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p>No recent activity</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
