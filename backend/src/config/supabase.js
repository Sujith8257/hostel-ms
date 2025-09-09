import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for general operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for bypassing RLS when needed
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
export const dbHelpers = {
  // Get user with profile
  async getUserWithProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  },

  // Get building assignments for a user
  async getUserBuildingAssignments(userId) {
    const { data, error } = await supabase
      .from('staff_assignments')
      .select(`
        *,
        hostel_buildings (*)
      `)
      .eq('staff_id', userId)
      .eq('is_active', true);
    
    return { data, error };
  },

  // Check if user has access to building
  async checkBuildingAccess(userId, buildingId, userRole) {
    // Admin and hostel director have access to all buildings
    if (['admin', 'hostel_director'].includes(userRole)) {
      return { hasAccess: true };
    }

    const { data, error } = await supabase
      .from('staff_assignments')
      .select('*')
      .eq('staff_id', userId)
      .eq('building_id', buildingId)
      .eq('is_active', true)
      .single();

    return { 
      hasAccess: !error && data, 
      assignment: data,
      error 
    };
  },

  // Get paginated results
  async getPaginatedResults(tableName, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'desc',
      filters = {},
      select = '*'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(tableName)
      .select(select, { count: 'exact' })
      .range(from, to)
      .order(sort, { ascending: order === 'asc' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query;

    return {
      data,
      error,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    };
  }
};