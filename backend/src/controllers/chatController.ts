import { Request, Response } from 'express';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError, ConflictError, ValidationError, AuthorizationError } from '@/middleware/errorHandler';
import { authLogger } from '@/utils/logger';
import { z } from 'zod';

// Validation schemas
const createChatSchema = z.object({
  name: z.string().min(1, 'Chat name is required'),
  description: z.string().optional(),
  type: z.enum(['direct', 'group', 'channel', 'department', 'team']),
  isPrivate: z.boolean().default(false),
  departmentId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  memberIds: z.array(z.string().cuid()).optional(),
});

const updateChatSchema = z.object({
  name: z.string().min(1, 'Chat name is required').optional(),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

const addMembersSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1, 'At least one user is required'),
});

export class ChatController {
  /**
   * Get user's chats
   */
  static getChats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const type = req.query.type as string;
    const departmentId = req.query.departmentId as string;
    const teamId = req.query.teamId as string;

    const where: any = {
      isArchived: false,
      OR: [
        // User is a member
        { chatMembers: { some: { userId } } },
        // Public department chats where user is department member
        {
          AND: [
            { type: 'department' },
            { isPrivate: false },
            { department: { userDepartments: { some: { userId } } } },
          ],
        },
        // Public team chats where user is team member
        {
          AND: [
            { type: 'team' },
            { isPrivate: false },
            { team: { userTeams: { some: { userId } } } },
          ],
        },
      ],
    };

    if (type) {
      where.type = type;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    const chats = await prisma.chat.findMany({
      where,
      include: {
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
        chatMembers: {
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
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            type: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
            chatMembers: true,
          },
        },
      },
      orderBy: [
        { messages: { _count: 'desc' } },
        { updatedAt: 'desc' },
      ],
    });

    // Transform data
    const transformedChats = chats.map(chat => ({
      id: chat.id,
      name: chat.name,
      description: chat.description,
      type: chat.type,
      isPrivate: chat.isPrivate,
      isArchived: chat.isArchived,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      department: chat.department,
      team: chat.team,
      members: chat.chatMembers.map(cm => ({
        ...cm.user,
        role: cm.role,
        joinedAt: cm.joinedAt,
      })),
      lastMessage: chat.messages[0] || null,
      stats: {
        totalMessages: chat._count.messages,
        totalMembers: chat._count.chatMembers,
      },
    }));

    res.status(200).json({
      success: true,
      message: 'Chats retrieved successfully',
      data: { chats: transformedChats },
    });
  });

  /**
   * Get chat by ID with messages
   */
  static getChatById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Check if user has access to this chat
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
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
        chatMembers: {
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
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    // Check access permissions
    const isMember = chat.chatMembers.some(cm => cm.userId === userId);
    const isDepartmentMember = chat.type === 'department' && !chat.isPrivate && 
      await prisma.userDepartment.findFirst({
        where: { userId, departmentId: chat.departmentId || undefined },
      });
    const isTeamMember = chat.type === 'team' && !chat.isPrivate &&
      await prisma.userTeam.findFirst({
        where: { userId, teamId: chat.teamId || undefined },
      });

    if (!isMember && !isDepartmentMember && !isTeamMember) {
      throw new AuthorizationError('Access denied to this chat');
    }

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: { chatId: id },
      skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            url: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalMessages = await prisma.message.count({
      where: { chatId: id },
    });

    // Transform data
    const transformedChat = {
      id: chat.id,
      name: chat.name,
      description: chat.description,
      type: chat.type,
      isPrivate: chat.isPrivate,
      isArchived: chat.isArchived,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      department: chat.department,
      team: chat.team,
      members: chat.chatMembers.map(cm => ({
        ...cm.user,
        role: cm.role,
        joinedAt: cm.joinedAt,
      })),
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit),
      },
    };

    res.status(200).json({
      success: true,
      message: 'Chat retrieved successfully',
      data: { chat: transformedChat },
    });
  });

  /**
   * Create new chat
   */
  static createChat = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createChatSchema.parse(req.body);
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

    // Create chat in transaction
    const chat = await prisma.$transaction(async (tx) => {
      // Create chat
      const newChat = await tx.chat.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          type: validatedData.type,
          isPrivate: validatedData.isPrivate,
          departmentId: validatedData.departmentId,
          teamId: validatedData.teamId,
          createdBy: userId,
        },
      });

      // Add creator as admin member
      await tx.chatMember.create({
        data: {
          chatId: newChat.id,
          userId: userId!,
          role: 'admin',
        },
      });

      // Add additional members if provided
      if (validatedData.memberIds && validatedData.memberIds.length > 0) {
        await tx.chatMember.createMany({
          data: validatedData.memberIds.map(memberId => ({
            chatId: newChat.id,
            userId: memberId,
            role: 'member',
          })),
        });
      }

      return newChat;
    });

    authLogger.info('Chat created', {
      chatId: chat.id,
      name: chat.name,
      type: chat.type,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat },
    });
  });

  /**
   * Update chat
   */
  static updateChat = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = updateChatSchema.parse(req.body);
    const userId = req.user?.id;

    // Check if chat exists and user has admin access
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        chatMembers: {
          where: { userId },
        },
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    const userMembership = chat.chatMembers[0];
    if (!userMembership || userMembership.role !== 'admin') {
      throw new AuthorizationError('Only chat admins can update chat settings');
    }

    // Update chat
    const updatedChat = await prisma.chat.update({
      where: { id },
      data: {
        ...validatedData,
        updatedBy: userId,
      },
    });

    authLogger.info('Chat updated', {
      chatId: id,
      updatedBy: userId,
      changes: Object.keys(validatedData),
    });

    res.status(200).json({
      success: true,
      message: 'Chat updated successfully',
      data: { chat: updatedChat },
    });
  });

  /**
   * Delete chat
   */
  static deleteChat = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if chat exists and user has admin access
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        chatMembers: {
          where: { userId },
        },
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    const userMembership = chat.chatMembers[0];
    if (!userMembership || userMembership.role !== 'admin') {
      throw new AuthorizationError('Only chat admins can delete chat');
    }

    // Archive chat
    await prisma.chat.update({
      where: { id },
      data: {
        isArchived: true,
        updatedBy: userId,
      },
    });

    authLogger.info('Chat deleted', {
      chatId: id,
      deletedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully',
    });
  });

  /**
   * Add members to chat
   */
  static addMembers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = addMembersSchema.parse(req.body);
    const userId = req.user?.id;

    // Check if chat exists and user has admin access
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        chatMembers: {
          where: { userId },
        },
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    const userMembership = chat.chatMembers[0];
    if (!userMembership || (userMembership.role !== 'admin' && userMembership.role !== 'moderator')) {
      throw new AuthorizationError('Only chat admins and moderators can add members');
    }

    // Validate users exist
    const users = await prisma.user.findMany({
      where: { id: { in: validatedData.userIds } },
    });

    if (users.length !== validatedData.userIds.length) {
      throw new ValidationError('One or more users not found');
    }

    // Add members to chat
    await prisma.chatMember.createMany({
      data: validatedData.userIds.map(memberId => ({
        chatId: id,
        userId: memberId,
        role: 'member',
      })),
      skipDuplicates: true,
    });

    authLogger.info('Chat members added', {
      chatId: id,
      userIds: validatedData.userIds,
      addedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Members added to chat successfully',
    });
  });

  /**
   * Remove member from chat
   */
  static removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { id, userId: targetUserId } = req.params;
    const userId = req.user?.id;

    // Check if chat exists and user has admin access
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        chatMembers: {
          where: { userId },
        },
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    const userMembership = chat.chatMembers[0];
    if (!userMembership || (userMembership.role !== 'admin' && userId !== targetUserId)) {
      throw new AuthorizationError('Only chat admins can remove members or users can remove themselves');
    }

    // Remove member from chat
    const deletedMember = await prisma.chatMember.deleteMany({
      where: {
        chatId: id,
        userId: targetUserId,
      },
    });

    if (deletedMember.count === 0) {
      throw new NotFoundError('User is not a member of this chat');
    }

    authLogger.info('Chat member removed', {
      chatId: id,
      targetUserId,
      removedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Member removed from chat successfully',
    });
  });
}
