import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and authorization
router.use(authenticate);
router.use(authorize('caretaker', 'deputy_warden', 'assistant_warden', 'warden', 'hostel_director', 'admin'));

// Placeholder routes for caretaker
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Caretaker dashboard - Coming soon',
    data: {
      role: 'caretaker',
      user: req.user.profile.full_name
    }
  });
});

router.get('/tasks', (req, res) => {
  res.json({
    success: true,
    message: 'Task management - Coming soon'
  });
});

router.get('/maintenance', (req, res) => {
  res.json({
    success: true,
    message: 'Maintenance tracking - Coming soon'
  });
});

export default router;