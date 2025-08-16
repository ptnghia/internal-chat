import { Router } from 'express';
import { TaskController } from '@/controllers/taskController';
import { authenticate } from '@/middleware/auth';
import { requirePermissions } from '@/middleware/permissions';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// ================================
// TASK MANAGEMENT ROUTES
// ================================

/**
 * @route   GET /api/tasks
 * @desc    Get tasks with filtering and pagination
 * @access  Private (requires tasks.read permission)
 */
router.get('/', 
  requirePermissions(['tasks.read']), 
  TaskController.getTasks
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private (requires tasks.read permission)
 */
router.get('/:id', 
  requirePermissions(['tasks.read']), 
  TaskController.getTaskById
);

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Private (requires tasks.create permission)
 */
router.post('/', 
  requirePermissions(['tasks.create']), 
  TaskController.createTask
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private (requires tasks.update permission)
 */
router.put('/:id', 
  requirePermissions(['tasks.update']), 
  TaskController.updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (soft delete)
 * @access  Private (requires tasks.delete permission)
 */
router.delete('/:id', 
  requirePermissions(['tasks.delete']), 
  TaskController.deleteTask
);

/**
 * @route   POST /api/tasks/:id/assign
 * @desc    Assign task to user
 * @access  Private (requires tasks.assign permission)
 */
router.post('/:id/assign', 
  requirePermissions(['tasks.assign']), 
  TaskController.assignTask
);

/**
 * @route   PUT /api/tasks/:id/status
 * @desc    Update task status
 * @access  Private (requires tasks.update permission)
 */
router.put('/:id/status', 
  requirePermissions(['tasks.update']), 
  TaskController.updateTaskStatus
);

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add comment to task
 * @access  Private (requires tasks.read permission)
 */
router.post('/:id/comments', 
  requirePermissions(['tasks.read']), 
  TaskController.addComment
);

export default router;
