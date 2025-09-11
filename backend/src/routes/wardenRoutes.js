import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and authorization
router.use(authenticate);
router.use(authorize('warden', 'hostel_director', 'admin'));

// Placeholder routes for warden
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Warden dashboard - Coming soon',
    data: {
      role: 'warden',
      user: req.user.profile.full_name
    }
  });
});

router.get('/students', (req, res) => {
  res.json({
    success: true,
    message: 'Student management - Coming soon'
  });
});

router.get('/alerts', (req, res) => {
  res.json({
    success: true,
    message: 'Security alerts - Coming soon'
  });
});

export default router;