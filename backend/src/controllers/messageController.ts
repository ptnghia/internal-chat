import { Request, Response } from 'express';
import { prisma } from '@/utils/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError, ValidationError, AuthorizationError } from '@/middleware/errorHandler';
import { authLogger } from '@/utils/logger';
import { z } from 'zod';

// Validation schemas
const createMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  type: z.enum(['text', 'image', 'file', 'system', 'announcement']).default('text'),
  parentId: z.string().cuid().optional(), // For replies
});

const updateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

const reactToMessageSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required'),
});

export class MessageController {
  /**
   * Get messages in a chat
   */
  static getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Check if user has access to this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        chatMembers: {
          where: { userId },
        },
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    // Check access permissions (similar to chat access logic)
    const isMember = chat.chatMembers.length > 0;
    if (!isMember) {
      // Check if it's a public department/team chat
      const isDepartmentMember = chat.type === 'department' && !chat.isPrivate && 
        await prisma.userDepartment.findFirst({
          where: { userId, departmentId: chat.departmentId || undefined },
        });
      const isTeamMember = chat.type === 'team' && !chat.isPrivate &&
        await prisma.userTeam.findFirst({
          where: { userId, teamId: chat.teamId || undefined },
        });

      if (!isDepartmentMember && !isTeamMember) {
        throw new AuthorizationError('Access denied to this chat');
      }
    }

    // Get messages with pagination
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
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
          parent: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
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
      }),
      prisma.message.count({ where: { chatId } }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages: messages.reverse(), // Show oldest first
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
   * Create new message
   */
  static createMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const validatedData = createMessageSchema.parse(req.body);
    const userId = req.user?.id;

    // Check if user has access to this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        chatMembers: {
          where: { userId },
        },
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat not found');
    }

    // Check access permissions
    const isMember = chat.chatMembers.length > 0;
    if (!isMember) {
      const isDepartmentMember = chat.type === 'department' && !chat.isPrivate && 
        await prisma.userDepartment.findFirst({
          where: { userId, departmentId: chat.departmentId || undefined },
        });
      const isTeamMember = chat.type === 'team' && !chat.isPrivate &&
        await prisma.userTeam.findFirst({
          where: { userId, teamId: chat.teamId || undefined },
        });

      if (!isDepartmentMember && !isTeamMember) {
        throw new AuthorizationError('Access denied to this chat');
      }
    }

    // Validate parent message if replying
    if (validatedData.parentId) {
      const parentMessage = await prisma.message.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentMessage || parentMessage.chatId !== chatId) {
        throw new ValidationError('Parent message not found in this chat');
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content: validatedData.content,
        type: validatedData.type,
        chatId,
        senderId: userId!,
        parentId: validatedData.parentId,
      },
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
        parent: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Update chat's last activity
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    authLogger.info('Message created', {
      messageId: message.id,
      chatId,
      senderId: userId,
      type: validatedData.type,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message },
    });
  });

  /**
   * Update message
   */
  static updateMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = updateMessageSchema.parse(req.body);
    const userId = req.user?.id;

    // Check if message exists and user is the sender
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.senderId !== userId) {
      throw new AuthorizationError('You can only edit your own messages');
    }

    // Check if message is not too old (e.g., 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      throw new ValidationError('Messages can only be edited within 15 minutes of sending');
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        content: validatedData.content,
        isEdited: true,
        editedAt: new Date(),
      },
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
      },
    });

    authLogger.info('Message updated', {
      messageId: id,
      updatedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: { message: updatedMessage },
    });
  });

  /**
   * Delete message
   */
  static deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if message exists and user is the sender or has admin permissions
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        chat: {
          include: {
            chatMembers: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    const userMembership = message.chat.chatMembers[0];
    const canDelete = message.senderId === userId || 
                     (userMembership && ['admin', 'moderator'].includes(userMembership.role));

    if (!canDelete) {
      throw new AuthorizationError('You can only delete your own messages or need admin/moderator permissions');
    }

    // Soft delete message
    await prisma.message.update({
      where: { id },
      data: {
        content: '[Message deleted]',
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    authLogger.info('Message deleted', {
      messageId: id,
      deletedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  });

  /**
   * React to message
   */
  static reactToMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = reactToMessageSchema.parse(req.body);
    const userId = req.user?.id;

    // Check if message exists and user has access
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        chat: {
          include: {
            chatMembers: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Check access (similar to message access logic)
    const isMember = message.chat.chatMembers.length > 0;
    if (!isMember) {
      const isDepartmentMember = message.chat.type === 'department' && !message.chat.isPrivate && 
        await prisma.userDepartment.findFirst({
          where: { userId, departmentId: message.chat.departmentId || undefined },
        });
      const isTeamMember = message.chat.type === 'team' && !message.chat.isPrivate &&
        await prisma.userTeam.findFirst({
          where: { userId, teamId: message.chat.teamId || undefined },
        });

      if (!isDepartmentMember && !isTeamMember) {
        throw new AuthorizationError('Access denied to this chat');
      }
    }

    // Toggle reaction (add if not exists, remove if exists)
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId: id,
        userId: userId!,
        emoji: validatedData.emoji,
      },
    });

    if (existingReaction) {
      // Remove reaction
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id },
      });
    } else {
      // Add reaction
      await prisma.messageReaction.create({
        data: {
          messageId: id,
          userId: userId!,
          emoji: validatedData.emoji,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: existingReaction ? 'Reaction removed' : 'Reaction added',
    });
  });
}
