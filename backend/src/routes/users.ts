import { Router } from 'express';
import { UserController } from '@/controllers/userController';
import { authenticate } from '@/middleware/auth';
import { requirePermissions } from '@/middleware/permissions';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// ================================
// USER MANAGEMENT ROUTES
// ================================

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (requires users.read permission)
 */
router.get('/', 
  requirePermissions(['users.read']), 
  UserController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (requires users.read permission)
 */
router.get('/:id', 
  requirePermissions(['users.read']), 
  UserController.getUserById
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (requires users.create permission)
 */
router.post('/', 
  requirePermissions(['users.create']), 
  UserController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (requires users.update permission)
 */
router.put('/:id', 
  requirePermissions(['users.update']), 
  UserController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (requires users.delete permission)
 */
router.delete('/:id', 
  requirePermissions(['users.delete']), 
  UserController.deleteUser
);

/**
 * @route   POST /api/users/:id/roles
 * @desc    Assign roles to user
 * @access  Private (requires users.manage_roles permission)
 */
router.post('/:id/roles', 
  requirePermissions(['users.manage_roles']), 
  UserController.assignRoles
);

/**
 * @route   GET /api/users/:id/permissions
 * @desc    Get user permissions
 * @access  Private (requires users.read permission)
 */
router.get('/:id/permissions', 
  requirePermissions(['users.read']), 
  UserController.getUserPermissions
);

export default router;
