import { Router } from 'express';
import { TeamController } from '@/controllers/teamController';
import { authenticate } from '@/middleware/auth';
import { requirePermissions } from '@/middleware/permissions';

const router = Router();

// All team routes require authentication
router.use(authenticate);

// ================================
// TEAM MANAGEMENT ROUTES
// ================================

/**
 * @route   GET /api/teams
 * @desc    Get all teams with filtering
 * @access  Private (requires teams.read permission)
 */
router.get('/', 
  requirePermissions(['teams.read']), 
  TeamController.getTeams
);

/**
 * @route   GET /api/teams/:id
 * @desc    Get team by ID
 * @access  Private (requires teams.read permission)
 */
router.get('/:id', 
  requirePermissions(['teams.read']), 
  TeamController.getTeamById
);

/**
 * @route   POST /api/teams
 * @desc    Create new team
 * @access  Private (requires teams.create permission)
 */
router.post('/', 
  requirePermissions(['teams.create']), 
  TeamController.createTeam
);

/**
 * @route   PUT /api/teams/:id
 * @desc    Update team
 * @access  Private (requires teams.update permission)
 */
router.put('/:id', 
  requirePermissions(['teams.update']), 
  TeamController.updateTeam
);

/**
 * @route   DELETE /api/teams/:id
 * @desc    Delete team (soft delete)
 * @access  Private (requires teams.delete permission)
 */
router.delete('/:id', 
  requirePermissions(['teams.delete']), 
  TeamController.deleteTeam
);

/**
 * @route   POST /api/teams/:id/members
 * @desc    Assign members to team
 * @access  Private (requires teams.manage_members permission)
 */
router.post('/:id/members', 
  requirePermissions(['teams.manage_members']), 
  TeamController.assignMembers
);

/**
 * @route   DELETE /api/teams/:id/members/:userId
 * @desc    Remove member from team
 * @access  Private (requires teams.manage_members permission)
 */
router.delete('/:id/members/:userId', 
  requirePermissions(['teams.manage_members']), 
  TeamController.removeMember
);

export default router;
