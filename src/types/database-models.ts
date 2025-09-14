import type { UserRole } from './index';

// Database-specific types that match the Supabase schema exactly
export interface DbStudent {
  id: string;
  register_number: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  hostel_status: 'resident' | 'day_scholar' | 'former_resident';
  room_number: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  building_id: string | null;
  face_embedding: any | null; // jsonb type
}

export interface DbEntryLog {
  id: string;
  student_id: string | null;
  register_number: string;
  student_name: string;
  entry_type: 'entry' | 'exit';
  timestamp: string;
  confidence_score: number | null;
  image_url: string | null;
  location: string;
  created_at: string;
}

export interface DbAlert {
  id: string;
  image_url: string;
  timestamp: string;
  confidence_score: number | null;
  location: string;
  status: string;
  resolved_by: string | null;
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Real-time subscription payload type
export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
}