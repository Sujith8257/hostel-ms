import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaceEmbeddingVisualization } from '@/components/FaceEmbeddingVisualization';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Home,
  Phone,
  Mail,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Bed,
  UserMinus,
  Scan,
  Shield,
  Settings,
  User,
  LogOut,
  BarChart3,
  HelpCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { studentService } from '@/lib/services';
import { roomApi, adminApi } from '@/api/client';
import type { DbStudent } from '@/types/database-models';
import { toast } from 'sonner';
import studentsCsvUrl from '/students.csv?url';

interface StudentFormData {
  register_number: string;
  full_name: string;
  email: string;
  phone: string;
  hostel_status: 'resident' | 'day_scholar' | 'former_resident';
  room_number: string;
  is_active: boolean;
}

interface Room {
  id: string;
  building_id: string;
  room_number: string;
  floor_number: number;
  room_type: string;
  max_occupancy: number;
  current_occupancy: number;
  is_occupied: boolean;
  monthly_rent?: number;
  amenities?: string[];
  building_name?: string;
}

interface Building {
  id: string;
  name: string;
  total_floors: number;
  total_rooms: number;
  address?: string;
}

interface StudentStats {
  total: number;
  active: number;
  residents: number;
  dayScholars: number;
  withRooms: number;
  withoutRooms: number;
  faceEnrolled: number;
  faceNotEnrolled: number;
}

// CSV parsing function
const parseCSVLine = (line: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

const loadStudentsFromCsv = async (): Promise<DbStudent[]> => {
  try {
    const response = await fetch(studentsCsvUrl);
    if (!response.ok) {
      throw new Error(`CSV fetch failed with status ${response.status}`);
    }
    
    const text = await response.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (lines.length <= 1) {
      return [];
    }
    
    // Parse header
    const header = parseCSVLine(lines[0]);
    const colIndex = (name: string) => header.indexOf(name);
    
    const students: DbStudent[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < header.length) {
        continue;
      }
      
      const student: DbStudent = {
        id: crypto.randomUUID(), // Generate ID since CSV doesn't have one
        register_number: cols[colIndex('Reg.No.')] || '',
        full_name: cols[colIndex('Name of the Student')] || '',
        email: cols[colIndex('Email ID')] || '',
        phone: '', // CSV doesn't have phone, will be empty
        hostel_status: 'resident', // Default to resident, can be updated later
        room_number: '', // CSV doesn't have room info, will be empty
        is_active: true, // Default to active
        face_embedding: null, // No face data in CSV
        profile_image_url: null, // No profile image in CSV
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      students.push(student);
    }
    
    return students;
  } catch (error) {
    console.error('Error loading students from CSV:', error);
    throw error;
  }
};

export function StudentsPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation is now handled by the AuthContext logout function
  };

  // Navigation items (same as AdminDashboard)
  const navigationItems = [
    { name: 'Dashboard', icon: Activity, href: '/admin', current: false },
    { name: 'Students', icon: Users, href: '/students', current: true },
    { name: 'Entry/Exit Logs', icon: Clock, href: '/entries', current: false },
    { name: 'Security Alerts', icon: AlertTriangle, href: '/alerts', badge: 2, current: false },
    { name: 'Room Management', icon: Building2, href: '/rooms', current: false },
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

  const [students, setStudents] = useState<DbStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<DbStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  
  // Room allocation states
  const [isRoomAllocationOpen, setIsRoomAllocationOpen] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DbStudent | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    active: 0,
    residents: 0,
    dayScholars: 0,
    withRooms: 0,
    withoutRooms: 0,
    faceEnrolled: 0,
    faceNotEnrolled: 0,
  });

  // Form states for add dialog
  const [formData, setFormData] = useState<StudentFormData>({
    register_number: '',
    full_name: '',
    email: '',
    phone: '',
    hostel_status: 'resident',
    room_number: '',
    is_active: true,
  });

  // Form states for edit dialog
  const [editFormData, setEditFormData] = useState<StudentFormData>({
    register_number: '',
    full_name: '',
    email: '',
    phone: '',
    hostel_status: 'resident',
    room_number: '',
    is_active: true,
  });

  const calculateStats = useCallback(() => {
    const total = students.length;
    const active = students.filter(s => s.is_active).length;
    const residents = students.filter(s => s.hostel_status === 'resident').length;
    const dayScholars = students.filter(s => s.hostel_status === 'day_scholar').length;
    const withRooms = students.filter(s => s.room_number).length;
    const withoutRooms = students.filter(s => !s.room_number).length;
    const faceEnrolled = students.filter(s => s.face_embedding).length;
    const faceNotEnrolled = students.filter(s => !s.face_embedding).length;

    setStats({
      total,
      active,
      residents,
      dayScholars,
      withRooms,
      withoutRooms,
      faceEnrolled,
      faceNotEnrolled,
    });
  }, [students]);

  const filterStudents = useCallback(() => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.full_name.toLowerCase().includes(term) ||
        student.register_number.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        student.phone?.includes(term) ||
        student.room_number?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'active':
          filtered = filtered.filter(student => student.is_active);
          break;
        case 'inactive':
          filtered = filtered.filter(student => !student.is_active);
          break;
        case 'residents':
          filtered = filtered.filter(student => student.hostel_status === 'resident');
          break;
        case 'day_scholars':
          filtered = filtered.filter(student => student.hostel_status === 'day_scholar');
          break;
        case 'with_rooms':
          filtered = filtered.filter(student => student.room_number);
          break;
        case 'without_rooms':
          filtered = filtered.filter(student => !student.room_number);
          break;
        case 'face_enrolled':
          filtered = filtered.filter(student => student.face_embedding);
          break;
        case 'face_not_enrolled':
          filtered = filtered.filter(student => !student.face_embedding);
          break;
      }
    }

    setFilteredStudents(filtered);
    
    // Calculate total pages based on filtered results
    const total = Math.ceil(filtered.length / pageSize);
    setTotalPages(total);
    
    // Reset to first page if current page is beyond total pages
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [students, searchTerm, statusFilter, pageSize, currentPage]);

  // Get paginated students
  const getPaginatedStudents = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage, pageSize]);

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter students when search term or filter changes
  useEffect(() => {
    filterStudents();
  }, [filterStudents]);

  // Calculate stats when students data changes
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load students from Supabase database first
      try {
        const studentsData = await studentService.getStudents();
        console.log(`Loaded ${studentsData.length} students from database`);
        setStudents(studentsData);
      } catch (dbError) {
        console.error('Database connection failed, falling back to CSV:', dbError);
        // Fallback to CSV if database fails
        const studentsData = await loadStudentsFromCsv();
        console.log(`Loaded ${studentsData.length} students from CSV`);
        setStudents(studentsData);
        toast.warning('Using CSV data - Database connection unavailable');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students data');
      toast.error('Failed to load students data');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAddForm = () => {
    setFormData({
      register_number: '',
      full_name: '',
      email: '',
      phone: '',
      hostel_status: 'resident',
      room_number: '',
      is_active: true,
    });
  };

  // Room allocation functions
  const loadBuildingsAndRooms = async () => {
    try {
      setIsLoadingRooms(true);
      console.log('Loading buildings and rooms...');
      
      // Try to load buildings - if this fails, we'll continue with a fallback
      try {
        console.log('Fetching buildings...');
        const buildingsResponse = await adminApi.getBuildings();
        console.log('Buildings response:', buildingsResponse);
        if (buildingsResponse.success && buildingsResponse.data) {
          setBuildings(buildingsResponse.data as Building[]);
          console.log('Buildings loaded:', buildingsResponse.data);
        } else {
          console.warn('Buildings API returned error:', buildingsResponse.error);
          // Set empty buildings array as fallback
          setBuildings([]);
        }
      } catch (buildingError) {
        console.warn('Buildings API failed, using fallback:', buildingError);
        setBuildings([]);
      }
      
      // Try to load available rooms - if this fails, we'll continue with a fallback
      try {
        console.log('Fetching available rooms...');
        const roomsResponse = await roomApi.getRooms({ is_occupied: false });
        console.log('Rooms response:', roomsResponse);
        if (roomsResponse.success && roomsResponse.data) {
          setAvailableRooms(roomsResponse.data as Room[]);
          console.log('Available rooms loaded:', roomsResponse.data);
        } else {
          console.warn('Rooms API returned error:', roomsResponse.error);
          // Set empty rooms array as fallback
          setAvailableRooms([]);
        }
      } catch (roomError) {
        console.warn('Rooms API failed, using fallback:', roomError);
        setAvailableRooms([]);
      }
      
    } catch (error) {
      console.error('General error loading buildings and rooms:', error);
      // Set fallback state
      setBuildings([]);
      setAvailableRooms([]);
    } finally {
      setIsLoadingRooms(false);
      console.log('Finished loading buildings and rooms');
    }
  };

  const openRoomAllocation = (student: DbStudent) => {
    setSelectedStudent(student);
    setIsRoomAllocationOpen(true);
    // Reset previous state
    setAvailableRooms([]);
    setBuildings([]);
    setSelectedRoom('');
    setSelectedBuilding('all');
    // Load data asynchronously
    loadBuildingsAndRooms();
  };

  const allocateRoom = async () => {
    if (!selectedStudent || !selectedRoom) {
      toast.error('Please select a room');
      return;
    }

    try {
      console.log('Allocating room:', selectedRoom, 'to student:', selectedStudent.id);
      
      // Check if selectedRoom is a room ID (from API) or a manual room number
      const isManualRoomNumber = availableRooms.length === 0 || !availableRooms.find(r => r.id === selectedRoom);
      
      if (isManualRoomNumber) {
        // Manual room assignment - directly update student
        console.log('Using manual room assignment');
        await studentService.updateStudent(selectedStudent.id, {
          room_number: selectedRoom
        });
        toast.success('Room allocated successfully (manual)');
      } else {
        // API-based room allocation
        console.log('Using API-based room allocation');
        const response = await roomApi.allotRoom({
          room_id: selectedRoom,
          student_id: selectedStudent.id,
          notes: `Room allocated from Students Page`
        });

        if (response.success) {
          // Update student's room number
          const selectedRoomData = availableRooms.find(r => r.id === selectedRoom);
          if (selectedRoomData) {
            await studentService.updateStudent(selectedStudent.id, {
              room_number: selectedRoomData.room_number
            });
          }
          toast.success('Room allocated successfully');
        } else {
          console.error('Room allocation API failed:', response.error);
          toast.error(response.error || 'Failed to allocate room');
          return;
        }
      }

      setIsRoomAllocationOpen(false);
      setSelectedRoom('');
      setSelectedBuilding('all');
      loadData(); // Refresh student data
    } catch (error) {
      console.error('Error allocating room:', error);
      toast.error('Failed to allocate room: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const deallocateRoom = async (student: DbStudent) => {
    if (!student.room_number) {
      toast.error('Student does not have a room assigned');
      return;
    }

    try {
      // Update student to remove room
      await studentService.updateStudent(student.id, {
        room_number: null
      });

      toast.success('Room deallocated successfully');
      loadData(); // Refresh student data
    } catch (error) {
      console.error('Error deallocating room:', error);
      toast.error('Failed to deallocate room');
    }
  };

  const onAddStudent = async () => {
    try {
      if (!formData.register_number || !formData.full_name) {
        toast.error('Register number and full name are required');
        return;
      }

      console.log('Adding student with data:', formData);
      
      // Check if register number already exists
      const existingStudents = students.filter(s => 
        s.register_number.toLowerCase() === formData.register_number.toLowerCase()
      );
      
      if (existingStudents.length > 0) {
        toast.error(`A student with register number "${formData.register_number}" already exists`);
        return;
      }
      
      const newStudent = await studentService.createStudent({
        register_number: formData.register_number,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        hostel_status: formData.hostel_status,
        room_number: formData.room_number || null,
        face_embedding: null,
        profile_image_url: null,
        is_active: formData.is_active,
      });

      console.log('Student created successfully:', newStudent);

      // Optionally update local state immediately
      setStudents(prev => [newStudent, ...prev]);
      
      // Reload data from database to ensure consistency
      await loadData();
      
      setIsAddDialogOpen(false);
      resetAddForm();
      toast.success('Student added successfully');
    } catch (error) {
      console.error('Error adding student:', error);
      
      // Check if error has expected properties
      const errorObj = error as { code?: string; message?: string; details?: string; hint?: string };
      
      console.error('Error details:', {
        message: errorObj?.message,
        code: errorObj?.code,
        details: errorObj?.details,
        hint: errorObj?.hint,
        error: error
      });
      
      // Provide better error messages based on error type
      let errorMessage = 'Failed to add student';
      if (errorObj?.code === '23505' || errorObj?.code === 'P2002') {
        // Unique constraint violation
        errorMessage = `A student with register number "${formData.register_number}" already exists. Please use a different register number.`;
      } else if (errorObj?.code === '42501' || errorObj?.message?.includes('permission denied')) {
        // Permission denied
        errorMessage = 'Permission denied. You may need to adjust Row Level Security (RLS) policies on the students table.';
      } else if (errorObj?.message) {
        errorMessage = errorObj.message;
      } else if (errorObj?.details) {
        errorMessage = errorObj.details;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const onEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      if (!editFormData.full_name) {
        toast.error('Full name is required');
        return;
      }

      const updatedStudent = await studentService.updateStudent(selectedStudent.id, {
        full_name: editFormData.full_name,
        email: editFormData.email || null,
        phone: editFormData.phone || null,
        hostel_status: editFormData.hostel_status,
        room_number: editFormData.room_number || null,
        is_active: editFormData.is_active,
      });

      setStudents(prev => 
        prev.map(student => 
          student.id === selectedStudent.id ? updatedStudent : student
        )
      );
      
      // Reload data from database to ensure consistency
      await loadData();
      
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      toast.success('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const onDeleteStudent = async (student: DbStudent) => {
    if (!confirm(`Are you sure you want to delete ${student.full_name}?`)) return;

    try {
      await studentService.deleteStudent(student.id);
      
      // Optionally update local state immediately
      setStudents(prev => prev.filter(s => s.id !== student.id));
      
      // Reload data from database to ensure consistency
      await loadData();
      
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusBadge = (student: DbStudent) => {
    if (!student.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    switch (student.hostel_status) {
      case 'resident':
        return <Badge className="bg-green-100 text-green-800">Resident</Badge>;
      case 'day_scholar':
        return <Badge className="bg-blue-100 text-blue-800">Day Scholar</Badge>;
      case 'former_resident':
        return <Badge variant="outline">Former Resident</Badge>;
      default:
        return <Badge variant="outline">{student.hostel_status}</Badge>;
    }
  };

  const openEditDialog = (student: DbStudent) => {
    setSelectedStudent(student);
    setEditFormData({
      register_number: student.register_number,
      full_name: student.full_name,
      email: student.email || '',
      phone: student.phone || '',
      hostel_status: student.hostel_status,
      room_number: student.room_number || '',
      is_active: student.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (student: DbStudent) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
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
                  <h1 className="text-2xl font-bold">Student Management</h1>
                  <p className="text-muted-foreground">Manage student registrations, room assignments, and access permissions</p>
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
        <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground mt-4">Loading students...</p>
                  <Button 
                    variant="outline" 
                    onClick={loadData} 
                    className="mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Refresh'}
                  </Button>
        </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                  <h1 className="text-2xl font-bold">Student Management</h1>
                  <p className="text-muted-foreground">Manage student registrations, room assignments, and access permissions</p>
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading students data: {error}</p>
            <Button onClick={loadData} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <p className="text-sm font-medium">Admin User 41542</p>
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
                <h1 className="text-2xl font-bold">Student Management</h1>
                <p className="text-muted-foreground">Manage student registrations, room assignments, and access permissions</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-muted rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary">Administrator</Badge>
                  <span className="text-sm text-muted-foreground">AU4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Enter the student's information to register them in the hostel management system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Register Number *</label>
                      <Input
                        placeholder="REG001"
                        value={formData.register_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, register_number: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Full Name *</label>
                      <Input
                        placeholder="John Doe"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Hostel Status</label>
                      <Select value={formData.hostel_status} onValueChange={(value: 'resident' | 'day_scholar' | 'former_resident') => 
                        setFormData(prev => ({ ...prev, hostel_status: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resident">Resident</SelectItem>
                          <SelectItem value="day_scholar">Day Scholar</SelectItem>
                          <SelectItem value="former_resident">Former Resident</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Room Number</label>
                      <Input
                        placeholder="A-101"
                        value={formData.room_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, room_number: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    resetAddForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={onAddStudent}>
                    Add Student
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Residents</CardTitle>
              <Building className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.residents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Day Scholars</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.dayScholars}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Rooms</CardTitle>
              <Bed className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.withRooms}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Without Rooms</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.withoutRooms}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Face Enrolled</CardTitle>
              <Scan className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.faceEnrolled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Face Not Set Up</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.faceNotEnrolled}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, register number, email, phone, or room..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                    <SelectItem value="residents">Residents</SelectItem>
                    <SelectItem value="day_scholars">Day Scholars</SelectItem>
                    <SelectItem value="with_rooms">With Rooms</SelectItem>
                    <SelectItem value="without_rooms">Without Rooms</SelectItem>
                    <SelectItem value="face_enrolled">Face Recognition Enrolled</SelectItem>
                    <SelectItem value="face_not_enrolled">Face Recognition Not Set Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Students ({filteredStudents.length})</CardTitle>
                  <CardDescription>
                    {filteredStudents.length === students.length 
                      ? 'All students in the system'
                      : `Filtered from ${students.length} total students`
                    }
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Info</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Face Recognition</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No students found</p>
                            {searchTerm || statusFilter !== 'all' ? (
                              <p className="text-sm">Try adjusting your search or filters</p>
                            ) : (
                              <p className="text-sm">Start by adding your first student</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      getPaginatedStudents().map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{student.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {student.register_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {student.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {student.email}
                                </div>
                              )}
                              {student.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {student.phone}
                                </div>
                              )}
                              {!student.email && !student.phone && (
                                <span className="text-muted-foreground">No contact info</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(student)}
                              {!student.is_active && (
                                <Badge variant="destructive" className="text-xs">Inactive</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {student.room_number ? (
                              <div className="flex items-center gap-1">
                                <Home className="h-4 w-4" />
                                {student.room_number}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {student.face_embedding ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Enrolled
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Not Set Up
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {new Date(student.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewDialog(student)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(student)}
                                title="Edit Student"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewDialog(student)}
                                className={student.face_embedding ? "text-green-600 hover:text-green-700" : "text-blue-600 hover:text-blue-700"}
                                title={student.face_embedding ? "View Face Recognition" : "Set Up Face Recognition"}
                              >
                                <Scan className="h-4 w-4" />
                              </Button>
                              {!student.room_number ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openRoomAllocation(student)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Allocate Room"
                                >
                                  <Home className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deallocateRoom(student)}
                                  className="text-orange-600 hover:text-orange-700"
                                  title="Deallocate Room"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteStudent(student)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete Student"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            
            {/* Pagination Controls */}
            {filteredStudents.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* View Student Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Student Details
              </DialogTitle>
              <DialogDescription>
                Complete information for {selectedStudent?.full_name}
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <Tabs defaultValue="info" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Basic Information</TabsTrigger>
                  <TabsTrigger value="face" className="flex items-center gap-2">
                    <Scan className="h-4 w-4" />
                    Face Recognition
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Register Number</label>
                      <p className="text-sm text-muted-foreground">{selectedStudent.register_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <p className="text-sm text-muted-foreground">{selectedStudent.full_name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-muted-foreground">{selectedStudent.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-sm text-muted-foreground">{selectedStudent.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Hostel Status</label>
                      <div className="mt-1">{getStatusBadge(selectedStudent)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Room Number</label>
                      <p className="text-sm text-muted-foreground">{selectedStudent.room_number || 'Not assigned'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <p className="text-sm text-muted-foreground">
                        {selectedStudent.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Joined Date</label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedStudent.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {selectedStudent.updated_at !== selectedStudent.created_at && (
                    <div>
                      <label className="text-sm font-medium">Last Updated</label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedStudent.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {/* Face Embedding Status */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Face Recognition Status</label>
                        <p className="text-sm text-muted-foreground">
                          {selectedStudent.face_embedding ? 'Enrolled' : 'Not enrolled'}
                        </p>
                      </div>
                      <Badge 
                        variant={selectedStudent.face_embedding ? "default" : "secondary"}
                        className={selectedStudent.face_embedding ? "bg-green-100 text-green-800" : ""}
                      >
                        {selectedStudent.face_embedding ? 'Face Data Available' : 'No Face Data'}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="face" className="space-y-4">
                  <FaceEmbeddingVisualization 
                    registerNumber={selectedStudent.register_number}
                    onEmbeddingGenerated={(data) => {
                      console.log('Face embedding generated:', data);
                      toast.success('Face embedding generated successfully!');
                    }}
                    onFaceRegistered={() => {
                      console.log('Face registered for student:', selectedStudent.register_number);
                      toast.success('Face recognition registered successfully!');
                      // Refresh student data to update face_embedding status
                      loadData();
                    }}
                  />
                  
                  {selectedStudent.face_embedding && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Face Recognition Enrolled
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        This student has face recognition data stored in the system. 
                        They can authenticate using facial recognition at entry points.
                      </p>
                    </div>
                  )}
                  
                  {!selectedStudent.face_embedding && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          Face Recognition Not Set Up
                        </span>
                      </div>
                      <p className="text-sm text-orange-700">
                        Upload a clear photo of the student's face to enable face recognition 
                        authentication for hostel entry and access control.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedStudent) openEditDialog(selectedStudent);
              }}>
                Edit Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update {selectedStudent?.full_name}'s information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Register Number</label>
                  <Input
                    value={editFormData.register_number}
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    placeholder="John Doe"
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    placeholder="+1234567890"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Hostel Status</label>
                  <Select value={editFormData.hostel_status} onValueChange={(value: 'resident' | 'day_scholar' | 'former_resident') => 
                    setEditFormData(prev => ({ ...prev, hostel_status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">Resident</SelectItem>
                      <SelectItem value="day_scholar">Day Scholar</SelectItem>
                      <SelectItem value="former_resident">Former Resident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Room Number</label>
                  <Input
                    placeholder="A-101"
                    value={editFormData.room_number}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, room_number: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <label className="text-sm font-medium">Active Student</label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onEditStudent}>
                Update Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Room Allocation Dialog */}
        <Dialog open={isRoomAllocationOpen} onOpenChange={setIsRoomAllocationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Allocate Room</DialogTitle>
              <DialogDescription>
                Assign a room to {selectedStudent?.full_name} (ID: {selectedStudent?.register_number})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {isLoadingRooms ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading available rooms...</p>
                </div>
              ) : (
                <>
                  {/* Building Filter */}
                  <div>
                    <label className="text-sm font-medium">Filter by Building (Optional)</label>
                    <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                      <SelectTrigger>
                        <SelectValue placeholder="All buildings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Buildings</SelectItem>
                        {buildings.map((building) => (
                          <SelectItem key={building.id} value={building.id}>
                            {building.name} ({building.total_rooms} rooms)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Room Selection */}
                  <div>
                    <label className="text-sm font-medium">Select Room *</label>
                    {availableRooms.length > 0 ? (
                      <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an available room" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRooms
                            .filter(room => selectedBuilding === 'all' || !selectedBuilding || room.building_id === selectedBuilding)
                            .map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{room.room_number}</span>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Floor {room.floor_number}</span>
                                    <span>•</span>
                                    <span>{room.room_type}</span>
                                    <span>•</span>
                                    <span>{room.current_occupancy}/{room.max_occupancy}</span>
                                    {room.building_name && (
                                      <>
                                        <span>•</span>
                                        <span>{room.building_name}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter room number manually (e.g., A-101)"
                          value={selectedRoom}
                          onChange={(e) => setSelectedRoom(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          No rooms loaded from API. Enter room number manually.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selected Room Details */}
                  {selectedRoom && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      {(() => {
                        const room = availableRooms.find(r => r.id === selectedRoom);
                        if (!room) return null;
                        return (
                          <div>
                            <h4 className="font-medium mb-2">Room Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Room Number:</span>
                                <span className="ml-2 font-medium">{room.room_number}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Floor:</span>
                                <span className="ml-2">{room.floor_number}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <span className="ml-2">{room.room_type}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Capacity:</span>
                                <span className="ml-2">{room.current_occupancy}/{room.max_occupancy}</span>
                              </div>
                              {room.monthly_rent && (
                                <div>
                                  <span className="text-muted-foreground">Monthly Rent:</span>
                                  <span className="ml-2">₹{room.monthly_rent}</span>
                                </div>
                              )}
                              {room.amenities && room.amenities.length > 0 && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Amenities:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {room.amenities.map((amenity) => (
                                      <Badge key={amenity} variant="secondary" className="text-xs">
                                        {amenity}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsRoomAllocationOpen(false);
                setSelectedRoom('');
                setSelectedBuilding('all');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={allocateRoom}
                disabled={!selectedRoom || isLoadingRooms}
              >
                Allocate Room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}