import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from '@/utils/jwt';
import { prisma } from '@/utils/database';
import { authLogger, logAuth } from '@/utils/logger';
import { AuthenticationError, AuthorizationError } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        roles: string[];
        permissions: string[];
        isActive: boolean;
        isEmailVerified: boolean;
        lastLoginAt?: Date;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      logAuth('token_missing', undefined, false, {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      throw new AuthenticationError('Access token required');
    }

    // Verify token
    let payload: JWTPayload;
    try {
      payload = JWTUtils.verifyAccessToken(token);
    } catch (error) {
      logAuth('token_invalid', undefined, false, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AuthenticationError('Invalid or expired token');
    }

    // Get user from database with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      logAuth('user_not_found', payload.userId, false, {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      throw new AuthenticationError('User not found');
    }

    if (!user.isActive) {
      logAuth('user_inactive', user.id, false, {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      throw new AuthenticationError('Account is deactivated');
    }

    // Extract roles and permissions
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur =>
      ur.role.permissions.map(rp => rp.permission.name)
    );

    // Remove duplicates
    const uniquePermissions = [...new Set(permissions)];

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      permissions: uniquePermissions,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
    };

    logAuth('authentication_success', user.id, true, {
      path: req.path,
      method: req.method,
      ip: req.ip,
      roles: roles.length,
      permissions: uniquePermissions.length,
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware - doesn't throw if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    // Try to authenticate, but don't throw on failure
    try {
      await authenticate(req, res, () => {});
    } catch (error) {
      // Log but don't throw
      authLogger.debug('Optional authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware - checks if user has required permissions
 */
export const authorize = (requiredPermissions: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      const hasPermission = permissions.every(permission =>
        req.user!.permissions.includes(permission)
      );

      if (!hasPermission) {
        logAuth('authorization_failed', req.user.id, false, {
          path: req.path,
          method: req.method,
          requiredPermissions: permissions,
          userPermissions: req.user.permissions,
        });
        throw new AuthorizationError('Insufficient permissions');
      }

      logAuth('authorization_success', req.user.id, true, {
        path: req.path,
        method: req.method,
        requiredPermissions: permissions,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (requiredRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const hasRole = roles.some(role => req.user!.roles.includes(role));

      if (!hasRole) {
        logAuth('role_authorization_failed', req.user.id, false, {
          path: req.path,
          method: req.method,
          requiredRoles: roles,
          userRoles: req.user.roles,
        });
        throw new AuthorizationError('Insufficient role permissions');
      }

      logAuth('role_authorization_success', req.user.id, true, {
        path: req.path,
        method: req.method,
        requiredRoles: roles,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN']);

/**
 * Manager or above middleware
 */
export const requireManager = requireRole(['MANAGER', 'ADMIN', 'SUPER_ADMIN']);

/**
 * Self or admin middleware - allows access to own resources or admin access
 */
export const requireSelfOrAdmin = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const targetUserId = req.params[userIdParam] || req.body[userIdParam];
      const isOwner = req.user.id === targetUserId;
      const isAdmin = req.user.roles.includes('ADMIN') || req.user.roles.includes('SUPER_ADMIN');

      if (!isOwner && !isAdmin) {
        logAuth('self_or_admin_authorization_failed', req.user.id, false, {
          path: req.path,
          method: req.method,
          targetUserId,
          isOwner,
          isAdmin,
        });
        throw new AuthorizationError('Access denied: can only access own resources or admin required');
      }

      logAuth('self_or_admin_authorization_success', req.user.id, true, {
        path: req.path,
        method: req.method,
        targetUserId,
        isOwner,
        isAdmin,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Email verification required middleware
 */
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!req.user.isEmailVerified) {
      logAuth('email_verification_required', req.user.id, false, {
        path: req.path,
        method: req.method,
      });
      throw new AuthorizationError('Email verification required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Rate limiting by user ID
 */
export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        return next();
      }

      const userId = req.user.id;
      const now = Date.now();
      const userLimit = userRequests.get(userId);

      if (!userLimit || now > userLimit.resetTime) {
        userRequests.set(userId, {
          count: 1,
          resetTime: now + windowMs,
        });
        return next();
      }

      if (userLimit.count >= maxRequests) {
        logAuth('rate_limit_exceeded', userId, false, {
          path: req.path,
          method: req.method,
          count: userLimit.count,
          maxRequests,
        });
        throw new AuthorizationError('Rate limit exceeded');
      }

      userLimit.count++;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export all middleware
export default {
  authenticate,
  optionalAuth,
  authorize,
  requireRole,
  requireAdmin,
  requireManager,
  requireSelfOrAdmin,
  requireEmailVerification,
  rateLimitByUser,
};
