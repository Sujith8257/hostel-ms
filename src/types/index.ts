export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hostel_director' | 'warden' | 'deputy_warden' | 'assistant_warden' | 'floor_incharge';
  hostelName: string;
  floorNumber?: number; // For floor incharges
  phoneNumber: string;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  phoneNumber: string;
  roomNumber: string;
  floorNumber: number;
  dateOfAdmission: string;
  emergencyContact: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
  photo: string;
  isAuthorized: boolean;
  status: 'active' | 'inactive' | 'suspended';
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
