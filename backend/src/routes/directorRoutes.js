import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and authorization
router.use(authenticate);
router.use(authorize('hostel_director', 'admin'));

// Placeholder routes for hostel director
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Hostel Director dashboard - Coming soon',
    data: {
      role: 'hostel_director',
      user: req.user.profile.full_name
    }
  });
});

router.get('/hostels', (req, res) => {
  res.json({
    success: true,
    message: 'Hostel buildings management - Coming soon'
  });
});

router.get('/staff', (req, res) => {
  res.json({
    success: true,
    message: 'Staff management - Coming soon'
  });
});

export default router;