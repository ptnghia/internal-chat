import { Request, Response } from 'express';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError, ConflictError, ValidationError, AuthorizationError } from '@/middleware/errorHandler';
import { authLogger } from '@/utils/logger';
import { z } from 'zod';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  type: z.enum(['epic', 'story', 'task', 'subtask', 'bug']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'review', 'testing', 'done', 'cancelled']).default('todo'),
  departmentId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  reporterId: z.string().cuid().optional(),
  parentId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'testing', 'done', 'cancelled']).optional(),
  assigneeId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
});

const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
});

export class TaskController {
  /**
   * Get tasks with filtering and pagination
   */
  static getTasks = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const type = req.query.type as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const assigneeId = req.query.assigneeId as string;
    const departmentId = req.query.departmentId as string;
    const teamId = req.query.teamId as string;
    const search = req.query.search as string;

    const where: any = { isArchived: false };

    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (departmentId) where.departmentId = departmentId;
    if (teamId) where.teamId = teamId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignments: {
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
          department: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
          parent: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
          children: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
            },
            where: { isArchived: false },
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
              children: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.task.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: {
        tasks,
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
   * Get task by ID
   */
  static getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            priority: true,
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          where: { isArchived: false },
          orderBy: { createdAt: 'asc' },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            url: true,
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: { task },
    });
  });

  /**
   * Create new task
   */
  static createTask = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createTaskSchema.parse(req.body);
    const userId = req.user?.id;

    // Validate department if provided
    if (validatedData.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: validatedData.departmentId },
      });

      if (!department) {
        throw new ValidationError('Department not found');
      }
    }

    // Validate team if provided
    if (validatedData.teamId) {
      const team = await prisma.team.findUnique({
        where: { id: validatedData.teamId },
      });

      if (!team) {
        throw new ValidationError('Team not found');
      }
    }

    // Validate assignee if provided
    if (validatedData.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: validatedData.assigneeId },
      });

      if (!assignee) {
        throw new ValidationError('Assignee not found');
      }
    }

    // Validate parent task if provided
    if (validatedData.parentId) {
      const parentTask = await prisma.task.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentTask) {
        throw new ValidationError('Parent task not found');
      }

      // Validate task hierarchy (subtasks can only be under tasks/stories)
      if (validatedData.type === 'subtask' && !['task', 'story'].includes(parentTask.type)) {
        throw new ValidationError('Subtasks can only be created under tasks or stories');
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        reporterId: validatedData.reporterId || userId,
        createdBy: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    authLogger.info('Task created', {
      taskId: task.id,
      title: task.title,
      type: task.type,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  });

  /**
   * Update task
   */
  static updateTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = updateTaskSchema.parse(req.body);
    const userId = req.user?.id;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    // Validate assignee if provided
    if (validatedData.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: validatedData.assigneeId },
      });

      if (!assignee) {
        throw new ValidationError('Assignee not found');
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        updatedBy: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    authLogger.info('Task updated', {
      taskId: id,
      updatedBy: userId,
      changes: Object.keys(validatedData),
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
    });
  });

  /**
   * Delete task (soft delete)
   */
  static deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        children: { where: { isArchived: false } },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if task has active subtasks
    if (task.children.length > 0) {
      throw new ValidationError('Cannot delete task with active subtasks');
    }

    // Archive task
    await prisma.task.update({
      where: { id },
      data: {
        isArchived: true,
        updatedBy: userId,
      },
    });

    authLogger.info('Task deleted', {
      taskId: id,
      deletedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  });

  /**
   * Assign task to user
   */
  static assignTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { assigneeId } = req.body;
    const userId = req.user?.id;

    // Validate assignee
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        throw new ValidationError('Assignee not found');
      }
    }

    // Update task assignee
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        assigneeId: assigneeId || null,
        updatedBy: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    authLogger.info('Task assigned', {
      taskId: id,
      assigneeId,
      assignedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: assigneeId ? 'Task assigned successfully' : 'Task unassigned successfully',
      data: { task: updatedTask },
    });
  });

  /**
   * Update task status
   */
  static updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    // Validate status
    const validStatuses = ['todo', 'in_progress', 'review', 'testing', 'done', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        updatedBy: userId,
        completedAt: status === 'done' ? new Date() : null,
      },
    });

    authLogger.info('Task status updated', {
      taskId: id,
      status,
      updatedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: { task: updatedTask },
    });
  });

  /**
   * Add comment to task
   */
  static addComment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = addCommentSchema.parse(req.body);
    const userId = req.user?.id;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Create comment
    const comment = await prisma.taskComment.create({
      data: {
        content: validatedData.content,
        taskId: id,
        authorId: userId!,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    authLogger.info('Task comment added', {
      taskId: id,
      commentId: comment.id,
      authorId: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment },
    });
  });
}
