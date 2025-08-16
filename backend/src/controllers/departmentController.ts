import { Request, Response } from 'express';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError, ConflictError, ValidationError } from '@/middleware/errorHandler';
import { authLogger } from '@/utils/logger';
import { z } from 'zod';

// Validation schemas
const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  code: z.string().min(2, 'Department code must be at least 2 characters'),
  parentId: z.string().cuid().optional(),
  headUserId: z.string().cuid().optional(),
  isActive: z.boolean().default(true),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').optional(),
  displayName: z.string().min(1, 'Display name is required').optional(),
  description: z.string().optional(),
  code: z.string().min(2, 'Department code must be at least 2 characters').optional(),
  parentId: z.string().cuid().optional(),
  headUserId: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
});

const assignMemberSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1, 'At least one user is required'),
  role: z.enum(['member', 'manager', 'admin']).default('member'),
});

export class DepartmentController {
  /**
   * Get all departments with hierarchy
   */
  static getDepartments = asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const parentId = req.query.parentId as string;

    const where: any = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }

    if (parentId !== undefined) {
      where.parentId = parentId || null;
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        parent: true,
        children: {
          where: includeInactive ? {} : { isActive: true },
        },
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        userDepartments: {
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
        teams: {
          where: includeInactive ? {} : { isActive: true },
          select: {
            id: true,
            name: true,
            displayName: true,
            code: true,
            teamType: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            userDepartments: true,
            teams: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform data to include member counts and roles
    const transformedDepartments = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      displayName: dept.displayName,
      description: dept.description,
      code: dept.code,
      isActive: dept.isActive,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
      parent: dept.parent,
      children: dept.children,
      head: dept.head,
      teams: dept.teams,
      members: dept.userDepartments.map(ud => ({
        ...ud.user,
        role: ud.role,
        isPrimary: ud.isPrimary,
        joinedAt: ud.assignedAt,
      })),
      stats: {
        totalMembers: dept._count.userDepartments,
        totalTeams: dept._count.teams,
      },
    }));

    res.status(200).json({
      success: true,
      message: 'Departments retrieved successfully',
      data: { departments: transformedDepartments },
    });
  });

  /**
   * Get department by ID
   */
  static getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
        },
        headUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        userDepartments: {
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
        teams: {
          where: { isActive: true },
          include: {
            userTeams: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    // Transform data
    const transformedDepartment = {
      id: department.id,
      name: department.name,
      displayName: department.displayName,
      description: department.description,
      code: department.code,
      isActive: department.isActive,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      parent: department.parent,
      children: department.children,
      head: department.head,
      members: department.userDepartments.map(ud => ({
        ...ud.user,
        role: ud.role,
        isPrimary: ud.isPrimary,
        joinedAt: ud.assignedAt,
      })),
      teams: department.teams.map(team => ({
        ...team,
        members: team.userTeams.map(ut => ({
          ...ut.user,
          role: ut.role,
        })),
      })),
    };

    res.status(200).json({
      success: true,
      message: 'Department retrieved successfully',
      data: { department: transformedDepartment },
    });
  });

  /**
   * Create new department
   */
  static createDepartment = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createDepartmentSchema.parse(req.body);

    // Check if department name already exists
    const existingName = await prisma.department.findUnique({
      where: { name: validatedData.name },
    });

    if (existingName) {
      throw new ConflictError('Department name already exists');
    }

    // Check if department code already exists
    const existingCode = await prisma.department.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCode) {
      throw new ConflictError('Department code already exists');
    }

    // Validate parent department if provided
    if (validatedData.parentId) {
      const parentDept = await prisma.department.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentDept) {
        throw new ValidationError('Parent department not found');
      }
    }

    // Validate head user if provided
    if (validatedData.headUserId) {
      const headUser = await prisma.user.findUnique({
        where: { id: validatedData.headUserId },
      });

      if (!headUser) {
        throw new ValidationError('Head user not found');
      }
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        ...validatedData,
        createdBy: req.user?.id,
      },
      include: {
        parent: true,
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    authLogger.info('Department created', {
      departmentId: department.id,
      name: department.name,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department },
    });
  });

  /**
   * Update department
   */
  static updateDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = updateDepartmentSchema.parse(req.body);

    // Check if department exists
    const existingDept = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDept) {
      throw new NotFoundError('Department not found');
    }

    // Check name uniqueness if updating name
    if (validatedData.name && validatedData.name !== existingDept.name) {
      const nameExists = await prisma.department.findUnique({
        where: { name: validatedData.name },
      });

      if (nameExists) {
        throw new ConflictError('Department name already exists');
      }
    }

    // Check code uniqueness if updating code
    if (validatedData.code && validatedData.code !== existingDept.code) {
      const codeExists = await prisma.department.findUnique({
        where: { code: validatedData.code },
      });

      if (codeExists) {
        throw new ConflictError('Department code already exists');
      }
    }

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        ...validatedData,
        updatedBy: req.user?.id,
      },
      include: {
        parent: true,
        head: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    authLogger.info('Department updated', {
      departmentId: id,
      updatedBy: req.user?.id,
      changes: Object.keys(validatedData),
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: { department: updatedDepartment },
    });
  });

  /**
   * Delete department (soft delete)
   */
  static deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        children: true,
        teams: true,
        userDepartments: true,
      },
    });

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    // Check if department has active children
    const activeChildren = department.children.filter(child => child.isActive);
    if (activeChildren.length > 0) {
      throw new ValidationError('Cannot delete department with active sub-departments');
    }

    // Check if department has active teams
    const activeTeams = department.teams.filter(team => team.isActive);
    if (activeTeams.length > 0) {
      throw new ValidationError('Cannot delete department with active teams');
    }

    // Soft delete by deactivating
    await prisma.department.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: req.user?.id,
      },
    });

    authLogger.info('Department deleted (deactivated)', {
      departmentId: id,
      deletedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  });

  /**
   * Assign members to department
   */
  static assignMembers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = assignMemberSchema.parse(req.body);

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    // Validate users exist
    const users = await prisma.user.findMany({
      where: { id: { in: validatedData.userIds } },
    });

    if (users.length !== validatedData.userIds.length) {
      throw new ValidationError('One or more users not found');
    }

    // Assign users to department
    await prisma.$transaction(async (tx) => {
      // Remove existing assignments for these users in this department
      await tx.userDepartment.deleteMany({
        where: {
          departmentId: id,
          userId: { in: validatedData.userIds },
        },
      });

      // Create new assignments
      await tx.userDepartment.createMany({
        data: validatedData.userIds.map(userId => ({
          userId,
          departmentId: id,
          role: validatedData.role,
          assignedBy: req.user?.id,
        })),
      });
    });

    authLogger.info('Department members assigned', {
      departmentId: id,
      userIds: validatedData.userIds,
      role: validatedData.role,
      assignedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Members assigned to department successfully',
    });
  });

  /**
   * Remove member from department
   */
  static removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { id, userId } = req.params;

    // Check if assignment exists
    const assignment = await prisma.userDepartment.findFirst({
      where: {
        departmentId: id,
        userId,
      },
    });

    if (!assignment) {
      throw new NotFoundError('User is not a member of this department');
    }

    // Remove assignment
    await prisma.userDepartment.delete({
      where: { id: assignment.id },
    });

    authLogger.info('Department member removed', {
      departmentId: id,
      userId,
      removedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Member removed from department successfully',
    });
  });
}
