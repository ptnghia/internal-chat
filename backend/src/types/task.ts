import { Task, TaskAssignment, TaskComment, TaskAttachment, TaskTimeEntry, TaskDependency, TaskWatcher, TaskStatus, TaskType, TaskPriority, User, Department, Team } from '@prisma/client';

// ================================
// TASK TYPES
// ================================

export interface TaskWithRelations extends Task {
  department?: Department | null;
  team?: Team | null;
  parent?: Task | null;
  children?: Task[];
  epic?: Task | null;
  stories?: Task[];
  assignments?: Array<TaskAssignment & { user: User }>;
  comments?: Array<TaskComment & { user: User }>;
  attachments?: Array<TaskAttachment & { user: User }>;
  timeEntries?: Array<TaskTimeEntry & { user: User }>;
  dependencies?: Array<TaskDependency & { dependsOnTask: Task }>;
  dependents?: Array<TaskDependency & { task: Task }>;
  watchers?: Array<TaskWatcher & { user: User }>;
  _count?: {
    assignments: number;
    comments: number;
    attachments: number;
    timeEntries: number;
    children: number;
    stories: number;
  };
}

export interface TaskWithAssignees extends Task {
  assignments: Array<{
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    role: string;
    progress?: number;
    hoursWorked?: number;
  }>;
  department?: Department | null;
  team?: Team | null;
  parent?: { id: string; title: string } | null;
  epic?: { id: string; title: string } | null;
  totalTimeSpent: number;
  isWatched?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  type?: 'task' | 'bug' | 'feature' | 'epic' | 'story';
  priority?: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
  status?: string;
  departmentId?: string;
  teamId?: string;
  parentId?: string;
  epicId?: string;
  estimatedHours?: number;
  storyPoints?: number;
  startDate?: Date;
  dueDate?: Date;
  labels?: string[];
  tags?: string[];
  assigneeIds?: string[];
  watcherIds?: string[];
  isTemplate?: boolean;
  isRecurring?: boolean;
  recurringPattern?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  departmentId?: string;
  teamId?: string;
  parentId?: string;
  epicId?: string;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  isArchived?: boolean;
  labels?: string[];
  tags?: string[];
}

// ================================
// TASK ASSIGNMENT TYPES
// ================================

export interface TaskAssignmentWithUser extends TaskAssignment {
  user: User;
  task: Task;
}

export interface CreateTaskAssignmentData {
  taskId: string;
  userId: string;
  role?: 'assignee' | 'reviewer' | 'approver' | 'watcher';
  assignedBy?: string;
}

export interface UpdateTaskAssignmentData {
  role?: string;
  isActive?: boolean;
  hoursWorked?: number;
  progress?: number;
}

// ================================
// TASK COMMENT TYPES
// ================================

export interface TaskCommentWithUser extends TaskComment {
  user: User;
  replyTo?: TaskComment | null;
  replies?: TaskComment[];
}

export interface CreateTaskCommentData {
  taskId: string;
  content: string;
  type?: 'comment' | 'note' | 'status_change' | 'assignment_change';
  isInternal?: boolean;
  replyToId?: string;
}

export interface UpdateTaskCommentData {
  content?: string;
  isInternal?: boolean;
}

// ================================
// TASK ATTACHMENT TYPES
// ================================

export interface TaskAttachmentWithUser extends TaskAttachment {
  user: User;
}

export interface CreateTaskAttachmentData {
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  originalName: string;
  mimeType: string;
  isImage?: boolean;
  thumbnailPath?: string;
}

// ================================
// TASK TIME ENTRY TYPES
// ================================

export interface TaskTimeEntryWithUser extends TaskTimeEntry {
  user: User;
  task: Task;
}

export interface CreateTaskTimeEntryData {
  taskId: string;
  hours: number;
  description?: string;
  date?: Date;
  billable?: boolean;
  hourlyRate?: number;
}

export interface UpdateTaskTimeEntryData {
  hours?: number;
  description?: string;
  date?: Date;
  billable?: boolean;
  hourlyRate?: number;
}

// ================================
// TASK DEPENDENCY TYPES
// ================================

export interface TaskDependencyWithTasks extends TaskDependency {
  task: Task;
  dependsOnTask: Task;
}

export interface CreateTaskDependencyData {
  taskId: string;
  dependsOnId: string;
  type?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag?: number;
}

// ================================
// TASK WATCHER TYPES
// ================================

export interface TaskWatcherWithUser extends TaskWatcher {
  user: User;
}

export interface CreateTaskWatcherData {
  taskId: string;
  userId: string;
  notifyOnUpdate?: boolean;
  notifyOnComment?: boolean;
  notifyOnAssignment?: boolean;
  notifyOnStatusChange?: boolean;
}

export interface UpdateTaskWatcherData {
  isActive?: boolean;
  notifyOnUpdate?: boolean;
  notifyOnComment?: boolean;
  notifyOnAssignment?: boolean;
  notifyOnStatusChange?: boolean;
}

// ================================
// QUERY TYPES
// ================================

export interface TaskQuery {
  search?: string;
  type?: string;
  priority?: string;
  status?: string;
  departmentId?: string;
  teamId?: string;
  assigneeId?: string;
  createdBy?: string;
  epicId?: string;
  parentId?: string;
  isArchived?: boolean;
  isTemplate?: boolean;
  hasAssignee?: boolean;
  hasDueDate?: boolean;
  isOverdue?: boolean;
  labels?: string[];
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'priority' | 'status' | 'dueDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskCommentQuery {
  taskId: string;
  type?: string;
  isInternal?: boolean;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskTimeEntryQuery {
  taskId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  billable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'hours' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ================================
// STATISTICS TYPES
// ================================

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalHoursSpent: number;
  totalHoursEstimated: number;
  averageCompletionTime: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  tasksByType: Record<string, number>;
}

export interface UserTaskStats {
  userId: string;
  assignedTasks: number;
  completedTasks: number;
  hoursWorked: number;
  averageTasksPerWeek: number;
  completionRate: number;
  onTimeDeliveryRate: number;
}

export interface TeamTaskStats {
  teamId: string;
  teamName: string;
  totalTasks: number;
  completedTasks: number;
  totalHoursSpent: number;
  averageTasksPerMember: number;
  completionRate: number;
  memberStats: UserTaskStats[];
}

// ================================
// API RESPONSE TYPES
// ================================

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  isArchived: boolean;
  labels: string[];
  tags: string[];
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
  parent?: {
    id: string;
    title: string;
  };
  epic?: {
    id: string;
    title: string;
  };
  assignees: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    progress?: number;
  }>;
  totalTimeSpent: number;
  commentCount: number;
  attachmentCount: number;
  childrenCount: number;
  isWatched: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ================================
// ERROR TYPES
// ================================

export interface TaskError extends Error {
  code: 
    | 'TASK_NOT_FOUND'
    | 'ASSIGNMENT_NOT_FOUND'
    | 'COMMENT_NOT_FOUND'
    | 'ATTACHMENT_NOT_FOUND'
    | 'TIME_ENTRY_NOT_FOUND'
    | 'DEPENDENCY_NOT_FOUND'
    | 'WATCHER_NOT_FOUND'
    | 'TASK_TITLE_REQUIRED'
    | 'INVALID_TASK_TYPE'
    | 'INVALID_PRIORITY'
    | 'INVALID_STATUS'
    | 'CIRCULAR_DEPENDENCY'
    | 'CANNOT_ASSIGN_TO_SELF'
    | 'ALREADY_ASSIGNED'
    | 'NOT_ASSIGNED'
    | 'INSUFFICIENT_PERMISSIONS'
    | 'TASK_IS_ARCHIVED'
    | 'INVALID_TIME_ENTRY'
    | 'FILE_TOO_LARGE'
    | 'INVALID_FILE_TYPE';
  statusCode: number;
}
