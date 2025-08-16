import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { validateEnv } from '@/utils/validateEnv';
import { logger } from '@/utils/logger';
import { prisma } from '@/utils/database';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// ================================
// SECURITY MIDDLEWARE
// ================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ================================
// GENERAL MIDDLEWARE
// ================================

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Custom request logger
app.use(requestLogger);

// ================================
// HEALTH CHECK ROUTES
// ================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running',
      },
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'running',
      },
      error: 'Database connection failed',
    });
  }
});

// ================================
// API ROUTES
// ================================

// Import routes
import authRoutes from '@/routes/auth';

// Mount routes
app.use('/api/auth', authRoutes);

// API root endpoint
app.use('/api', (req, res, next) => {
  res.status(200).json({
    message: 'Internal Chat API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      docs: '/api/docs',
    },
  });
});

// ================================
// ERROR HANDLING MIDDLEWARE
// ================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ================================
// SERVER STARTUP
// ================================

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    
    // Exit process
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Internal Chat API Server running on port ${PORT}`);
  logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
  logger.info(`🔗 API available at http://localhost:${PORT}/api`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
export { server };
