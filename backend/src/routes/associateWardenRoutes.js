import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and authorization
router.use(authenticate);
router.use(authorize('deputy_warden', 'assistant_warden', 'warden', 'hostel_director', 'admin'));

// Placeholder routes for associate warden
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Associate Warden dashboard - Coming soon',
    data: {
      role: req.user.profile.role,
      user: req.user.profile.full_name
    }
  });
});

router.get('/floors', (req, res) => {
  res.json({
    success: true,
    message: 'Floor management - Coming soon'
  });
});

router.get('/attendance', (req, res) => {
  res.json({
    success: true,
    message: 'Attendance management - Coming soon'
  });
});

export default router;