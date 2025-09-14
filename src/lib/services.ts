import { supabase } from '@/lib/supabase';
import type { DbStudent, DbEntryLog, DbAlert, DbProfile } from '@/types/database-models';
import type { UserRole } from '@/types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Student Management
export const studentService = {
  async getStudents(page = 1, limit = 10, searchTerm = '', statusFilter = 'all'): Promise<{ students: DbStudent[], total: number, totalPages: number }> {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build the query
    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Apply search filter if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      query = query.or(`full_name.ilike.%${term}%,register_number.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,room_number.ilike.%${term}%`);
    }
    
    // Apply status filter if provided
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'active':
          query = query.eq('is_active', true);
          break;
        case 'inactive':
          query = query.eq('is_active', false);
          break;
        case 'residents':
          query = query.eq('hostel_status', 'resident');
          break;
        case 'day_scholars':
          query = query.eq('hostel_status', 'day_scholar');
          break;
        case 'with_rooms':
          query = query.not('room_number', 'is', null);
          break;
        case 'without_rooms':
          query = query.is('room_number', null);
          break;
        case 'face_enrolled':
          query = query.not('face_embedding', 'is', null);
          break;
        case 'face_not_enrolled':
          query = query.is('face_embedding', null);
          break;
      }
    }
    
    // Apply pagination
    const { data, error, count } = await query
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    
    return {
      students: data || [],
      total,
      totalPages
    };
  },

  async getAllStudents(): Promise<DbStudent[]> {
    // Keep this method for backward compatibility
    // Try with a very high limit first
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50000); // Set a very high limit
    
    if (error) throw error;
    
    // If we got exactly 1000 results, it means we might be hitting a limit
    // In that case, fall back to pagination
    if (data && data.length === 1000) {
      console.warn('Potential limit reached, using pagination...');
      
      // Use pagination to fetch all students
      let allStudents: DbStudent[] = [...data]; // Start with what we already have
      let start = 1000;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: nextBatch, error: nextError } = await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false })
          .range(start, start + batchSize - 1);
        
        if (nextError) throw nextError;
        
        if (nextBatch && nextBatch.length > 0) {
          allStudents = allStudents.concat(nextBatch);
          start += batchSize;
          hasMore = nextBatch.length === batchSize;
        } else {
          hasMore = false;
        }
      }
      
      return allStudents;
    }
    
    return data || [];
  },

  async getStudent(id: string): Promise<DbStudent> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createStudent(student: Omit<DbStudent, 'id' | 'created_at' | 'updated_at'>): Promise<DbStudent> {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        register_number: student.register_number,
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        hostel_status: student.hostel_status,
        room_number: student.room_number,
        profile_image_url: student.profile_image_url,
        is_active: student.is_active
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStudent(id: string, updates: Partial<Omit<DbStudent, 'id' | 'created_at' | 'updated_at'>>): Promise<DbStudent> {
    const { data, error } = await supabase
      .from('students')
      .update({
        full_name: updates.full_name,
        email: updates.email,
        phone: updates.phone,
        hostel_status: updates.hostel_status,
        room_number: updates.room_number,
        profile_image_url: updates.profile_image_url,
        is_active: updates.is_active
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Entry Log Management
export const entryLogService = {
  async getEntryLogs(limit = 50): Promise<DbEntryLog[]> {
    const { data, error } = await supabase
      .from('entry_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async createEntryLog(log: Omit<DbEntryLog, 'id' | 'created_at'>): Promise<DbEntryLog> {
    const { data, error } = await supabase
      .from('entry_logs')
      .insert([{
        student_id: log.student_id,
        register_number: log.register_number,
        student_name: log.student_name,
        entry_type: log.entry_type,
        timestamp: log.timestamp,
        confidence_score: log.confidence_score,
        image_url: log.image_url,
        location: log.location
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getEntryLogsByStudent(studentId: string): Promise<DbEntryLog[]> {
    const { data, error } = await supabase
      .from('entry_logs')
      .select('*')
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getEntryLogsByDateRange(startDate: string, endDate: string): Promise<DbEntryLog[]> {
    const { data, error } = await supabase
      .from('entry_logs')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Alert Management
export const alertService = {
  async getAlerts(status?: string): Promise<DbAlert[]> {
    let query = supabase
      .from('alerts')
      .select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createAlert(alert: Omit<DbAlert, 'id' | 'created_at'>): Promise<DbAlert> {
    const { data, error } = await supabase
      .from('alerts')
      .insert([{
        image_url: alert.image_url,
        timestamp: alert.timestamp,
        confidence_score: alert.confidence_score,
        location: alert.location,
        status: alert.status
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAlert(id: string, updates: Partial<Omit<DbAlert, 'id' | 'created_at'>>): Promise<DbAlert> {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: updates.status,
        resolved_by: updates.resolved_by,
        resolved_at: updates.resolved_at,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Profile Management
export const profileService = {
  async getProfile(userId: string): Promise<DbProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: { full_name?: string; role?: UserRole }): Promise<DbProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Real-time subscriptions
export const subscribeToEntryLogs = (callback: (payload: RealtimePostgresChangesPayload<DbEntryLog>) => void) => {
  return supabase
    .channel('entry_logs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entry_logs' }, callback)
    .subscribe();
};

export const subscribeToAlerts = (callback: (payload: RealtimePostgresChangesPayload<DbAlert>) => void) => {
  return supabase
    .channel('alerts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, callback)
    .subscribe();
};

export const subscribeToStudents = (callback: (payload: RealtimePostgresChangesPayload<DbStudent>) => void) => {
  return supabase
    .channel('students')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, callback)
    .subscribe();
};