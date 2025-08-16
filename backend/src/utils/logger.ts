import winston from 'winston';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define transports
const transports: winston.transport[] = [];

// Console transport (always enabled in development)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_CONSOLE_LOGS === 'true') {
  transports.push(
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: consoleFormat,
    })
  );
}

// File transports
transports.push(
  // General log file
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  })
);

// Create logger instance
export const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create specialized loggers for different components
export const createComponentLogger = (component: string) => {
  return {
    error: (message: string, meta?: any) => logger.error(`[${component}] ${message}`, meta),
    warn: (message: string, meta?: any) => logger.warn(`[${component}] ${message}`, meta),
    info: (message: string, meta?: any) => logger.info(`[${component}] ${message}`, meta),
    debug: (message: string, meta?: any) => logger.debug(`[${component}] ${message}`, meta),
  };
};

// Specialized loggers for different parts of the application
export const authLogger = createComponentLogger('AUTH');
export const dbLogger = createComponentLogger('DATABASE');
export const apiLogger = createComponentLogger('API');
export const socketLogger = createComponentLogger('SOCKET');
export const fileLogger = createComponentLogger('FILE');
export const notificationLogger = createComponentLogger('NOTIFICATION');

// Helper functions for structured logging
export const logRequest = (req: any, res: any, responseTime?: number) => {
  const logData = {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    statusCode: res.statusCode,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
    userId: req.user?.id,
  };
  
  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

export const logError = (error: Error, context?: string, metadata?: any) => {
  logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
    stack: error.stack,
    name: error.name,
    ...metadata,
  });
};

export const logDatabaseQuery = (query: string, duration?: number, error?: Error) => {
  if (error) {
    dbLogger.error('Database query failed', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      error: error.message,
      duration: duration ? `${duration}ms` : undefined,
    });
  } else {
    dbLogger.debug('Database query executed', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      duration: duration ? `${duration}ms` : undefined,
    });
  }
};

export const logAuth = (action: string, userId?: string, success: boolean = true, metadata?: any) => {
  const logData = {
    action,
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...metadata,
  };
  
  if (success) {
    authLogger.info(`Auth ${action} successful`, logData);
  } else {
    authLogger.warn(`Auth ${action} failed`, logData);
  }
};

export const logSocket = (event: string, socketId: string, userId?: string, metadata?: any) => {
  socketLogger.info(`Socket ${event}`, {
    event,
    socketId,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

export const logFile = (action: string, filename: string, userId?: string, metadata?: any) => {
  fileLogger.info(`File ${action}`, {
    action,
    filename,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

export const logNotification = (action: string, recipientId: string, type: string, metadata?: any) => {
  notificationLogger.info(`Notification ${action}`, {
    action,
    recipientId,
    type,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

// Performance monitoring helpers
export const createTimer = (label: string) => {
  const start = Date.now();
  return {
    end: () => {
      const duration = Date.now() - start;
      logger.debug(`Timer [${label}]: ${duration}ms`);
      return duration;
    },
  };
};

export const measureAsync = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
  const timer = createTimer(label);
  try {
    const result = await fn();
    timer.end();
    return result;
  } catch (error) {
    timer.end();
    throw error;
  }
};

// Log application startup information
export const logStartup = (config: any) => {
  logger.info('🚀 Application starting up', {
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
    config: {
      port: config.port,
      logLevel: process.env.LOG_LEVEL || 'info',
      // Don't log sensitive information
    },
  });
};

// Export default logger
export default logger;
