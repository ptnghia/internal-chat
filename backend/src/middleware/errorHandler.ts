import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger, logError } from '@/utils/logger';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    details?: any;
    stack?: string;
  };
}

// Handle Prisma errors
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field ? field[0] : 'field';
      return new AppError(
        `A record with this ${fieldName} already exists`,
        409,
        'DUPLICATE_ENTRY'
      );

    case 'P2025':
      // Record not found
      return new AppError(
        'The requested record was not found',
        404,
        'RECORD_NOT_FOUND'
      );

    case 'P2003':
      // Foreign key constraint violation
      return new AppError(
        'Cannot delete record due to related data',
        409,
        'FOREIGN_KEY_CONSTRAINT'
      );

    case 'P2014':
      // Required relation violation
      return new AppError(
        'The change you are trying to make would violate the required relation',
        400,
        'REQUIRED_RELATION_VIOLATION'
      );

    case 'P2021':
      // Table does not exist
      return new AppError(
        'Database table does not exist',
        500,
        'TABLE_NOT_FOUND'
      );

    case 'P2022':
      // Column does not exist
      return new AppError(
        'Database column does not exist',
        500,
        'COLUMN_NOT_FOUND'
      );

    default:
      return new AppError(
        'Database operation failed',
        500,
        'DATABASE_ERROR'
      );
  }
};

// Handle Zod validation errors
const handleZodError = (error: ZodError): AppError => {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return new AppError(
    'Validation failed',
    400,
    'VALIDATION_ERROR'
  );
};

// Handle JWT errors
const handleJWTError = (error: Error): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
  }

  return new AppError('Authentication failed', 401, 'AUTH_ERROR');
};

// Handle multer errors
const handleMulterError = (error: any): AppError => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError(
      'File size too large',
      413,
      'FILE_TOO_LARGE'
    );
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError(
      'Too many files uploaded',
      413,
      'TOO_MANY_FILES'
    );
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError(
      'Unexpected file field',
      400,
      'UNEXPECTED_FILE'
    );
  }

  return new AppError(
    'File upload failed',
    400,
    'UPLOAD_ERROR'
  );
};

// Send error response in development
const sendErrorDev = (err: AppError, req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      stack: err.stack,
      details: err,
    },
  };

  res.status(err.statusCode).json(errorResponse);
};

// Send error response in production
const sendErrorProd = (err: AppError, req: Request, res: Response): void => {
  // Only send operational errors to client in production
  if (err.isOperational) {
    const errorResponse: ErrorResponse = {
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      },
    };

    res.status(err.statusCode).json(errorResponse);
  } else {
    // Log error and send generic message
    logError(err, 'UNHANDLED_ERROR', {
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user?.id,
    });

    const errorResponse: ErrorResponse = {
      error: {
        message: 'Something went wrong',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      },
    };

    res.status(500).json(errorResponse);
  }
};

// Main error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err as AppError;

  // Set default values if not an AppError
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  if (!error.isOperational) {
    error.isOperational = false;
  }

  // Handle specific error types
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new AppError('Invalid data provided', 400, 'VALIDATION_ERROR');
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.name === 'MulterError') {
    error = handleMulterError(err);
  } else if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', 400, 'INVALID_ID');
  }

  // Log error
  logError(error, 'ERROR_HANDLER', {
    path: req.path,
    method: req.method,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    user: (req as any).user?.id,
  });

  // Send appropriate response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create specific error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

// Export error handler as default
export default errorHandler;
