import { Request, Response } from 'express';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError, ConflictError, ValidationError } from '@/middleware/errorHandler';
import { authLogger } from '@/utils/logger';
import { z } from 'zod';

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  code: z.string().min(2, 'Team code must be at least 2 characters').optional(),
  color: z.string().optional(),
  departmentId: z.string().cuid('Invalid department ID'),
  isPublic: z.boolean().default(true),
  maxMembers: z.number().int().positive().optional(),
  teamType: z.enum(['permanent', 'temporary', 'project']).default('permanent'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  leadUserId: z.string().cuid().optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').optional(),
  displayName: z.string().min(1, 'Display name is required').optional(),
  description: z.string().optional(),
  code: z.string().min(2, 'Team code must be at least 2 characters').optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  maxMembers: z.number().int().positive().optional(),
  teamType: z.enum(['permanent', 'temporary', 'project']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  leadUserId: z.string().cuid().optional(),
});

const assignMemberSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1, 'At least one user is required'),
  role: z.enum(['member', 'lead', 'admin']).default('member'),
});

export class TeamController {
  /**
   * Get all teams with filtering
   */
  static getTeams = asyncHandler(async (req: Request, res: Response) => {
    const departmentId = req.query.departmentId as string;
    const teamType = req.query.teamType as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const includeInactive = req.query.includeInactive === 'true';

    const where: any = {};
    
    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (teamType) {
      where.teamType = teamType;
    }

    if (!includeInactive) {
      where.isActive = true;
    } else if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const teams = await prisma.team.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            displayName: true,
            code: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        userTeams: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: {
            userTeams: true,
            chats: true,
            tasks: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform data
    const transformedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      displayName: team.displayName,
      description: team.description,
      code: team.code,
      color: team.color,
      isActive: team.isActive,
      isPublic: team.isPublic,
      maxMembers: team.maxMembers,
      teamType: team.teamType,
      startDate: team.startDate,
      endDate: team.endDate,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      department: team.department,
      lead: team.lead,
      members: team.userTeams.map(ut => ({
        ...ut.user,
        role: ut.role,
        joinedAt: ut.assignedAt,
      })),
      stats: {
        totalMembers: team._count.userTeams,
        totalChats: team._count.chats,
        totalTasks: team._count.tasks,
      },
    }));

    res.status(200).json({
      success: true,
      message: 'Teams retrieved successfully',
      data: { teams: transformedTeams },
    });
  });

  /**
   * Get team by ID
   */
  static getTeamById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            displayName: true,
            code: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        userTeams: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                isActive: true,
              },
            },
          },
        },
        chats: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            type: true,
            isPrivate: true,
            createdAt: true,
          },
        },
        tasks: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Transform data
    const transformedTeam = {
      id: team.id,
      name: team.name,
      displayName: team.displayName,
      description: team.description,
      code: team.code,
      color: team.color,
      isActive: team.isActive,
      isPublic: team.isPublic,
      maxMembers: team.maxMembers,
      teamType: team.teamType,
      startDate: team.startDate,
      endDate: team.endDate,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      department: team.department,
      lead: team.lead,
      members: team.userTeams.map(ut => ({
        ...ut.user,
        role: ut.role,
        joinedAt: ut.assignedAt,
      })),
      chats: team.chats,
      recentTasks: team.tasks,
    };

    res.status(200).json({
      success: true,
      message: 'Team retrieved successfully',
      data: { team: transformedTeam },
    });
  });

  /**
   * Create new team
   */
  static createTeam = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createTeamSchema.parse(req.body);

    // Validate department exists
    const department = await prisma.department.findUnique({
      where: { id: validatedData.departmentId },
    });

    if (!department) {
      throw new ValidationError('Department not found');
    }

    // Check if team name already exists in department
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: validatedData.name,
        departmentId: validatedData.departmentId,
      },
    });

    if (existingTeam) {
      throw new ConflictError('Team name already exists in this department');
    }

    // Validate lead user if provided
    if (validatedData.leadUserId) {
      const leadUser = await prisma.user.findUnique({
        where: { id: validatedData.leadUserId },
      });

      if (!leadUser) {
        throw new ValidationError('Lead user not found');
      }
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        createdBy: req.user?.id,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            displayName: true,
            code: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    authLogger.info('Team created', {
      teamId: team.id,
      name: team.name,
      departmentId: team.departmentId,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team },
    });
  });

  /**
   * Update team
   */
  static updateTeam = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = updateTeamSchema.parse(req.body);

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id },
    });

    if (!existingTeam) {
      throw new NotFoundError('Team not found');
    }

    // Check name uniqueness if updating name
    if (validatedData.name && validatedData.name !== existingTeam.name) {
      const nameExists = await prisma.team.findFirst({
        where: {
          name: validatedData.name,
          departmentId: existingTeam.departmentId,
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new ConflictError('Team name already exists in this department');
      }
    }

    // Validate lead user if provided
    if (validatedData.leadUserId) {
      const leadUser = await prisma.user.findUnique({
        where: { id: validatedData.leadUserId },
      });

      if (!leadUser) {
        throw new ValidationError('Lead user not found');
      }
    }

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        updatedBy: req.user?.id,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            displayName: true,
            code: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    authLogger.info('Team updated', {
      teamId: id,
      updatedBy: req.user?.id,
      changes: Object.keys(validatedData),
    });

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: { team: updatedTeam },
    });
  });

  /**
   * Delete team (soft delete)
   */
  static deleteTeam = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        userTeams: true,
        chats: { where: { isActive: true } },
        tasks: { where: { isActive: true } },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if team has active chats or tasks
    if (team.chats.length > 0 || team.tasks.length > 0) {
      throw new ValidationError('Cannot delete team with active chats or tasks');
    }

    // Soft delete by deactivating
    await prisma.team.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: req.user?.id,
      },
    });

    authLogger.info('Team deleted (deactivated)', {
      teamId: id,
      deletedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  });

  /**
   * Assign members to team
   */
  static assignMembers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = assignMemberSchema.parse(req.body);

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        userTeams: true,
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check max members limit
    if (team.maxMembers && team.userTeams.length + validatedData.userIds.length > team.maxMembers) {
      throw new ValidationError(`Team has reached maximum capacity of ${team.maxMembers} members`);
    }

    // Validate users exist
    const users = await prisma.user.findMany({
      where: { id: { in: validatedData.userIds } },
    });

    if (users.length !== validatedData.userIds.length) {
      throw new ValidationError('One or more users not found');
    }

    // Assign users to team
    await prisma.$transaction(async (tx) => {
      // Remove existing assignments for these users in this team
      await tx.userTeam.deleteMany({
        where: {
          teamId: id,
          userId: { in: validatedData.userIds },
        },
      });

      // Create new assignments
      await tx.userTeam.createMany({
        data: validatedData.userIds.map(userId => ({
          userId,
          teamId: id,
          role: validatedData.role,
          assignedBy: req.user?.id,
        })),
      });
    });

    authLogger.info('Team members assigned', {
      teamId: id,
      userIds: validatedData.userIds,
      role: validatedData.role,
      assignedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Members assigned to team successfully',
    });
  });

  /**
   * Remove member from team
   */
  static removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { id, userId } = req.params;

    // Check if assignment exists
    const assignment = await prisma.userTeam.findFirst({
      where: {
        teamId: id,
        userId,
      },
    });

    if (!assignment) {
      throw new NotFoundError('User is not a member of this team');
    }

    // Remove assignment
    await prisma.userTeam.delete({
      where: { id: assignment.id },
    });

    authLogger.info('Team member removed', {
      teamId: id,
      userId,
      removedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Member removed from team successfully',
    });
  });
}
