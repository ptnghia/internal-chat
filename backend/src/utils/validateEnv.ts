import { z } from 'zod';
import { logger } from './logger';

// Environment variables schema
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  
  // Database configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Frontend configuration
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  
  // JWT configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // Redis configuration (optional)
  REDIS_URL: z.string().optional(),
  
  // File upload configuration
  MAX_FILE_SIZE: z.string().transform(Number).default('104857600'), // 100MB
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Email configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // External services (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Logging configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('./logs/app.log'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // CORS configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Session configuration
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),
  
  // Socket.io configuration
  SOCKET_CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Notification configuration
  NOTIFICATION_BATCH_SIZE: z.string().transform(Number).default('100'),
  NOTIFICATION_RETRY_ATTEMPTS: z.string().transform(Number).default('3'),
  
  // Security configuration
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  
  // Development configuration
  ENABLE_SWAGGER: z.string().transform(Boolean).default('true'),
  ENABLE_PLAYGROUND: z.string().transform(Boolean).default('false'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

export const validateEnv = (): EnvConfig => {
  try {
    envConfig = envSchema.parse(process.env);
    
    logger.info('✅ Environment variables validated successfully');
    
    // Log configuration (without sensitive data)
    logger.info('🔧 Server Configuration:', {
      nodeEnv: envConfig.NODE_ENV,
      port: envConfig.PORT,
      frontendUrl: envConfig.FRONTEND_URL,
      logLevel: envConfig.LOG_LEVEL,
      maxFileSize: `${envConfig.MAX_FILE_SIZE / 1024 / 1024}MB`,
      rateLimitWindow: `${envConfig.RATE_LIMIT_WINDOW_MS / 1000 / 60}min`,
      rateLimitMax: envConfig.RATE_LIMIT_MAX_REQUESTS,
      bcryptRounds: envConfig.BCRYPT_ROUNDS,
    });
    
    // Validate required directories
    validateDirectories();
    
    return envConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        logger.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      
      // Provide helpful hints for common issues
      logger.error('\n💡 Common fixes:');
      logger.error('  - Copy .env.example to .env and fill in the values');
      logger.error('  - Generate JWT secrets: openssl rand -base64 32');
      logger.error('  - Check DATABASE_URL format: postgresql://user:pass@host:port/db');
      
      process.exit(1);
    }
    
    logger.error('❌ Unexpected error during environment validation:', error);
    process.exit(1);
  }
};

const validateDirectories = () => {
  const fs = require('fs');
  const path = require('path');
  
  // Create required directories
  const requiredDirs = [
    envConfig.UPLOAD_PATH,
    path.dirname(envConfig.LOG_FILE),
    './tmp',
  ];
  
  requiredDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`📁 Created directory: ${dir}`);
    }
  });
};

export const getEnvConfig = (): EnvConfig => {
  if (!envConfig) {
    throw new Error('Environment not validated. Call validateEnv() first.');
  }
  return envConfig;
};

// Helper functions for common environment checks
export const isDevelopment = (): boolean => getEnvConfig().NODE_ENV === 'development';
export const isProduction = (): boolean => getEnvConfig().NODE_ENV === 'production';
export const isTest = (): boolean => getEnvConfig().NODE_ENV === 'test';

// Export individual config values for convenience
export const config = {
  get server() {
    const env = getEnvConfig();
    return {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
      frontendUrl: env.FRONTEND_URL,
      corsOrigin: env.CORS_ORIGIN,
    };
  },
  
  get database() {
    const env = getEnvConfig();
    return {
      url: env.DATABASE_URL,
    };
  },
  
  get jwt() {
    const env = getEnvConfig();
    return {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshSecret: env.JWT_REFRESH_SECRET,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    };
  },
  
  get upload() {
    const env = getEnvConfig();
    return {
      maxFileSize: env.MAX_FILE_SIZE,
      uploadPath: env.UPLOAD_PATH,
    };
  },
  
  get security() {
    const env = getEnvConfig();
    return {
      bcryptRounds: env.BCRYPT_ROUNDS,
      sessionSecret: env.SESSION_SECRET,
    };
  },
  
  get rateLimit() {
    const env = getEnvConfig();
    return {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    };
  },
};
