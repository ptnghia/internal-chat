import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

// Types
interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
  };
}

interface SocketData {
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
  };
}

// Socket.io server instance
let io: SocketIOServer;

// Connected users tracking
const connectedUsers = new Map<string, string>(); // userId -> socketId
const userSockets = new Map<string, string>(); // socketId -> userId

export const initializeSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token ||
                   socket.handshake.headers.authorization?.replace('Bearer ', '') ||
                   socket.handshake.query.token;

      if (!token) {
        logger.warn('[SOCKET] Connection attempt without token', {
          socketId: socket.id,
          ip: socket.handshake.address,
          auth: socket.handshake.auth,
          headers: socket.handshake.headers.authorization,
          query: socket.handshake.query.token,
        });
        return next(new Error('Authentication token required'));
      }

      logger.info('[SOCKET] Attempting authentication', {
        socketId: socket.id,
        hasToken: !!token,
        tokenLength: token?.length,
      });

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        logger.warn('[SOCKET] Authentication failed - user not found or inactive', {
          socketId: socket.id,
          userId: decoded.userId,
        });
        return next(new Error('User not found or inactive'));
      }

      // Attach user data to socket
      socket.userId = user.id;
      socket.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.userRoles.map(ur => ur.role.name),
      };

      logger.info('[SOCKET] User authenticated successfully', {
        socketId: socket.id,
        userId: user.id,
        email: user.email,
      });

      next();
    } catch (error) {
      logger.error('[SOCKET] Authentication error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        socketId: socket.id,
      });
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const user = socket.user!;

    logger.info('[SOCKET] User connected', {
      socketId: socket.id,
      userId,
      email: user.email,
    });

    // Track connected user
    connectedUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Notify user is online
    socket.broadcast.emit('user:online', {
      userId,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    // Handle joining chat rooms
    socket.on('chat:join', async (chatId: string) => {
      try {
        // Verify user has access to this chat
        const chat = await prisma.chat.findFirst({
          where: {
            id: chatId,
            isArchived: false,
            chatMembers: {
              some: {
                userId,
                isActive: true,
              },
            },
          },
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        socket.join(`chat:${chatId}`);
        
        logger.info('[SOCKET] User joined chat', {
          socketId: socket.id,
          userId,
          chatId,
        });

        socket.emit('chat:joined', { chatId });
      } catch (error) {
        logger.error('[SOCKET] Error joining chat', {
          error: error instanceof Error ? error.message : 'Unknown error',
          socketId: socket.id,
          userId,
          chatId,
        });
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat rooms
    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      
      logger.info('[SOCKET] User left chat', {
        socketId: socket.id,
        userId,
        chatId,
      });

      socket.emit('chat:left', { chatId });
    });

    // Handle sending messages
    socket.on('message:send', async (data: {
      chatId: string;
      content: string;
      type?: string;
      replyToId?: string;
    }) => {
      try {
        const { chatId, content, type = 'text', replyToId } = data;

        // Verify user has access to this chat
        const chat = await prisma.chat.findFirst({
          where: {
            id: chatId,
            isArchived: false,
            chatMembers: {
              some: {
                userId,
                isActive: true,
              },
            },
          },
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            content,
            type,
            chatId,
            senderId: userId,
            replyToId,
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            replyTo: {
              include: {
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

        // Update chat's last message timestamp
        await prisma.chat.update({
          where: { id: chatId },
          data: { lastMessageAt: new Date() },
        });

        // Broadcast message to all users in the chat
        io.to(`chat:${chatId}`).emit('message:new', message);

        logger.info('[SOCKET] Message sent', {
          socketId: socket.id,
          userId,
          chatId,
          messageId: message.id,
        });
      } catch (error) {
        logger.error('[SOCKET] Error sending message', {
          error: error instanceof Error ? error.message : 'Unknown error',
          socketId: socket.id,
          userId,
          data,
        });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('typing:start', {
        userId,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    });

    socket.on('typing:stop', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', { userId });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('[SOCKET] User disconnected', {
        socketId: socket.id,
        userId,
        reason,
      });

      // Remove from tracking
      connectedUsers.delete(userId);
      userSockets.delete(socket.id);

      // Notify user is offline
      socket.broadcast.emit('user:offline', { userId });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('[SOCKET] Socket error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        socketId: socket.id,
        userId,
      });
    });
  });

  logger.info('[SOCKET] Socket.io server initialized successfully');
  return io;
};

// Helper functions
export const getSocketServer = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io server not initialized');
  }
  return io;
};

export const getConnectedUsers = (): Map<string, string> => {
  return connectedUsers;
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export const sendToUser = (userId: string, event: string, data: any): boolean => {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(`user:${userId}`).emit(event, data);
    return true;
  }
  return false;
};

export const sendToChat = (chatId: string, event: string, data: any): void => {
  if (io) {
    io.to(`chat:${chatId}`).emit(event, data);
  }
};
