import { Request, Response } from 'express';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError, ConflictError, ValidationError } from '@/middleware/errorHandler';
import { authLogger } from '@/utils/logger';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  departmentId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  roleIds: z.array(z.string().cuid()).min(1, 'At least one role is required'),
});

const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  departmentId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
});

const assignRoleSchema = z.object({
  roleIds: z.array(z.string().cuid()).min(1, 'At least one role is required'),
});

export class UserController {
  /**
   * Get all users with pagination and filtering
   */
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const departmentId = req.query.departmentId as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId) {
      where.userDepartments = {
        some: { departmentId }
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get users with relations
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
          userDepartments: {
            include: {
              department: true,
            },
          },
          userTeams: {
            include: {
              team: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Transform data to remove sensitive information
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map(ur => ur.role),
      departments: user.userDepartments.map(ud => ({
        ...ud.department,
        role: ud.role,
        isPrimary: ud.isPrimary,
      })),
      teams: user.userTeams.map(ut => ({
        ...ut.team,
        role: ut.role,
      })),
    }));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: transformedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  });

  /**
   * Get user by ID
   */
  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        userDepartments: {
          include: {
            department: true,
          },
        },
        userTeams: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Transform data
    const transformedUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map(ur => ur.role),
      permissions: user.userRoles.flatMap(ur =>
        ur.role.permissions.map(rp => rp.permission)
      ),
      departments: user.userDepartments.map(ud => ({
        ...ud.department,
        role: ud.role,
        isPrimary: ud.isPrimary,
      })),
      teams: user.userTeams.map(ut => ({
        ...ut.team,
        role: ut.role,
      })),
    };

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user: transformedUser },
    });
  });

  /**
   * Create new user (Admin only)
   */
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createUserSchema.parse(req.body);

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Validate roles exist
    const roles = await prisma.role.findMany({
      where: { id: { in: validatedData.roleIds } },
    });

    if (roles.length !== validatedData.roleIds.length) {
      throw new ValidationError('One or more roles not found');
    }

    // Create user in transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: validatedData.email,
          username: validatedData.username,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone,
          createdBy: req.user?.id,
        },
      });

      // Assign roles
      await tx.userRole.createMany({
        data: validatedData.roleIds.map(roleId => ({
          userId: newUser.id,
          roleId,
          assignedBy: req.user?.id,
        })),
      });

      // Assign to department if provided
      if (validatedData.departmentId) {
        await tx.userDepartment.create({
          data: {
            userId: newUser.id,
            departmentId: validatedData.departmentId,
            role: 'member',
            assignedBy: req.user?.id,
          },
        });
      }

      // Assign to team if provided
      if (validatedData.teamId) {
        await tx.userTeam.create({
          data: {
            userId: newUser.id,
            teamId: validatedData.teamId,
            role: 'member',
            assignedBy: req.user?.id,
          },
        });
      }

      return newUser;
    });

    authLogger.info('User created', {
      userId: user.id,
      email: user.email,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user },
    });
  });

  /**
   * Update user
   */
  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if updating email
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        throw new ConflictError('Email already registered');
      }
    }

    // Check username uniqueness if updating username
    if (validatedData.username && validatedData.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: validatedData.username },
      });

      if (usernameExists) {
        throw new ConflictError('Username already taken');
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...validatedData,
        updatedBy: req.user?.id,
      },
    });

    authLogger.info('User updated', {
      userId: id,
      updatedBy: req.user?.id,
      changes: Object.keys(validatedData),
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser },
    });
  });

  /**
   * Delete user (soft delete)
   */
  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: req.user?.id,
      },
    });

    authLogger.info('User deleted (deactivated)', {
      userId: id,
      deletedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  });

  /**
   * Assign roles to user
   */
  static assignRoles = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = assignRoleSchema.parse(req.body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate roles exist
    const roles = await prisma.role.findMany({
      where: { id: { in: validatedData.roleIds } },
    });

    if (roles.length !== validatedData.roleIds.length) {
      throw new ValidationError('One or more roles not found');
    }

    // Remove existing roles and assign new ones
    await prisma.$transaction(async (tx) => {
      // Remove existing roles
      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      // Assign new roles
      await tx.userRole.createMany({
        data: validatedData.roleIds.map(roleId => ({
          userId: id,
          roleId,
          assignedBy: req.user?.id,
        })),
      });
    });

    authLogger.info('User roles updated', {
      userId: id,
      roleIds: validatedData.roleIds,
      updatedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'User roles updated successfully',
    });
  });

  /**
   * Get user permissions
   */
  static getUserPermissions = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      throw new NotFoundError('User not found');
    }

    // Extract unique permissions
    const permissions = user.userRoles.flatMap(ur =>
      ur.role.permissions.map(rp => rp.permission)
    );

    const uniquePermissions = permissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );

    res.status(200).json({
      success: true,
      message: 'User permissions retrieved successfully',
      data: {
        permissions: uniquePermissions,
        roles: user.userRoles.map(ur => ur.role),
      },
    });
  });
}
