import { Chat, ChatMember, Message, MessageReaction, PinnedMessage, MessageType, User, Department, Team } from '@prisma/client';

// ================================
// CHAT TYPES
// ================================

export interface ChatWithRelations extends Chat {
  department?: Department | null;
  team?: Team | null;
  chatMembers?: Array<ChatMember & { user: User }>;
  messages?: Message[];
  pinnedMessages?: Array<PinnedMessage & { message: Message }>;
  _count?: {
    chatMembers: number;
    messages: number;
  };
}

export interface ChatWithMembers extends Chat {
  chatMembers: Array<{
    id: string;
    user: User;
    role: string;
    isActive: boolean;
    isMuted: boolean;
    joinedAt: Date;
    lastReadAt?: Date;
    notificationsEnabled: boolean;
  }>;
  department?: Department | null;
  team?: Team | null;
  lastMessage?: Message | null;
  unreadCount?: number;
}

export interface CreateChatData {
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'department' | 'team' | 'announcement';
  isPrivate?: boolean;
  departmentId?: string;
  teamId?: string;
  maxMembers?: number;
  allowGuests?: boolean;
  allowFileSharing?: boolean;
  allowReactions?: boolean;
  allowThreads?: boolean;
  requireApproval?: boolean;
  messageRetentionDays?: number;
  memberIds?: string[];
}

export interface UpdateChatData {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  isArchived?: boolean;
  avatar?: string;
  color?: string;
  maxMembers?: number;
  allowGuests?: boolean;
  allowFileSharing?: boolean;
  allowReactions?: boolean;
  allowThreads?: boolean;
  requireApproval?: boolean;
  messageRetentionDays?: number;
}

// ================================
// CHAT MEMBER TYPES
// ================================

export interface ChatMemberWithUser extends ChatMember {
  user: User;
}

export interface AddChatMemberData {
  chatId: string;
  userId: string;
  role?: 'member' | 'admin' | 'moderator';
  canInvite?: boolean;
  canKick?: boolean;
  canPin?: boolean;
  canModerate?: boolean;
  invitedBy?: string;
}

export interface UpdateChatMemberData {
  role?: 'member' | 'admin' | 'moderator';
  isMuted?: boolean;
  mutedUntil?: Date;
  canInvite?: boolean;
  canKick?: boolean;
  canPin?: boolean;
  canModerate?: boolean;
  notificationsEnabled?: boolean;
  mentionNotifications?: boolean;
}

// ================================
// MESSAGE TYPES
// ================================

export interface MessageWithRelations extends Message {
  chat: Chat;
  sender: User;
  replyTo?: Message | null;
  replies?: Message[];
  reactions?: Array<MessageReaction & { user: User }>;
  pinnedIn?: PinnedMessage[];
}

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  replyTo?: {
    id: string;
    content?: string;
    sender: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
  } | null;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: Array<{
      id: string;
      username: string;
    }>;
  }>;
  isRead?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface CreateMessageData {
  chatId: string;
  content?: string;
  type?: 'text' | 'image' | 'file' | 'system' | 'announcement';
  replyToId?: string;
  threadId?: string;
  mentions?: string[];
  attachments?: MessageAttachment[];
  systemData?: Record<string, any>;
}

export interface UpdateMessageData {
  content?: string;
  mentions?: string[];
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
}

// ================================
// MESSAGE REACTION TYPES
// ================================

export interface MessageReactionWithUser extends MessageReaction {
  user: User;
}

export interface AddReactionData {
  messageId: string;
  emoji: string;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  users: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  }>;
  hasReacted: boolean; // Whether current user has reacted
}

// ================================
// PINNED MESSAGE TYPES
// ================================

export interface PinnedMessageWithRelations extends PinnedMessage {
  message: MessageWithSender;
  user: User;
}

export interface PinMessageData {
  messageId: string;
  reason?: string;
}

// ================================
// CHAT QUERY TYPES
// ================================

export interface ChatQuery {
  search?: string;
  type?: 'direct' | 'group' | 'department' | 'team' | 'announcement';
  departmentId?: string;
  teamId?: string;
  isPrivate?: boolean;
  isArchived?: boolean;
  userId?: string; // Filter chats where user is member
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'lastMessageAt' | 'createdAt' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
}

export interface MessageQuery {
  chatId: string;
  search?: string;
  type?: string;
  senderId?: string;
  before?: Date; // Messages before this date
  after?: Date; // Messages after this date
  hasAttachments?: boolean;
  isPinned?: boolean;
  threadId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ChatMemberQuery {
  chatId: string;
  search?: string;
  role?: 'member' | 'admin' | 'moderator';
  isActive?: boolean;
  isMuted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'joinedAt' | 'lastReadAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// ================================
// REAL-TIME TYPES
// ================================

export interface TypingIndicator {
  chatId: string;
  userId: string;
  username: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentChatId?: string;
}

export interface ChatEvent {
  type: 'message' | 'reaction' | 'typing' | 'member_joined' | 'member_left' | 'message_pinned' | 'message_unpinned';
  chatId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

// ================================
// API RESPONSE TYPES
// ================================

export interface ChatResponse {
  id: string;
  name: string;
  description?: string;
  type: string;
  isPrivate: boolean;
  isArchived: boolean;
  avatar?: string;
  color?: string;
  memberCount: number;
  unreadCount: number;
  lastMessage?: {
    id: string;
    content?: string;
    type: string;
    sender: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
    createdAt: Date;
  };
  department?: {
    id: string;
    name: string;
    displayName: string;
  };
  team?: {
    id: string;
    name: string;
    displayName: string;
  };
  userRole: string;
  permissions: {
    canInvite: boolean;
    canKick: boolean;
    canPin: boolean;
    canModerate: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageResponse {
  id: string;
  content?: string;
  type: string;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  sender: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  replyTo?: {
    id: string;
    content?: string;
    sender: {
      username: string;
      firstName: string;
      lastName: string;
    };
  };
  reactions: ReactionSummary[];
  mentions: string[];
  attachments: MessageAttachment[];
  threadId?: string;
  replyCount?: number;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
}

// ================================
// ERROR TYPES
// ================================

export interface ChatError extends Error {
  code: 
    | 'CHAT_NOT_FOUND'
    | 'MESSAGE_NOT_FOUND'
    | 'MEMBER_NOT_FOUND'
    | 'CHAT_NAME_EXISTS'
    | 'NOT_CHAT_MEMBER'
    | 'INSUFFICIENT_PERMISSIONS'
    | 'CHAT_IS_ARCHIVED'
    | 'CHAT_IS_FULL'
    | 'MESSAGE_TOO_LONG'
    | 'INVALID_MESSAGE_TYPE'
    | 'CANNOT_REPLY_TO_MESSAGE'
    | 'CANNOT_EDIT_MESSAGE'
    | 'CANNOT_DELETE_MESSAGE'
    | 'USER_IS_MUTED'
    | 'CHAT_REQUIRES_APPROVAL';
  statusCode: number;
}
