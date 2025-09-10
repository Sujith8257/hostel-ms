import { supabaseAdmin, dbHelpers } from '../config/supabase.js';
import { logger } from '../middleware/logger.js';

export const adminController = {
  // Get dashboard stats
  async getDashboard(req, res) {
    try {
      // Get various statistics
      const [
        { count: totalUsers },
        { count: totalStudents },
        { count: totalBuildings },
        { count: activeAlerts },
        { count: pendingMaintenance }
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('students').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('hostel_buildings').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('alerts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabaseAdmin.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      // Get recent activities
      const { data: recentActivities } = await supabaseAdmin
        .from('entry_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      res.json({
        success: true,
        data: {
          stats: {
            totalUsers,
            totalStudents,
            totalBuildings,
            activeAlerts,
            pendingMaintenance
          },
          recentActivities
        }
      });

    } catch (error) {
      logger.error('Admin dashboard error', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching dashboard data'
      });
    }
  },

  // Get all users with pagination
  async getUsers(req, res) {
    try {
      const { page, limit, role, search } = req.query;
      
      let query = supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply filters
      if (role) {
        query = query.eq('role', role);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      logger.error('Get users error', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching users'
      });
    }
  },

  // Create new user
  async createUser(req, res) {
    try {
      const { full_name, email, password, role, phone, building_id, floor_numbers } = req.body;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) {
        throw authError;
      }

      // Create profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name,
          email,
          role,
          phone
        })
        .select()
        .single();

      if (profileError) {
        // Cleanup: delete the auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Create staff assignment if applicable
      if (building_id && ['warden', 'deputy_warden', 'assistant_warden', 'caretaker'].includes(role)) {
        const { error: assignmentError } = await supabaseAdmin
          .from('staff_assignments')
          .insert({
            staff_id: profile.id,
            building_id,
            floor_numbers: floor_numbers || null,
            assignment_type: role === 'warden' ? 'building' : 'floor',
            start_date: new Date().toISOString().split('T')[0]
          });

        if (assignmentError) {
          logger.warn('Staff assignment creation failed', assignmentError);
        }
      }

      logger.info('User created successfully', { 
        userId: authData.user.id, 
        email, 
        role,
        createdBy: req.user.profile.id 
      });

      res.status(201).json({
        success: true,
        data: profile,
        message: 'User created successfully'
      });

    } catch (error) {
      logger.error('Create user error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error creating user'
      });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('User updated successfully', { 
        userId: id, 
        updates,
        updatedBy: req.user.profile.id 
      });

      res.json({
        success: true,
        data,
        message: 'User updated successfully'
      });

    } catch (error) {
      logger.error('Update user error', error);
      res.status(500).json({
        success: false,
        error: 'Error updating user'
      });
    }
  },

  // Delete/Deactivate user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Soft delete by setting is_active to false
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('User deactivated successfully', { 
        userId: id,
        deactivatedBy: req.user.profile.id 
      });

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });

    } catch (error) {
      logger.error('Delete user error', error);
      res.status(500).json({
        success: false,
        error: 'Error deactivating user'
      });
    }
  },

  // Get system health
  async getSystemHealth(req, res) {
    try {
      const healthChecks = await Promise.allSettled([
        // Database connectivity
        supabaseAdmin.from('profiles').select('id').limit(1),
        // Check recent activities
        supabaseAdmin.from('entry_logs').select('id').limit(1),
        // Check alerts system
        supabaseAdmin.from('alerts').select('id').limit(1)
      ]);

      const systemHealth = {
        database: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        entryLogs: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        alertsSystem: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      };

      const overallHealth = Object.values(systemHealth).slice(0, 3).every(status => status === 'healthy');

      res.json({
        success: true,
        data: {
          status: overallHealth ? 'healthy' : 'degraded',
          components: systemHealth
        }
      });

    } catch (error) {
      logger.error('System health check error', error);
      res.status(500).json({
        success: false,
        error: 'Error checking system health'
      });
    }
  },

  // Get audit logs
  async getAuditLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;

      // This would require implementing an audit log system
      // For now, return recent activities from various tables
      const { data: recentLogs, error } = await supabaseAdmin
        .from('entry_logs')
        .select(`
          id,
          timestamp,
          entry_type,
          student_name,
          location,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: recentLogs
      });

    } catch (error) {
      logger.error('Get audit logs error', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching audit logs'
      });
    }
  },

  // Get role permissions matrix
  async getPermissions(req, res) {
    try {
      const permissionsMatrix = {
        admin: {
          users: ['create', 'read', 'update', 'delete'],
          students: ['create', 'read', 'update', 'delete'],
          buildings: ['create', 'read', 'update', 'delete'],
          security: ['read', 'manage'],
          reports: ['read', 'generate'],
          system: ['configure', 'monitor']
        },
        hostel_director: {
          users: ['create', 'read', 'update'],
          students: ['create', 'read', 'update', 'delete'],
          buildings: ['create', 'read', 'update'],
          security: ['read', 'manage'],
          reports: ['read', 'generate'],
          system: ['monitor']
        },
        warden: {
          students: ['read', 'update'],
          security: ['read', 'basic_manage'],
          reports: ['read'],
          maintenance: ['create', 'read', 'update']
        },
        deputy_warden: {
          students: ['read', 'update'],
          security: ['read'],
          reports: ['read'],
          maintenance: ['create', 'read']
        },
        caretaker: {
          maintenance: ['read', 'update'],
          students: ['read']
        }
      };

      res.json({
        success: true,
        data: permissionsMatrix
      });

    } catch (error) {
      logger.error('Get permissions error', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching permissions'
      });
    }
  },

  // Get all students with pagination
  async getStudents(req, res) {
    try {
      const { page = 1, limit = 50, search, hostel_status } = req.query;
      
      let query = supabaseAdmin
        .from('students')
        .select('*, building:hostel_buildings(name)', { count: 'exact' });

      // Apply filters
      if (hostel_status) {
        query = query.eq('hostel_status', hostel_status);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,register_number.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      logger.error('Get students error', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching students'
      });
    }
  },

  // Get all buildings
  async getBuildings(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('hostel_buildings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data
      });

    } catch (error) {
      logger.error('Get buildings error', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching buildings'
      });
    }
  }
};