import { supabase } from '../config/supabase.js';
import { logger } from '../middleware/logger.js';

export const roomController = {
  // Get all rooms with filters
  async getRooms(req, res) {
    try {
      const { 
        building_id, 
        floor_number, 
        room_type, 
        status, 
        page = 1, 
        limit = 50,
        search 
      } = req.query;

      let query = supabase
        .from('rooms')
        .select(`
          *,
          building:hostel_buildings(name, address),
          allotments:room_allotments!inner(
            id,
            student:students(register_number, full_name, email),
            allotment_date,
            status
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (building_id) {
        query = query.eq('building_id', building_id);
      }
      if (floor_number) {
        query = query.eq('floor_number', floor_number);
      }
      if (room_type) {
        query = query.eq('room_type', room_type);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (search) {
        query = query.ilike('room_number', `%${search}%`);
      }

      // Add pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: rooms, error, count } = await query;

      if (error) {
        logger.error('Error fetching rooms:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          query_params: { building_id, floor_number, room_type, status, page, limit, search },
          user_id: req.user?.id,
          user_role: req.user?.profile?.role
        });
        return res.status(400).json({
          success: false,
          error: 'Failed to fetch rooms',
          details: error.message,
          code: error.code,
          timestamp: new Date().toISOString()
        });
      }

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      res.json({
        success: true,
        data: rooms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      logger.error('Error in getRooms:', {
        error: error.message,
        stack: error.stack,
        query_params: req.query,
        user_id: req.user?.id,
        user_role: req.user?.profile?.role,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching rooms',
        details: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  },

  // Get available rooms
  async getAvailableRooms(req, res) {
    try {
      const { building_id, room_type, floor_number } = req.query;

      let query = supabase
        .from('rooms')
        .select(`
          *,
          building:hostel_buildings(name, address)
        `)
        .eq('is_active', true)
        .eq('status', 'available');

      if (building_id) {
        query = query.eq('building_id', building_id);
      }
      if (room_type) {
        query = query.eq('room_type', room_type);
      }
      if (floor_number) {
        query = query.eq('floor_number', floor_number);
      }

      const { data: rooms, error } = await query;

      if (error) {
        logger.error('Error fetching available rooms:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      logger.error('Error in getAvailableRooms:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Create a new room
  async createRoom(req, res) {
    try {
      const {
        room_number,
        building_id,
        floor_number,
        room_type,
        capacity,
        rent_amount,
        amenities,
        description
      } = req.body;

      const { data: room, error } = await supabase
        .from('rooms')
        .insert({
          room_number,
          building_id,
          floor_number,
          room_type,
          capacity,
          rent_amount,
          amenities,
          description
        })
        .select(`
          *,
          building:hostel_buildings(name, address)
        `)
        .single();

      if (error) {
        logger.error('Error creating room:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      logger.info(`Room created: ${room.room_number} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: room,
        message: 'Room created successfully'
      });
    } catch (error) {
      logger.error('Error in createRoom:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Update room details
  async updateRoom(req, res) {
    try {
      const { roomId } = req.params;
      const updates = req.body;

      const { data: room, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId)
        .select(`
          *,
          building:hostel_buildings(name, address)
        `)
        .single();

      if (error) {
        logger.error('Error updating room:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      logger.info(`Room updated: ${room.room_number} by user ${req.user.id}`);

      res.json({
        success: true,
        data: room,
        message: 'Room updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateRoom:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Allot room to student
  async allotRoom(req, res) {
    try {
      const { student_id, room_id, notes } = req.body;
      const allotted_by = req.user.profile.id;

      // Check if room is available
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('capacity, current_occupancy, status')
        .eq('id', room_id)
        .single();

      if (roomError || !room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      if (room.status === 'maintenance') {
        return res.status(400).json({
          success: false,
          error: 'Room is under maintenance'
        });
      }

      if (room.current_occupancy >= room.capacity) {
        return res.status(400).json({
          success: false,
          error: 'Room is at full capacity'
        });
      }

      // Check if student already has an active allotment
      const { data: existingAllotment, error: allotmentError } = await supabase
        .from('room_allotments')
        .select('id')
        .eq('student_id', student_id)
        .eq('status', 'active')
        .single();

      if (existingAllotment) {
        return res.status(400).json({
          success: false,
          error: 'Student already has an active room allotment'
        });
      }

      // Create room allotment
      const { data: allotment, error } = await supabase
        .from('room_allotments')
        .insert({
          student_id,
          room_id,
          allotted_by,
          notes,
          status: 'active'
        })
        .select(`
          *,
          student:students(register_number, full_name, email),
          room:rooms(room_number, building:hostel_buildings(name)),
          allotter:profiles(full_name)
        `)
        .single();

      if (error) {
        logger.error('Error creating room allotment:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      // Update student's room_number field for backward compatibility
      await supabase
        .from('students')
        .update({ room_number: room.room_number })
        .eq('id', student_id);

      logger.info(`Room allotted: ${allotment.room.room_number} to student ${allotment.student.register_number} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: allotment,
        message: 'Room allotted successfully'
      });
    } catch (error) {
      logger.error('Error in allotRoom:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Vacate room
  async vacateRoom(req, res) {
    try {
      const { allotmentId } = req.params;
      const { notes } = req.body;

      // Update allotment status
      const { data: allotment, error } = await supabase
        .from('room_allotments')
        .update({
          status: 'vacated',
          vacate_date: new Date().toISOString().split('T')[0],
          notes: notes || allotment.notes
        })
        .eq('id', allotmentId)
        .eq('status', 'active')
        .select(`
          *,
          student:students(id, register_number, full_name),
          room:rooms(room_number)
        `)
        .single();

      if (error) {
        logger.error('Error vacating room:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (!allotment) {
        return res.status(404).json({
          success: false,
          error: 'Active allotment not found'
        });
      }

      // Clear student's room_number field
      await supabase
        .from('students')
        .update({ room_number: null })
        .eq('id', allotment.student.id);

      logger.info(`Room vacated: ${allotment.room.room_number} by student ${allotment.student.register_number}`);

      res.json({
        success: true,
        data: allotment,
        message: 'Room vacated successfully'
      });
    } catch (error) {
      logger.error('Error in vacateRoom:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Transfer student to another room
  async transferRoom(req, res) {
    try {
      const { currentAllotmentId } = req.params;
      const { new_room_id, notes } = req.body;
      const transferred_by = req.user.profile.id;

      // Start transaction by getting current allotment
      const { data: currentAllotment, error: currentError } = await supabase
        .from('room_allotments')
        .select(`
          *,
          student:students(id, register_number, full_name),
          room:rooms(room_number)
        `)
        .eq('id', currentAllotmentId)
        .eq('status', 'active')
        .single();

      if (currentError || !currentAllotment) {
        return res.status(404).json({
          success: false,
          error: 'Current allotment not found'
        });
      }

      // Check if new room is available
      const { data: newRoom, error: roomError } = await supabase
        .from('rooms')
        .select('capacity, current_occupancy, status, room_number')
        .eq('id', new_room_id)
        .single();

      if (roomError || !newRoom) {
        return res.status(404).json({
          success: false,
          error: 'New room not found'
        });
      }

      if (newRoom.current_occupancy >= newRoom.capacity) {
        return res.status(400).json({
          success: false,
          error: 'New room is at full capacity'
        });
      }

      // Mark current allotment as transferred
      const { error: transferError } = await supabase
        .from('room_allotments')
        .update({
          status: 'transferred',
          vacate_date: new Date().toISOString().split('T')[0],
          notes: `Transferred to ${newRoom.room_number}. ${notes || ''}`
        })
        .eq('id', currentAllotmentId);

      if (transferError) {
        logger.error('Error updating current allotment:', transferError);
        return res.status(400).json({
          success: false,
          error: transferError.message
        });
      }

      // Create new allotment
      const { data: newAllotment, error: newError } = await supabase
        .from('room_allotments')
        .insert({
          student_id: currentAllotment.student.id,
          room_id: new_room_id,
          allotted_by: transferred_by,
          notes: `Transferred from ${currentAllotment.room.room_number}. ${notes || ''}`,
          status: 'active'
        })
        .select(`
          *,
          student:students(register_number, full_name),
          room:rooms(room_number, building:hostel_buildings(name)),
          allotter:profiles(full_name)
        `)
        .single();

      if (newError) {
        logger.error('Error creating new allotment:', newError);
        return res.status(400).json({
          success: false,
          error: newError.message
        });
      }

      // Update student's room_number field
      await supabase
        .from('students')
        .update({ room_number: newRoom.room_number })
        .eq('id', currentAllotment.student.id);

      logger.info(`Room transferred: ${currentAllotment.student.register_number} from ${currentAllotment.room.room_number} to ${newRoom.room_number}`);

      res.json({
        success: true,
        data: newAllotment,
        message: 'Room transferred successfully'
      });
    } catch (error) {
      logger.error('Error in transferRoom:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get room allotments
  async getRoomAllotments(req, res) {
    try {
      const { 
        building_id, 
        floor_number, 
        status = 'active',
        page = 1, 
        limit = 50 
      } = req.query;

      let query = supabase
        .from('room_allotments')
        .select(`
          *,
          student:students(register_number, full_name, email, phone),
          room:rooms(
            room_number, 
            floor_number, 
            room_type,
            building:hostel_buildings(name, address)
          ),
          allotter:profiles(full_name)
        `)
        .eq('status', status);

      // Apply filters through room relationship
      if (building_id || floor_number) {
        const roomQuery = supabase
          .from('rooms')
          .select('id');
        
        if (building_id) {
          roomQuery.eq('building_id', building_id);
        }
        if (floor_number) {
          roomQuery.eq('floor_number', floor_number);
        }

        const { data: rooms } = await roomQuery;
        const roomIds = rooms?.map(r => r.id) || [];
        
        if (roomIds.length > 0) {
          query = query.in('room_id', roomIds);
        } else {
          // No rooms match criteria
          return res.json({
            success: true,
            data: [],
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 0,
              pages: 0
            }
          });
        }
      }

      // Add pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: allotments, error } = await query;

      if (error) {
        logger.error('Error fetching room allotments:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      // Get total count
      let countQuery = supabase
        .from('room_allotments')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      const { count: totalCount } = await countQuery;

      res.json({
        success: true,
        data: allotments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      logger.error('Error in getRoomAllotments:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get waiting list
  async getWaitingList(req, res) {
    try {
      const { status = 'waiting', page = 1, limit = 50 } = req.query;

      const offset = (page - 1) * limit;

      const { data: waitingList, error } = await supabase
        .from('room_waiting_list')
        .select(`
          *,
          student:students(register_number, full_name, email, phone),
          preferred_building:hostel_buildings(name, address)
        `)
        .eq('status', status)
        .order('priority_score', { ascending: false })
        .order('request_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching waiting list:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      const { count: totalCount } = await supabase
        .from('room_waiting_list')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      res.json({
        success: true,
        data: waitingList,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      logger.error('Error in getWaitingList:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Add student to waiting list
  async addToWaitingList(req, res) {
    try {
      const {
        student_id,
        preferred_building_id,
        preferred_room_type,
        preferred_floor,
        priority_score = 0,
        notes
      } = req.body;

      // Check if student already has active allotment or is on waiting list
      const { data: existingAllotment } = await supabase
        .from('room_allotments')
        .select('id')
        .eq('student_id', student_id)
        .eq('status', 'active')
        .single();

      if (existingAllotment) {
        return res.status(400).json({
          success: false,
          error: 'Student already has an active room allotment'
        });
      }

      const { data: existingRequest } = await supabase
        .from('room_waiting_list')
        .select('id')
        .eq('student_id', student_id)
        .eq('status', 'waiting')
        .single();

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          error: 'Student is already on the waiting list'
        });
      }

      const { data: waitingRequest, error } = await supabase
        .from('room_waiting_list')
        .insert({
          student_id,
          preferred_building_id,
          preferred_room_type,
          preferred_floor,
          priority_score,
          notes
        })
        .select(`
          *,
          student:students(register_number, full_name, email),
          preferred_building:hostel_buildings(name, address)
        `)
        .single();

      if (error) {
        logger.error('Error adding to waiting list:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      logger.info(`Student added to waiting list: ${waitingRequest.student.register_number}`);

      res.status(201).json({
        success: true,
        data: waitingRequest,
        message: 'Student added to waiting list successfully'
      });
    } catch (error) {
      logger.error('Error in addToWaitingList:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Remove from waiting list
  async removeFromWaitingList(req, res) {
    try {
      const { waitingId } = req.params;

      const { data: waitingRequest, error } = await supabase
        .from('room_waiting_list')
        .update({ status: 'cancelled' })
        .eq('id', waitingId)
        .select(`
          *,
          student:students(register_number, full_name)
        `)
        .single();

      if (error) {
        logger.error('Error removing from waiting list:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (!waitingRequest) {
        return res.status(404).json({
          success: false,
          error: 'Waiting list entry not found'
        });
      }

      logger.info(`Student removed from waiting list: ${waitingRequest.student.register_number}`);

      res.json({
        success: true,
        data: waitingRequest,
        message: 'Student removed from waiting list successfully'
      });
    } catch (error) {
      logger.error('Error in removeFromWaitingList:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  },

  // Get room occupancy statistics
  async getRoomStats(req, res) {
    try {
      // Debug authentication
      logger.info('getRoomStats called:', {
        user_id: req.user?.id,
        user_email: req.user?.email,
        user_role: req.user?.profile?.role,
        query_params: req.query,
        timestamp: new Date().toISOString()
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      if (!req.user.profile) {
        return res.status(401).json({
          success: false,
          error: 'User profile not found',
          user_id: req.user.id,
          timestamp: new Date().toISOString()
        });
      }

      const { building_id } = req.query;

      let buildingFilter = '';
      if (building_id) {
        buildingFilter = `AND r.building_id = '${building_id}'`;
      }

      // Get room statistics
      const { data: stats, error } = await supabase.rpc('get_room_statistics', {
        building_filter: building_id || null
      });

      if (error) {
        // Fallback to manual calculation if RPC doesn't exist
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select(`
            status,
            capacity,
            current_occupancy,
            room_type,
            building_id,
            hostel_buildings(name)
          `)
          .eq('is_active', true);

        if (roomError) {
          logger.error('Error fetching room data for stats:', {
            error: roomError.message,
            code: roomError.code,
            details: roomError.details,
            hint: roomError.hint,
            building_id,
            user_id: req.user?.id,
            timestamp: new Date().toISOString()
          });
          return res.status(400).json({
            success: false,
            error: 'Failed to fetch room data for statistics',
            details: roomError.message,
            code: roomError.code,
            timestamp: new Date().toISOString()
          });
        }

        // Calculate stats manually
        const filteredRooms = building_id 
          ? roomData.filter(room => room.building_id === building_id)
          : roomData;

        const statsCalculated = {
          total_rooms: filteredRooms.length,
          available_rooms: filteredRooms.filter(r => r.status === 'available').length,
          occupied_rooms: filteredRooms.filter(r => r.status === 'occupied').length,
          maintenance_rooms: filteredRooms.filter(r => r.status === 'maintenance').length,
          total_capacity: filteredRooms.reduce((sum, r) => sum + r.capacity, 0),
          current_occupancy: filteredRooms.reduce((sum, r) => sum + r.current_occupancy, 0),
          occupancy_percentage: filteredRooms.length > 0 
            ? Math.round((filteredRooms.reduce((sum, r) => sum + r.current_occupancy, 0) / filteredRooms.reduce((sum, r) => sum + r.capacity, 0)) * 100)
            : 0
        };

        return res.json({
          success: true,
          data: statsCalculated
        });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getRoomStats:', {
        error: error.message,
        stack: error.stack,
        query_params: req.query,
        user_id: req.user?.id,
        user_role: req.user?.profile?.role,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching room statistics',
        details: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  }
};