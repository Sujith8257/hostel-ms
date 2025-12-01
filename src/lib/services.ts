import { supabase } from '@/lib/supabase';
import type { DbStudent, DbEntryLog, DbAlert, DbProfile } from '@/types/database-models';
import type { UserRole } from '@/types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Student Management
export const studentService = {
  async getStudents(retries: number = 1): Promise<DbStudent[]> {
    const startTime = Date.now();
    console.log('📡 [GET_STUDENTS] Starting fetch (RLS disabled, using direct query)...');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    console.log('📡 [GET_STUDENTS] Using REST API directly...');
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        const delay = 2000;
        console.log(`🔄 [GET_STUDENTS] Retry ${attempt}/${retries} after ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
      
      console.log(`📡 [GET_STUDENTS] Attempt ${attempt + 1}/${retries + 1}...`);
      const attemptStart = Date.now();
      
      try {
        // Fetch all students using pagination (Supabase default limit is 1000)
        const batchSize = 1000;
        let allStudents: any[] = [];
        let from = 0;
        let hasMore = true;
        let totalCount: number | null = null;
        
        console.log('📡 [GET_STUDENTS] Fetching all students with pagination...');
        
        while (hasMore) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout per batch
          
          const to = from + batchSize - 1;
          const queryUrl = `${supabaseUrl}/rest/v1/students?select=id,register_number,full_name,email,phone,hostel_status,room_number,is_active,created_at,updated_at&order=created_at.desc&limit=${batchSize}&offset=${from}`;
          
          console.log(`📡 [GET_STUDENTS] Fetching batch: ${from} to ${to}...`);
          
          try {
            const response = await fetch(queryUrl, {
              method: 'GET',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
              },
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const batchTime = Date.now() - attemptStart;
            console.log(`📡 [GET_STUDENTS] Batch response in ${batchTime}ms:`, response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ [GET_STUDENTS] HTTP error:', response.status, errorText);
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            // Get total count from header
            const contentRange = response.headers.get('content-range');
            if (contentRange && !totalCount) {
              const match = contentRange.match(/\/(\d+)/);
              if (match) {
                totalCount = parseInt(match[1], 10);
                console.log(`📊 [GET_STUDENTS] Total students in database: ${totalCount}`);
              }
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
              console.error('❌ [GET_STUDENTS] Invalid response format:', typeof data);
              throw new Error('Invalid response: expected array');
            }
            
            allStudents = [...allStudents, ...data];
            console.log(`✅ [GET_STUDENTS] Batch: ${data.length} students (total so far: ${allStudents.length}/${totalCount || 'unknown'})`);
            
            // Check if we got all records
            if (totalCount !== null && allStudents.length >= totalCount) {
              hasMore = false;
              console.log(`✅ [GET_STUDENTS] All ${totalCount} students fetched`);
            } else if (data.length < batchSize) {
              // If we got fewer than batchSize, we've reached the end
              hasMore = false;
              console.log(`✅ [GET_STUDENTS] Reached end of data (got ${data.length} < ${batchSize})`);
            } else {
              from += batchSize;
            }
          } catch (batchErr: any) {
            clearTimeout(timeoutId);
            if (batchErr.name === 'AbortError') {
              console.error(`❌ [GET_STUDENTS] Batch timeout after 10s`);
              throw new Error('Request timed out while fetching batch');
            }
            throw batchErr;
          }
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ [GET_STUDENTS] Fetched ${allStudents.length} students in ${totalTime}ms`);
        
        // Convert to DbStudent format
        const students: DbStudent[] = allStudents.map((student: any) => ({
          ...student,
          face_embedding: null,
          profile_image_url: null
        }));
        
        return students;
        
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err instanceof Error ? err : new Error(String(err));
        const attemptTime = Date.now() - attemptStart;
        
        if (err.name === 'AbortError') {
          console.error(`❌ [GET_STUDENTS] Timeout after 8s (attempt ${attempt + 1})`);
          lastError = new Error('Request timed out after 8 seconds');
        } else {
          console.error(`❌ [GET_STUDENTS] Error (attempt ${attempt + 1}, ${attemptTime}ms):`, err.message || err);
        }
        
        if (attempt === retries) {
          throw lastError;
        }
      }
    }
    
    throw lastError || new Error('Failed to fetch students');
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
    console.log('📝 [CREATE_STUDENT] Creating student:', student.register_number);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/students`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          register_number: student.register_number,
          full_name: student.full_name,
          email: student.email,
          phone: student.phone,
          hostel_status: student.hostel_status,
          room_number: student.room_number,
          face_embedding: student.face_embedding,
          profile_image_url: student.profile_image_url,
          is_active: student.is_active
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📝 [CREATE_STUDENT] Response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [CREATE_STUDENT] HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Supabase returns array with single item when using return=representation
      const newStudent = Array.isArray(data) ? data[0] : data;
      
      if (!newStudent) {
        throw new Error('No student data returned from insert');
      }
      
      console.log('✅ [CREATE_STUDENT] Student created:', newStudent.id);
      
      return {
        ...newStudent,
        face_embedding: newStudent.face_embedding || null,
        profile_image_url: newStudent.profile_image_url || null
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error('❌ [CREATE_STUDENT] Timeout after 10s');
        throw new Error('Request timed out while creating student');
      }
      console.error('❌ [CREATE_STUDENT] Error:', err);
      throw err;
    }
  },

  async updateStudent(id: string, updates: Partial<Omit<DbStudent, 'id' | 'created_at' | 'updated_at'>>): Promise<DbStudent> {
    console.log('✏️ [UPDATE_STUDENT] Updating student:', id);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/students?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          full_name: updates.full_name,
          email: updates.email,
          phone: updates.phone,
          hostel_status: updates.hostel_status,
          room_number: updates.room_number,
          face_embedding: updates.face_embedding,
          profile_image_url: updates.profile_image_url,
          is_active: updates.is_active
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      const updatedStudent = Array.isArray(data) ? data[0] : data;
      
      if (!updatedStudent) {
        throw new Error('No student data returned from update');
      }
      
      console.log('✅ [UPDATE_STUDENT] Student updated:', id);
      return updatedStudent;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out while updating student');
      }
      throw err;
    }
  },

  async deleteStudent(id: string): Promise<void> {
    console.log('🗑️ [DELETE_STUDENT] Deleting student:', id);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/students?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      console.log('✅ [DELETE_STUDENT] Student deleted:', id);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out while deleting student');
      }
      throw err;
    }
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