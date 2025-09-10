import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { logger } from '../middleware/logger.js';

const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, role = 'warden', phone, organization, justification } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and full name are required'
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for development
      user_metadata: {
        full_name: fullName,
        role: role,
        phone: phone,
        organization: organization,
        justification: justification
      }
    });

    if (authError) {
      logger.warn('Signup attempt failed', { email, error: authError.message });
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    // Create profile in database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role,
        phone: phone,
        organization: organization,
        justification: justification,
        is_active: role === 'warden' ? true : false, // Auto-approve wardens, others need admin approval
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      logger.error('Profile creation error after signup', { userId: authData.user.id, error: profileError });
      // Try to delete the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({
        success: false,
        error: 'Error creating user profile'
      });
    }

    logger.info('User signed up successfully', { 
      userId: authData.user.id, 
      email: authData.user.email,
      role: profile.role 
    });

    res.status(201).json({
      success: true,
      data: {
        user: authData.user,
        profile: profile,
        message: role === 'warden' ? 'Account created and activated' : 'Account created. Pending admin approval.'
      }
    });

  } catch (error) {
    logger.error('Signup error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.warn('Login attempt failed', { email, error: error.message });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) {
      logger.error('Profile fetch error after login', { userId: data.user.id, error: profileError });
      return res.status(500).json({
        success: false,
        error: 'Error fetching user profile'
      });
    }

    logger.info('User logged in successfully', { 
      userId: data.user.id, 
      email: data.user.email,
      role: profile.role 
    });

    res.json({
      success: true,
      data: {
        user: data.user,
        profile: profile,
        session: data.session
      }
    });

  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Logout error', error);
      return res.status(500).json({
        success: false,
        error: 'Error during logout'
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      logger.warn('Token refresh failed', { error: error.message });
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: data.user,
        profile: profile,
        session: data.session
      }
    });

  } catch (error) {
    logger.error('Token refresh error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });

  } catch (error) {
    logger.error('Get current user error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;