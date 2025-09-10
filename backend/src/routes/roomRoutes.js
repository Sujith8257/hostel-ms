import express from 'express';
import { authenticate, authorize, checkBuildingAccess } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validation.js';
import { roomController } from '../controllers/roomController.js';
import Joi from 'joi';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createRoomSchema = Joi.object({
  room_number: Joi.string().required().max(20),
  building_id: Joi.string().uuid().required(),
  floor_number: Joi.number().integer().min(1).required(),
  room_type: Joi.string().valid('single', 'double', 'triple', 'dormitory').required(),
  capacity: Joi.number().integer().min(1).max(10).required(),
  rent_amount: Joi.number().min(0).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().max(500).optional()
});

const updateRoomSchema = Joi.object({
  room_number: Joi.string().max(20).optional(),
  floor_number: Joi.number().integer().min(1).optional(),
  room_type: Joi.string().valid('single', 'double', 'triple', 'dormitory').optional(),
  capacity: Joi.number().integer().min(1).max(10).optional(),
  rent_amount: Joi.number().min(0).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().max(500).optional(),
  status: Joi.string().valid('available', 'occupied', 'maintenance', 'reserved').optional()
});

const allotRoomSchema = Joi.object({
  student_id: Joi.string().uuid().required(),
  room_id: Joi.string().uuid().required(),
  notes: Joi.string().max(500).optional()
});

const transferRoomSchema = Joi.object({
  new_room_id: Joi.string().uuid().required(),
  notes: Joi.string().max(500).optional()
});

const addToWaitingListSchema = Joi.object({
  student_id: Joi.string().uuid().required(),
  preferred_building_id: Joi.string().uuid().optional(),
  preferred_room_type: Joi.string().valid('single', 'double', 'triple', 'dormitory').optional(),
  preferred_floor: Joi.number().integer().min(1).optional(),
  priority_score: Joi.number().integer().min(0).max(100).default(0),
  notes: Joi.string().max(500).optional()
});

const roomQuerySchema = Joi.object({
  building_id: Joi.string().uuid().optional(),
  floor_number: Joi.number().integer().min(1).optional(),
  room_type: Joi.string().valid('single', 'double', 'triple', 'dormitory').optional(),
  status: Joi.string().valid('available', 'occupied', 'maintenance', 'reserved').optional(),
  search: Joi.string().max(50).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50)
});

const allotmentQuerySchema = Joi.object({
  building_id: Joi.string().uuid().optional(),
  floor_number: Joi.number().integer().min(1).optional(),
  status: Joi.string().valid('active', 'vacated', 'transferred').default('active'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50)
});

const waitingListQuerySchema = Joi.object({
  status: Joi.string().valid('waiting', 'allotted', 'cancelled').default('waiting'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50)
});

// Room management routes (Admin, Hostel Director, Wardens)
router.get('/rooms', 
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden'),
  validateQuery(roomQuerySchema),
  roomController.getRooms
);

router.get('/rooms/available', 
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden'),
  validateQuery(roomQuerySchema),
  roomController.getAvailableRooms
);

router.post('/rooms', 
  authorize('admin', 'hostel_director'),
  validate(createRoomSchema),
  roomController.createRoom
);

router.put('/rooms/:roomId', 
  authorize('admin', 'hostel_director', 'warden'),
  validate(updateRoomSchema),
  roomController.updateRoom
);

router.get('/rooms/stats',
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden'),
  roomController.getRoomStats
);

// Room allotment routes
router.get('/allotments', 
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden'),
  validateQuery(allotmentQuerySchema),
  roomController.getRoomAllotments
);

router.post('/allotments', 
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden'),
  validate(allotRoomSchema),
  roomController.allotRoom
);

router.put('/allotments/:allotmentId/vacate', 
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden'),
  roomController.vacateRoom
);

router.put('/allotments/:currentAllotmentId/transfer', 
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden'),
  validate(transferRoomSchema),
  roomController.transferRoom
);

// Waiting list routes
router.get('/waiting-list', 
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden'),
  validateQuery(waitingListQuerySchema),
  roomController.getWaitingList
);

router.post('/waiting-list', 
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden', 'assistant_warden'),
  validate(addToWaitingListSchema),
  roomController.addToWaitingList
);

router.delete('/waiting-list/:waitingId', 
  authorize('admin', 'hostel_director', 'warden', 'deputy_warden'),
  roomController.removeFromWaitingList
);

export default router;