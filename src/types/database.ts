export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          role: 'admin' | 'hostel_director' | 'warden' | 'deputy_warden' | 'assistant_warden' | 'caretaker' | 'student' | 'case_manager' | 'investigator'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          role?: 'admin' | 'warden' | 'student'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          role?: 'admin' | 'warden' | 'student'
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          register_number: string
          full_name: string
          email: string | null
          phone: string | null
          hostel_status: 'resident' | 'day_scholar' | 'former_resident'
          room_number: string | null
          face_embedding: ArrayBuffer | null
          profile_image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          register_number: string
          full_name: string
          email?: string | null
          phone?: string | null
          hostel_status?: 'resident' | 'day_scholar' | 'former_resident'
          room_number?: string | null
          face_embedding?: ArrayBuffer | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          register_number?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          hostel_status?: 'resident' | 'day_scholar' | 'former_resident'
          room_number?: string | null
          face_embedding?: ArrayBuffer | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      entry_logs: {
        Row: {
          id: string
          student_id: string | null
          register_number: string
          student_name: string
          entry_type: 'entry' | 'exit'
          timestamp: string
          confidence_score: number | null
          image_url: string | null
          location: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id?: string | null
          register_number: string
          student_name: string
          entry_type: 'entry' | 'exit'
          timestamp?: string
          confidence_score?: number | null
          image_url?: string | null
          location?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string | null
          register_number?: string
          student_name?: string
          entry_type?: 'entry' | 'exit'
          timestamp?: string
          confidence_score?: number | null
          image_url?: string | null
          location?: string
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          image_url: string
          timestamp: string
          confidence_score: number | null
          location: string
          status: string
          resolved_by: string | null
          resolved_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          image_url: string
          timestamp?: string
          confidence_score?: number | null
          location?: string
          status?: string
          resolved_by?: string | null
          resolved_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          timestamp?: string
          confidence_score?: number | null
          location?: string
          status?: string
          resolved_by?: string | null
          resolved_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: {
          user_uuid: string
        }
        Returns: 'admin' | 'warden' | 'student'
      }
    }
    Enums: {
      app_role: 'admin' | 'warden' | 'student'
      hostel_status: 'resident' | 'day_scholar' | 'former_resident'
      entry_type: 'entry' | 'exit'
    }
  }
}