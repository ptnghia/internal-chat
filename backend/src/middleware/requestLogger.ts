import { Request, Response, NextFunction } from 'express';
import { logRequest, createTimer } from '@/utils/logger';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Skip logging for health checks in production
  if (process.env.NODE_ENV === 'production' && req.path === '/health') {
    return next();
  }

  // Create timer to measure response time
  const timer = createTimer(`${req.method} ${req.path}`);
  
  // Store start time
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log the request
    logRequest(req, res, responseTime);
    
    // End timer
    timer.end();
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestLogger;
