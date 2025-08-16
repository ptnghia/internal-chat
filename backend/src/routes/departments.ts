import { Router } from 'express';
import { DepartmentController } from '@/controllers/departmentController';
import { authenticate } from '@/middleware/auth';
import { requirePermissions } from '@/middleware/permissions';

const router = Router();

// All department routes require authentication
router.use(authenticate);

// ================================
// DEPARTMENT MANAGEMENT ROUTES
// ================================

/**
 * @route   GET /api/departments
 * @desc    Get all departments with hierarchy
 * @access  Private (requires departments.read permission)
 */
router.get('/', 
  requirePermissions(['departments.read']), 
  DepartmentController.getDepartments
);

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Private (requires departments.read permission)
 */
router.get('/:id', 
  requirePermissions(['departments.read']), 
  DepartmentController.getDepartmentById
);

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (requires departments.create permission)
 */
router.post('/', 
  requirePermissions(['departments.create']), 
  DepartmentController.createDepartment
);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Private (requires departments.update permission)
 */
router.put('/:id', 
  requirePermissions(['departments.update']), 
  DepartmentController.updateDepartment
);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (soft delete)
 * @access  Private (requires departments.delete permission)
 */
router.delete('/:id', 
  requirePermissions(['departments.delete']), 
  DepartmentController.deleteDepartment
);

/**
 * @route   POST /api/departments/:id/members
 * @desc    Assign members to department
 * @access  Private (requires departments.manage_members permission)
 */
router.post('/:id/members', 
  requirePermissions(['departments.manage_members']), 
  DepartmentController.assignMembers
);

/**
 * @route   DELETE /api/departments/:id/members/:userId
 * @desc    Remove member from department
 * @access  Private (requires departments.manage_members permission)
 */
router.delete('/:id/members/:userId', 
  requirePermissions(['departments.manage_members']), 
  DepartmentController.removeMember
);

export default router;
