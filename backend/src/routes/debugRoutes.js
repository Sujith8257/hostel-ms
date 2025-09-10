import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Debug endpoint to check user authentication status
router.get('/auth-status', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.json({
        success: false,
        error: 'No token provided',
        hasToken: false,
        timestamp: new Date().toISOString()
      });
    }

    // Check token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.json({
        success: false,
        error: 'Invalid token',
        hasToken: true,
        tokenValid: false,
        authError: authError?.message,
        timestamp: new Date().toISOString()
      });
    }

    // Check for profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Check all profiles for debugging (limit to avoid too much data)
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('user_id, email, role, is_active, created_at')
      .limit(10);

    return res.json({
      success: true,
      hasToken: true,
      tokenValid: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      },
      profile: profile || null,
      profileError: profileError?.message || null,
      hasProfile: !!profile,
      isProfileActive: profile?.is_active || false,
      allProfiles: allProfiles || [],
      allProfilesError: allProfilesError?.message || null,
      profileCount: allProfiles?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint to create missing profile
router.post('/create-profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Check token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        details: authError?.message
      });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      return res.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile,
        action: 'none'
      });
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email,
        role: 'admin', // Default to admin for testing
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create profile',
        details: profileError.message,
        code: profileError.code
      });
    }

    return res.json({
      success: true,
      message: 'Profile created successfully',
      profile,
      action: 'created'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test endpoint for room stats without authentication
router.get('/room-stats-test', async (req, res) => {
  try {
    // Simple room stats query without authentication
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select(`
        status,
        room_type,
        building_id,
        is_active
      `)
      .eq('is_active', true);

    if (roomError) {
      return res.json({
        success: false,
        error: 'Failed to fetch rooms',
        details: roomError.message,
        code: roomError.code,
        timestamp: new Date().toISOString()
      });
    }

    // Calculate basic stats
    const stats = {
      total_rooms: roomData.length,
      available_rooms: roomData.filter(r => r.status === 'available').length,
      occupied_rooms: roomData.filter(r => r.status === 'occupied').length,
      maintenance_rooms: roomData.filter(r => r.status === 'maintenance').length,
      by_type: {
        single: roomData.filter(r => r.room_type === 'single').length,
        double: roomData.filter(r => r.room_type === 'double').length,
        triple: roomData.filter(r => r.room_type === 'triple').length,
        dormitory: roomData.filter(r => r.room_type === 'dormitory').length
      }
    };

    return res.json({
      success: true,
      data: stats,
      raw_count: roomData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;