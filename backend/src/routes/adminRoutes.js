import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, validateQuery, createUserSchema, updateUserSchema, paginationSchema } from '../middleware/validation.js';
import { adminController } from '../controllers/adminController.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin', 'hostel_director'));

// Dashboard routes
router.get('/dashboard', adminController.getDashboard);

// User management routes
router.get('/users', 
  validateQuery(paginationSchema), 
  adminController.getUsers
);

router.post('/users', 
  validate(createUserSchema), 
  adminController.createUser
);

router.put('/users/:id', 
  validate(updateUserSchema), 
  adminController.updateUser
);

router.delete('/users/:id', adminController.deleteUser);

// System management routes
router.get('/system-health', adminController.getSystemHealth);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/permissions', adminController.getPermissions);

export default router;