import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { roomApi, adminApi } from '@/api/client';
import {
  Home,
  Users,
  PlusCircle,
  Search,
  Edit3,
  UserPlus,
  LogOut,
  ArrowRightLeft,
  Clock,
  Building,
  Bed,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Room {
  id: string;
  room_number: string;
  building_id: string;
  floor_number: number;
  room_type: 'single' | 'double' | 'triple' | 'dormitory';
  capacity: number;
  current_occupancy: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  rent_amount: number;
  amenities: string[];
  description?: string;
  building: {
    name: string;
    address: string;
  };
}

interface Student {
  id: string;
  register_number: string;
  full_name: string;
  email: string;
  phone: string;
  hostel_status: 'resident' | 'day_scholar' | 'former_resident';
}

interface RoomAllotment {
  id: string;
  student: Student;
  room: Room & { building: { name: string } };
  allotment_date: string;
  status: 'active' | 'vacated' | 'transferred';
  notes?: string;
  allotter: {
    full_name: string;
  };
}

interface Building {
  id: string;
  name: string;
  address: string;
  total_floors: number;
  total_rooms: number;
  capacity: number;
}

interface WaitingListEntry {
  id: string;
  student: Student;
  preferred_building?: {
    name: string;
    address: string;
  };
  preferred_room_type?: string;
  preferred_floor?: number;
  priority_score: number;
  request_date: string;
  status: 'waiting' | 'allotted' | 'cancelled';
  notes?: string;
}

interface RoomStats {
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  maintenance_rooms: number;
  total_capacity: number;
  current_occupancy: number;
  occupancy_percentage: number;
}

export function RoomManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allotments, setAllotments] = useState<RoomAllotment[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roomStats, setRoomStats] = useState<RoomStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Dialog states
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showAllotRoom, setShowAllotRoom] = useState(false);
  const [showAddToWaitingList, setShowAddToWaitingList] = useState(false);
  const [showTransferRoom, setShowTransferRoom] = useState(false);
  const [selectedAllotment, setSelectedAllotment] = useState<RoomAllotment | null>(null);

  // Form states
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    building_id: '',
    floor_number: 1,
    room_type: 'double' as 'single' | 'double' | 'triple' | 'dormitory',
    capacity: 2,
    rent_amount: 0,
    amenities: [] as string[],
    description: ''
  });

  const [allotmentForm, setAllotmentForm] = useState({
    student_id: '',
    room_id: '',
    notes: ''
  });

  const [waitingListForm, setWaitingListForm] = useState({
    student_id: '',
    preferred_building_id: 'any',
    preferred_room_type: 'any',
    preferred_floor: 'any',
    priority_score: 0,
    notes: ''
  });

  const [transferForm, setTransferForm] = useState({
    new_room_id: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchRooms(),
          fetchAllotments(),
          fetchWaitingList(),
          fetchStudents(),
          fetchBuildings(),
          fetchRoomStats()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load room management data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchRooms = async () => {
    try {
      const result = await roomApi.getRooms();
      if (result.success && result.data) {
        setRooms(result.data as Room[]);
      } else {
        console.error('Failed to fetch rooms:', result.error);
        toast.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Error fetching rooms');
    }
  };

  const fetchAllotments = async () => {
    try {
      const result = await roomApi.getAllotments();
      if (result.success && result.data) {
        setAllotments(result.data as RoomAllotment[]);
      } else {
        console.error('Failed to fetch allotments:', result.error);
        toast.error('Failed to fetch allotments');
      }
    } catch (error) {
      console.error('Error fetching allotments:', error);
      toast.error('Error fetching allotments');
    }
  };

  const fetchWaitingList = async () => {
    try {
      const result = await roomApi.getWaitingList();
      if (result.success && result.data) {
        setWaitingList(result.data as WaitingListEntry[]);
      } else {
        console.error('Failed to fetch waiting list:', result.error);
        toast.error('Failed to fetch waiting list');
      }
    } catch (error) {
      console.error('Error fetching waiting list:', error);
      toast.error('Error fetching waiting list');
    }
  };

  const fetchStudents = async () => {
    try {
      const result = await adminApi.getStudents();
      if (result.success && result.data) {
        setStudents(result.data as Student[]);
      } else {
        console.error('Failed to fetch students:', result.error);
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error fetching students');
    }
  };

  const fetchBuildings = async () => {
    try {
      const result = await adminApi.getBuildings();
      if (result.success && result.data) {
        setBuildings(result.data as Building[]);
      } else {
        console.error('Failed to fetch buildings:', result.error);
        toast.error('Failed to fetch buildings');
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error('Error fetching buildings');
    }
  };

  const fetchRoomStats = async () => {
    try {
      const result = await roomApi.getRoomStats();
      if (result.success && result.data) {
        setRoomStats(result.data as RoomStats);
      } else {
        console.error('Failed to fetch room stats:', result.error);
        toast.error('Failed to fetch room stats');
      }
    } catch (error) {
      console.error('Error fetching room stats:', error);
      toast.error('Error fetching room stats');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Map form fields to API fields
      const roomData = {
        building_id: newRoom.building_id,
        room_number: newRoom.room_number,
        floor_number: newRoom.floor_number,
        room_type: newRoom.room_type,
        max_occupancy: newRoom.capacity,
        amenities: newRoom.amenities,
        monthly_rent: newRoom.rent_amount
      };
      
      const result = await roomApi.createRoom(roomData);
      
      if (result.success) {
        toast.success('Room created successfully');
        setShowCreateRoom(false);
        setNewRoom({
          room_number: '',
          building_id: '',
          floor_number: 1,
          room_type: 'double',
          capacity: 2,
          rent_amount: 0,
          amenities: [],
          description: ''
        });
        fetchRooms();
        fetchRoomStats();
      } else {
        toast.error(result.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    }
  };

  const handleAllotRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await roomApi.allotRoom(allotmentForm);
      
      if (result.success) {
        toast.success('Room allotted successfully');
        setShowAllotRoom(false);
        setAllotmentForm({ student_id: '', room_id: '', notes: '' });
        fetchAllotments();
        fetchRooms();
        fetchRoomStats();
      } else {
        toast.error(result.error || 'Failed to allot room');
      }
    } catch (error) {
      console.error('Error allotting room:', error);
      toast.error('Failed to allot room');
    }
  };

  const handleVacateRoom = async (allotmentId: string) => {
    try {
      const result = await roomApi.vacateRoom(allotmentId, { notes: 'Room vacated by admin' });
      
      if (result.success) {
        toast.success('Room vacated successfully');
        fetchAllotments();
        fetchRooms();
        fetchRoomStats();
      } else {
        toast.error(result.error || 'Failed to vacate room');
      }
    } catch (error) {
      console.error('Error vacating room:', error);
      toast.error('Failed to vacate room');
    }
  };

  const handleTransferRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllotment) return;

    try {
      const result = await roomApi.transferRoom(selectedAllotment.id, transferForm);
      
      if (result.success) {
        toast.success('Room transferred successfully');
        setShowTransferRoom(false);
        setTransferForm({ new_room_id: '', notes: '' });
        setSelectedAllotment(null);
        fetchAllotments();
        fetchRooms();
        fetchRoomStats();
      } else {
        toast.error(result.error || 'Failed to transfer room');
      }
    } catch (error) {
      console.error('Error transferring room:', error);
      toast.error('Failed to transfer room');
    }
  };

  const handleAddToWaitingList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert 'any' values to empty strings for the API
      const formData = {
        ...waitingListForm,
        preferred_building_id: waitingListForm.preferred_building_id === 'any' ? undefined : waitingListForm.preferred_building_id,
        preferred_room_type: waitingListForm.preferred_room_type === 'any' ? undefined : waitingListForm.preferred_room_type,
        preferred_floor: waitingListForm.preferred_floor === 'any' ? undefined : waitingListForm.preferred_floor
      };

      const result = await roomApi.addToWaitingList(formData);
      
      if (result.success) {
        toast.success('Student added to waiting list successfully');
        setShowAddToWaitingList(false);
        setWaitingListForm({
          student_id: '',
          preferred_building_id: 'any',
          preferred_room_type: 'any',
          preferred_floor: 'any',
          priority_score: 0,
          notes: ''
        });
        fetchWaitingList();
      } else {
        toast.error(result.error || 'Failed to add student to waiting list');
      }
    } catch (error) {
      console.error('Error adding to waiting list:', error);
      toast.error('Failed to add student to waiting list');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'single': return <Bed className="h-4 w-4" />;
      case 'double': return <Users className="h-4 w-4" />;
      case 'triple': return <Home className="h-4 w-4" />;
      case 'dormitory': return <Building className="h-4 w-4" />;
      default: return <Bed className="h-4 w-4" />;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = !selectedBuilding || selectedBuilding === 'all' || room.building_id === selectedBuilding;
    const matchesFloor = !selectedFloor || selectedFloor === 'all' || room.floor_number.toString() === selectedFloor;
    const matchesType = !selectedRoomType || selectedRoomType === 'all' || room.room_type === selectedRoomType;
    const matchesStatus = !selectedStatus || selectedStatus === 'all' || room.status === selectedStatus;

    return matchesSearch && matchesBuilding && matchesFloor && matchesType && matchesStatus;
  });

  const availableRooms = rooms.filter(room => 
    room.status === 'available' && room.current_occupancy < room.capacity
  );

  if (isLoading) {
    return (
      <Layout title="Room Management" breadcrumbs={[{ title: 'Room Management' }]}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Room Management" 
      breadcrumbs={[{ title: 'Room Management' }]}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Room Management System</h2>
              <p className="text-blue-100">
                Manage room allotments, track occupancy, and handle waiting lists
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowCreateRoom(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Room
              </Button>
              <Button 
                onClick={() => setShowAllotRoom(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Allot Room
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        {roomStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-4"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roomStats.total_rooms}</div>
                <p className="text-xs text-muted-foreground">
                  Capacity: {roomStats.total_capacity} students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roomStats.occupancy_percentage}%</div>
                <p className="text-xs text-muted-foreground">
                  {roomStats.current_occupancy} / {roomStats.total_capacity} students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{roomStats.available_rooms}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for allotment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{roomStats.maintenance_rooms}</div>
                <p className="text-xs text-muted-foreground">
                  Rooms under maintenance
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Room Overview</TabsTrigger>
              <TabsTrigger value="allotments">Active Allotments</TabsTrigger>
              <TabsTrigger value="waiting">Waiting List</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Room Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter Rooms</CardTitle>
                  <CardDescription>Filter and search through available rooms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="search">Search Rooms</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Room number or building name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="building">Building</Label>
                      <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Buildings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Buildings</SelectItem>
                          {buildings.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="floor">Floor</Label>
                      <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Floors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Floors</SelectItem>
                          {[1, 2, 3, 4, 5].map((floor) => (
                            <SelectItem key={floor} value={floor.toString()}>
                              Floor {floor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Room Type</Label>
                      <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                          <SelectItem value="triple">Triple</SelectItem>
                          <SelectItem value="dormitory">Dormitory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rooms Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Rooms ({filteredRooms.length})</CardTitle>
                  <CardDescription>Overview of all rooms and their current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room</TableHead>
                          <TableHead>Building</TableHead>
                          <TableHead>Floor</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Occupancy</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Rent</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRooms.map((room) => (
                          <TableRow key={room.id}>
                            <TableCell className="font-medium">{room.room_number}</TableCell>
                            <TableCell>{room.building.name}</TableCell>
                            <TableCell>{room.floor_number}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getRoomTypeIcon(room.room_type)}
                                <span className="capitalize">{room.room_type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {room.current_occupancy}/{room.capacity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(room.status)}>
                                {room.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {room.rent_amount}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                {room.status === 'available' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setAllotmentForm({ ...allotmentForm, room_id: room.id });
                                      setShowAllotRoom(true);
                                    }}
                                  >
                                    <UserPlus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Active Allotments Tab */}
            <TabsContent value="allotments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Room Allotments ({allotments.length})</CardTitle>
                  <CardDescription>Students currently allocated to rooms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Building</TableHead>
                          <TableHead>Allotment Date</TableHead>
                          <TableHead>Allotted By</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allotments.filter(a => a.status === 'active').map((allotment) => (
                          <TableRow key={allotment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{allotment.student.full_name}</p>
                                <p className="text-sm text-gray-500">{allotment.student.register_number}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{allotment.room.room_number}</TableCell>
                            <TableCell>{allotment.room.building.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(allotment.allotment_date).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{allotment.allotter.full_name}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAllotment(allotment);
                                    setShowTransferRoom(true);
                                  }}
                                >
                                  <ArrowRightLeft className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleVacateRoom(allotment.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <LogOut className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Waiting List Tab */}
            <TabsContent value="waiting" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Room Waiting List ({waitingList.length})</CardTitle>
                      <CardDescription>Students waiting for room allocation</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddToWaitingList(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add to Waiting List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Preferred Building</TableHead>
                          <TableHead>Preferred Type</TableHead>
                          <TableHead>Priority Score</TableHead>
                          <TableHead>Request Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {waitingList.filter(w => w.status === 'waiting').map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{entry.student.full_name}</p>
                                <p className="text-sm text-gray-500">{entry.student.register_number}</p>
                              </div>
                            </TableCell>
                            <TableCell>{entry.preferred_building?.name || 'Any'}</TableCell>
                            <TableCell className="capitalize">
                              {entry.preferred_room_type || 'Any'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{entry.priority_score}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(entry.request_date).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <UserPlus className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600">
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Allotment History</CardTitle>
                  <CardDescription>Historical record of room allotments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allotments.filter(a => a.status !== 'active').map((allotment) => (
                          <TableRow key={allotment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{allotment.student.full_name}</p>
                                <p className="text-sm text-gray-500">{allotment.student.register_number}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{allotment.room.room_number}</TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">
                                {new Date(allotment.allotment_date).toLocaleDateString()}
                                {/* Add vacate date if available */}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={allotment.status === 'vacated' ? 'secondary' : 'outline'}>
                                {allotment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{allotment.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Create Room Dialog */}
        <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
              <DialogDescription>
                Add a new room to the hostel system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  value={newRoom.room_number}
                  onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="building_id">Building</Label>
                <Select 
                  value={newRoom.building_id} 
                  onValueChange={(value) => setNewRoom({ ...newRoom, building_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="floor_number">Floor</Label>
                  <Input
                    id="floor_number"
                    type="number"
                    min="1"
                    value={newRoom.floor_number}
                    onChange={(e) => setNewRoom({ ...newRoom, floor_number: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="room_type">Room Type</Label>
                <Select 
                  value={newRoom.room_type} 
                  onValueChange={(value: 'single' | 'double' | 'triple' | 'dormitory') => setNewRoom({ ...newRoom, room_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="triple">Triple</SelectItem>
                    <SelectItem value="dormitory">Dormitory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rent_amount">Rent Amount</Label>
                <Input
                  id="rent_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newRoom.rent_amount}
                  onChange={(e) => setNewRoom({ ...newRoom, rent_amount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateRoom(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Room</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Allot Room Dialog */}
        <Dialog open={showAllotRoom} onOpenChange={setShowAllotRoom}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Allot Room to Student</DialogTitle>
              <DialogDescription>
                Assign a room to a student
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAllotRoom} className="space-y-4">
              <div>
                <Label htmlFor="student_id">Student</Label>
                <Select 
                  value={allotmentForm.student_id} 
                  onValueChange={(value) => setAllotmentForm({ ...allotmentForm, student_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.filter(s => s.hostel_status === 'day_scholar').map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.register_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="room_id">Available Room</Label>
                <Select 
                  value={allotmentForm.room_id} 
                  onValueChange={(value) => setAllotmentForm({ ...allotmentForm, room_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.room_number} - {room.building.name} (Floor {room.floor_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={allotmentForm.notes}
                  onChange={(e) => setAllotmentForm({ ...allotmentForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAllotRoom(false)}>
                  Cancel
                </Button>
                <Button type="submit">Allot Room</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Transfer Room Dialog */}
        <Dialog open={showTransferRoom} onOpenChange={setShowTransferRoom}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Transfer Student</DialogTitle>
              <DialogDescription>
                Transfer {selectedAllotment?.student.full_name} to a new room
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTransferRoom} className="space-y-4">
              <div>
                <Label htmlFor="new_room_id">New Room</Label>
                <Select 
                  value={transferForm.new_room_id} 
                  onValueChange={(value) => setTransferForm({ ...transferForm, new_room_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.room_number} - {room.building.name} (Floor {room.floor_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transfer_notes">Transfer Notes</Label>
                <Textarea
                  id="transfer_notes"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowTransferRoom(false)}>
                  Cancel
                </Button>
                <Button type="submit">Transfer Room</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add to Waiting List Dialog */}
        <Dialog open={showAddToWaitingList} onOpenChange={setShowAddToWaitingList}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add to Waiting List</DialogTitle>
              <DialogDescription>
                Add a student to the room waiting list
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddToWaitingList} className="space-y-4">
              <div>
                <Label htmlFor="waiting_student_id">Student</Label>
                <Select 
                  value={waitingListForm.student_id} 
                  onValueChange={(value) => setWaitingListForm({ ...waitingListForm, student_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.filter(s => s.hostel_status === 'day_scholar').map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.register_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferred_building_id">Preferred Building</Label>
                  <Select 
                    value={waitingListForm.preferred_building_id} 
                    onValueChange={(value) => setWaitingListForm({ ...waitingListForm, preferred_building_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any building" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Building</SelectItem>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preferred_room_type">Preferred Type</Label>
                  <Select 
                    value={waitingListForm.preferred_room_type} 
                    onValueChange={(value) => setWaitingListForm({ ...waitingListForm, preferred_room_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="triple">Triple</SelectItem>
                      <SelectItem value="dormitory">Dormitory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="priority_score">Priority Score (0-100)</Label>
                <Input
                  id="priority_score"
                  type="number"
                  min="0"
                  max="100"
                  value={waitingListForm.priority_score}
                  onChange={(e) => setWaitingListForm({ ...waitingListForm, priority_score: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="waiting_notes">Notes</Label>
                <Textarea
                  id="waiting_notes"
                  value={waitingListForm.notes}
                  onChange={(e) => setWaitingListForm({ ...waitingListForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddToWaitingList(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add to Waiting List</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}