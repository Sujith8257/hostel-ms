export type UserRole = 'admin' | 'warden' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  hostelBlock?: string;
  floorNumber?: number;
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  roomNumber: string;
  block: string;
  floor: number;
  phoneNumber: string;
  parentContact: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  isAuthorized: boolean;
}

export interface Entry {
  id: string;
  studentId: string;
  entryTime: Date;
  exitTime?: Date;
  isAuthorized: boolean;
  detectedBy: string; // Camera/sensor ID
  verificationMethod: 'rfid' | 'biometric' | 'manual' | 'unauthorized';
  location: string; // Entry point
}

export interface Alert {
  id: string;
  type: 'unauthorized_entry' | 'suspicious_activity' | 'emergency' | 'maintenance';
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  studentId?: string;
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
