import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from './errorHandler';
import { authLogger } from '@/utils/logger';

/**
 * Middleware to check if user has required permissions
 */
export const requirePermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      // Check if user has required permissions
      const userPermissions = req.user.permissions || [];
      
      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(permission =>
          !userPermissions.includes(permission)
        );

        authLogger.warn('Permission denied', {
          userId: req.user.id,
          requiredPermissions,
          missingPermissions,
          userPermissions: userPermissions.length,
          path: req.path,
          method: req.method,
        });

        throw new AuthorizationError(
          `Insufficient permissions. Missing: ${missingPermissions.join(', ')}`
        );
      }

      authLogger.debug('Permission granted', {
        userId: req.user.id,
        requiredPermissions,
        path: req.path,
        method: req.method,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of the required permissions
 */
export const requireAnyPermission = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      // Check if user has any of the required permissions
      const userPermissions = req.user.permissions || [];
      
      const hasAnyPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAnyPermission) {
        authLogger.warn('Permission denied (any)', {
          userId: req.user.id,
          requiredPermissions,
          userPermissions: userPermissions.length,
          path: req.path,
          method: req.method,
        });

        throw new AuthorizationError(
          `Insufficient permissions. Required any of: ${requiredPermissions.join(', ')}`
        );
      }

      authLogger.debug('Permission granted (any)', {
        userId: req.user.id,
        requiredPermissions,
        path: req.path,
        method: req.method,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has required roles
 */
export const requireRoles = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      // Check if user has required roles
      const userRoles = req.user.roles || [];
      
      const hasRequiredRole = requiredRoles.some(role =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        authLogger.warn('Role access denied', {
          userId: req.user.id,
          requiredRoles,
          userRoles,
          path: req.path,
          method: req.method,
        });

        throw new AuthorizationError(
          `Insufficient role. Required any of: ${requiredRoles.join(', ')}`
        );
      }

      authLogger.debug('Role access granted', {
        userId: req.user.id,
        requiredRoles,
        userRoles,
        path: req.path,
        method: req.method,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is admin (has ADMIN or SUPER_ADMIN role)
 */
export const requireAdmin = requireRoles(['ADMIN', 'SUPER_ADMIN']);

/**
 * Middleware to check if user is super admin
 */
export const requireSuperAdmin = requireRoles(['SUPER_ADMIN']);

/**
 * Middleware to check if user owns the resource or has admin permissions
 */
export const requireOwnershipOrAdmin = (userIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      const resourceUserId = req.params[userIdParam];
      const currentUserId = req.user.id;
      const userRoles = req.user.roles || [];

      // Check if user owns the resource
      const isOwner = resourceUserId === currentUserId;
      
      // Check if user is admin
      const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');

      if (!isOwner && !isAdmin) {
        authLogger.warn('Ownership/Admin access denied', {
          userId: currentUserId,
          resourceUserId,
          userRoles,
          path: req.path,
          method: req.method,
        });

        throw new AuthorizationError('Access denied. You can only access your own resources or need admin privileges.');
      }

      authLogger.debug('Ownership/Admin access granted', {
        userId: currentUserId,
        resourceUserId,
        isOwner,
        isAdmin,
        path: req.path,
        method: req.method,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};
