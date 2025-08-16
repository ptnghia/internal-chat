import { Notification, NotificationPreference, NotificationTemplate, User } from '@prisma/client';

// ================================
// NOTIFICATION TYPES
// ================================

export interface NotificationWithRelations extends Notification {
  recipient: User;
  sender?: User | null;
}

export interface NotificationWithSender extends Notification {
  sender?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  } | null;
}

export interface CreateNotificationData {
  recipientId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'assignment';
  category?: 'general' | 'chat' | 'task' | 'file' | 'system' | 'user';
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  sourceType?: string;
  sourceId?: string;
  senderId?: string;
  senderName?: string;
  deliveryMethod?: string[];
  expiresAt?: Date;
}

export interface UpdateNotificationData {
  isRead?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  readAt?: Date;
}

export interface BulkNotificationUpdate {
  notificationIds: string[];
  isRead?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
}

// ================================
// NOTIFICATION PREFERENCE TYPES
// ================================

export interface NotificationPreferenceWithUser extends NotificationPreference {
  user: User;
}

export interface UpdateNotificationPreferenceData {
  chatMessages?: boolean;
  chatMentions?: boolean;
  taskAssignments?: boolean;
  taskUpdates?: boolean;
  taskComments?: boolean;
  taskDeadlines?: boolean;
  fileShares?: boolean;
  systemUpdates?: boolean;
  userActivities?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  weekendNotifications?: boolean;
  instantNotifications?: boolean;
  dailyDigest?: boolean;
  weeklyDigest?: boolean;
}

// ================================
// NOTIFICATION TEMPLATE TYPES
// ================================

export interface NotificationTemplateWithVariables extends NotificationTemplate {
  compiledTitle?: string;
  compiledMessage?: string;
}

export interface CreateNotificationTemplateData {
  name: string;
  displayName: string;
  description?: string;
  titleTemplate: string;
  messageTemplate: string;
  category: string;
  type: string;
  isActive?: boolean;
  defaultDeliveryMethods?: string[];
  defaultActionUrl?: string;
  defaultActionText?: string;
  variables?: Record<string, any>;
}

export interface UpdateNotificationTemplateData {
  displayName?: string;
  description?: string;
  titleTemplate?: string;
  messageTemplate?: string;
  category?: string;
  type?: string;
  isActive?: boolean;
  defaultDeliveryMethods?: string[];
  defaultActionUrl?: string;
  defaultActionText?: string;
  variables?: Record<string, any>;
}

// ================================
// TEMPLATE RENDERING TYPES
// ================================

export interface TemplateVariables {
  [key: string]: string | number | boolean | Date;
}

export interface RenderedNotification {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  deliveryMethods: string[];
}

export interface NotificationFromTemplate {
  templateName: string;
  recipientId: string;
  variables: TemplateVariables;
  senderId?: string;
  sourceType?: string;
  sourceId?: string;
  overrides?: {
    title?: string;
    message?: string;
    actionUrl?: string;
    actionText?: string;
    deliveryMethods?: string[];
    expiresAt?: Date;
  };
}

// ================================
// QUERY TYPES
// ================================

export interface NotificationQuery {
  recipientId?: string;
  senderId?: string;
  type?: string;
  category?: string;
  isRead?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  sourceType?: string;
  sourceId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  expiresAfter?: Date;
  expiresBefore?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'readAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationTemplateQuery {
  search?: string;
  category?: string;
  type?: string;
  isActive?: boolean;
  isSystem?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'displayName' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ================================
// STATISTICS TYPES
// ================================

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Record<string, number>;
  notificationsByCategory: Record<string, number>;
  deliveryStats: Record<string, number>;
  averageReadTime: number;
  mostActiveTemplates: Array<{
    templateName: string;
    usageCount: number;
  }>;
}

export interface UserNotificationStats {
  userId: string;
  totalReceived: number;
  totalRead: number;
  totalUnread: number;
  readRate: number;
  averageReadTime: number;
  preferredDeliveryMethods: string[];
  mostActiveCategories: Record<string, number>;
}

// ================================
// DELIVERY TYPES
// ================================

export interface DeliveryChannel {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface DeliveryResult {
  channel: string;
  success: boolean;
  error?: string;
  deliveredAt?: Date;
  messageId?: string;
}

export interface NotificationDelivery {
  notificationId: string;
  results: DeliveryResult[];
  totalChannels: number;
  successfulChannels: number;
  failedChannels: number;
}

// ================================
// BATCH PROCESSING TYPES
// ================================

export interface NotificationBatch {
  id: string;
  notifications: CreateNotificationData[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  totalCount: number;
  successCount: number;
  failureCount: number;
  errors?: string[];
}

export interface DigestNotification {
  recipientId: string;
  type: 'daily' | 'weekly';
  period: {
    start: Date;
    end: Date;
  };
  notifications: NotificationWithSender[];
  summary: {
    totalCount: number;
    unreadCount: number;
    categoryCounts: Record<string, number>;
    typeCounts: Record<string, number>;
  };
}

// ================================
// API RESPONSE TYPES
// ================================

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  actionUrl?: string;
  actionText?: string;
  data?: Record<string, any>;
  sender?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  sourceType?: string;
  sourceId?: string;
  deliveryMethod: string[];
  isDelivered: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
  archivedCount: number;
  pinnedCount: number;
  recentNotifications: NotificationResponse[];
  categoryCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

// ================================
// ERROR TYPES
// ================================

export interface NotificationError extends Error {
  code: 
    | 'NOTIFICATION_NOT_FOUND'
    | 'TEMPLATE_NOT_FOUND'
    | 'PREFERENCE_NOT_FOUND'
    | 'INVALID_TEMPLATE'
    | 'TEMPLATE_RENDER_ERROR'
    | 'DELIVERY_FAILED'
    | 'INVALID_RECIPIENT'
    | 'NOTIFICATION_EXPIRED'
    | 'BATCH_PROCESSING_ERROR'
    | 'RATE_LIMIT_EXCEEDED'
    | 'INVALID_DELIVERY_METHOD'
    | 'TEMPLATE_VARIABLE_MISSING'
    | 'QUIET_HOURS_ACTIVE';
  statusCode: number;
}
