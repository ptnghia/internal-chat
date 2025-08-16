import { Router } from 'express';
import { ChatController } from '@/controllers/chatController';
import { MessageController } from '@/controllers/messageController';
import { authenticate } from '@/middleware/auth';
import { requirePermissions } from '@/middleware/permissions';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// ================================
// CHAT MANAGEMENT ROUTES
// ================================

/**
 * @route   GET /api/chats
 * @desc    Get user's chats
 * @access  Private (requires chats.read permission)
 */
router.get('/', 
  requirePermissions(['chats.read']), 
  ChatController.getChats
);

/**
 * @route   GET /api/chats/:id
 * @desc    Get chat by ID with messages
 * @access  Private (requires chats.read permission)
 */
router.get('/:id', 
  requirePermissions(['chats.read']), 
  ChatController.getChatById
);

/**
 * @route   POST /api/chats
 * @desc    Create new chat
 * @access  Private (requires chats.create permission)
 */
router.post('/', 
  requirePermissions(['chats.create']), 
  ChatController.createChat
);

/**
 * @route   PUT /api/chats/:id
 * @desc    Update chat
 * @access  Private (requires chats.update permission)
 */
router.put('/:id', 
  requirePermissions(['chats.update']), 
  ChatController.updateChat
);

/**
 * @route   DELETE /api/chats/:id
 * @desc    Delete chat
 * @access  Private (requires chats.delete permission)
 */
router.delete('/:id', 
  requirePermissions(['chats.delete']), 
  ChatController.deleteChat
);

/**
 * @route   POST /api/chats/:id/members
 * @desc    Add members to chat
 * @access  Private (requires chats.manage_rooms permission)
 */
router.post('/:id/members', 
  requirePermissions(['chats.manage_rooms']), 
  ChatController.addMembers
);

/**
 * @route   DELETE /api/chats/:id/members/:userId
 * @desc    Remove member from chat
 * @access  Private (requires chats.manage_rooms permission)
 */
router.delete('/:id/members/:userId', 
  requirePermissions(['chats.manage_rooms']), 
  ChatController.removeMember
);

// ================================
// MESSAGE ROUTES
// ================================

/**
 * @route   GET /api/chats/:chatId/messages
 * @desc    Get messages in a chat
 * @access  Private (requires messages.read permission)
 */
router.get('/:chatId/messages', 
  requirePermissions(['messages.read']), 
  MessageController.getMessages
);

/**
 * @route   POST /api/chats/:chatId/messages
 * @desc    Send new message
 * @access  Private (requires messages.create permission)
 */
router.post('/:chatId/messages', 
  requirePermissions(['messages.create']), 
  MessageController.createMessage
);

/**
 * @route   PUT /api/chats/:chatId/messages/:id
 * @desc    Update message
 * @access  Private (requires messages.update permission)
 */
router.put('/:chatId/messages/:id', 
  requirePermissions(['messages.update']), 
  MessageController.updateMessage
);

/**
 * @route   DELETE /api/chats/:chatId/messages/:id
 * @desc    Delete message
 * @access  Private (requires messages.delete permission)
 */
router.delete('/:chatId/messages/:id', 
  requirePermissions(['messages.delete']), 
  MessageController.deleteMessage
);

/**
 * @route   POST /api/chats/:chatId/messages/:id/react
 * @desc    React to message
 * @access  Private (requires messages.read permission)
 */
router.post('/:chatId/messages/:id/react', 
  requirePermissions(['messages.read']), 
  MessageController.reactToMessage
);

export default router;
