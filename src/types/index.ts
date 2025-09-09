export type UserRole = 'admin' | 'hostel_director' | 'warden' | 'deputy_warden' | 'assistant_warden' | 'caretaker' | 'student' | 'case_manager' | 'investigator';

export interface User {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  hostelName?: string;
  floorNumber?: number; // For floor incharges
  phoneNumber?: string;
  createdAt?: Date;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  register_number: string;
  full_name: string;
  email?: string;
  phone?: string;
  hostel_status: 'resident' | 'day_scholar' | 'former_resident';
  room_number?: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Legacy properties for compatibility
  name?: string;
  studentId?: string;
  phoneNumber?: string;
  floorNumber?: number;
  dateOfAdmission?: string;
  emergencyContact?: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
  photo?: string;
  isAuthorized?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UnauthorizedEntry {
  id: string;
  personName?: string;
  detectionTime: string;
  location: string;
  entryPoint: string;
  confidence: number;
  imageUrl: string;
  cameraId: string;
  status: 'new' | 'investigated' | 'resolved' | 'false_alarm';
  investigatedBy?: string;
  notes?: string;
  alertSentTo: string[];
}

export interface Alert {
  id: string;
  image_url: string;
  timestamp: string;
  confidence_score?: number;
  location: string;
  status: string;
  resolved_by?: string;
  resolved_at?: string;
  notes?: string;
  created_at: string;
}

export interface EntryLog {
  id: string;
  student_id?: string;
  register_number: string;
  student_name: string;
  entry_type: 'entry' | 'exit';
  timestamp: string;
  confidence_score?: number;
  image_url?: string;
  location: string;
  created_at: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  entryPoint: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
}

export interface HostelInfo {
  id: string;
  name: string;
  totalFloors: number;
  totalRooms: number;
  capacity: number;
  currentOccupancy: number;
  address: string;
  contactNumber: string;
}
