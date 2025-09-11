import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { logger, requestLogger } from './middleware/logger.js';
import { notFound } from './middleware/notFound.js';

// Import routes
import adminRoutes from './routes/adminRoutes.js';
import directorRoutes from './routes/directorRoutes.js';
import wardenRoutes from './routes/wardenRoutes.js';
import associateWardenRoutes from './routes/associateWardenRoutes.js';
import caretakerRoutes from './routes/caretakerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import debugRoutes from './routes/debugRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174','http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Ensure CORS headers are sent for all OPTIONS preflight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100000 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

app.get('/api/cors-test', (req, res) => {
  console.log('[CORS TEST] Origin:', req.headers.origin);
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
  });
});
// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/director', directorRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/associate-warden', associateWardenRoutes);
app.use('/api/caretaker', caretakerRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/debug', debugRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`📝 Logs level: ${process.env.LOG_LEVEL || 'info'}`);
});

export default app;