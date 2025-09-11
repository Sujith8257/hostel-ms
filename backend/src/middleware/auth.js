import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { logger } from './logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
        timestamp: new Date().toISOString()
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.error('Token verification failed:', {
        error: error?.message,
        hasUser: !!user,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        details: error?.message,
        timestamp: new Date().toISOString()
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Profile lookup failed:', {
        userId: user.id,
        userEmail: user.email,
        profileError: profileError?.message,
        profileCode: profileError?.code,
        profileDetails: profileError?.details,
        hasProfile: !!profile,
        timestamp: new Date().toISOString()
      });

      // Let's check if there are any profiles at all
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('user_id, email, role, is_active, created_at')
        .limit(5);

      logger.info('Available profiles sample:', {
        profileCount: allProfiles?.length || 0,
        profiles: allProfiles,
        allProfilesError: allProfilesError?.message,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({
        success: false,
        error: 'User profile not found',
        details: {
          userId: user.id,
          userEmail: user.email,
          profileError: profileError?.message,
          profileCode: profileError?.code,
          availableProfiles: allProfiles?.length || 0
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check if profile is active
    if (!profile.is_active) {
      logger.warn('Inactive user attempted access:', {
        userId: user.id,
        userEmail: user.email,
        profileRole: profile.role,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        success: false,
        error: 'Account is not active. Please contact administrator.',
        timestamp: new Date().toISOString()
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      profile: profile
    };

    logger.info('Authentication successful:', {
      userId: user.id,
      userEmail: user.email,
      role: profile.role,
      timestamp: new Date().toISOString()
    });

    next();
  } catch (error) {
    logger.error('Authentication error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(401).json({
      success: false,
      error: 'Token verification failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.profile.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Middleware to check if user can access specific building/floor
export const checkBuildingAccess = async (req, res, next) => {
  try {
    const { buildingId } = req.params;
    const userRole = req.user.profile.role;
    const userId = req.user.profile.id;

    // Admin and hostel director have access to all buildings
    if (['admin', 'hostel_director'].includes(userRole)) {
      return next();
    }

    // Check staff assignments for other roles
    const { data: assignment, error } = await supabase
      .from('staff_assignments')
      .select('*')
      .eq('staff_id', userId)
      .eq('building_id', buildingId)
      .eq('is_active', true)
      .single();

    if (error || !assignment) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You are not assigned to this building.'
      });
    }

    req.assignment = assignment;
    next();
  } catch (error) {
    logger.error('Building access check error:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking building access'
    });
  }
};