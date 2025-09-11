import Joi from 'joi';

// Common validation schemas
const uuidSchema = Joi.string().uuid().required();
const emailSchema = Joi.string().email().required();
const passwordSchema = Joi.string().min(8).required();

// User role validation
const roleSchema = Joi.string().valid(
  'admin', 
  'hostel_director', 
  'warden', 
  'deputy_warden', 
  'assistant_warden', 
  'caretaker',
  'student'
).required();

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
};

// Validation schemas for different endpoints

// User management schemas
export const createUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required(),
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  building_id: uuidSchema.optional(),
  floor_numbers: Joi.array().items(Joi.number().integer().min(1)).optional()
});

export const updateUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
  role: roleSchema.optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  is_active: Joi.boolean().optional()
});

// Building management schemas
export const createBuildingSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().max(500).optional(),
  total_floors: Joi.number().integer().min(1).required(),
  total_rooms: Joi.number().integer().min(1).required(),
  capacity: Joi.number().integer().min(1).required(),
  director_id: uuidSchema.optional()
});

export const updateBuildingSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  address: Joi.string().max(500).optional(),
  total_floors: Joi.number().integer().min(1).optional(),
  total_rooms: Joi.number().integer().min(1).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  director_id: uuidSchema.optional()
});

// Student management schemas
export const createStudentSchema = Joi.object({
  register_number: Joi.string().required(),
  full_name: Joi.string().min(2).max(100).required(),
  email: emailSchema.optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  hostel_status: Joi.string().valid('resident', 'day_scholar', 'former_resident').required(),
  room_number: Joi.string().optional(),
  building_id: uuidSchema.optional()
});

export const updateStudentSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  hostel_status: Joi.string().valid('resident', 'day_scholar', 'former_resident').optional(),
  room_number: Joi.string().optional(),
  is_active: Joi.boolean().optional()
});

// Maintenance request schemas
export const createMaintenanceRequestSchema = Joi.object({
  building_id: uuidSchema.required(),
  room_number: Joi.string().required(),
  issue_type: Joi.string().valid(
    'plumbing', 'electrical', 'furniture', 'cleaning', 'security', 'other'
  ).required(),
  description: Joi.string().min(10).max(500).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
});

export const updateMaintenanceRequestSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional(),
  assigned_to: uuidSchema.optional(),
  notes: Joi.string().max(500).optional()
});

// Incident report schemas
export const createIncidentSchema = Joi.object({
  building_id: uuidSchema.required(),
  floor_number: Joi.number().integer().min(1).optional(),
  room_number: Joi.string().optional(),
  incident_type: Joi.string().valid(
    'theft', 'violence', 'noise_complaint', 'damage', 'safety', 'other'
  ).required(),
  description: Joi.string().min(10).max(1000).required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('low')
});

// Attendance schemas
export const markAttendanceSchema = Joi.object({
  student_id: uuidSchema.required(),
  date: Joi.date().iso().required(),
  status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
  notes: Joi.string().max(200).optional()
});

// Query parameter validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().default('created_at'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

// Validate query parameters middleware
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { allowUnknown: true });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errors
      });
    }
    
    req.query = { ...req.query, ...value };
    next();
  };
};