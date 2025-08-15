import { User, Role, Permission, UserProfile } from '@prisma/client';

// ================================
// USER TYPES
// ================================

export interface UserWithRoles extends User {
  userRoles: Array<{
    role: Role & {
      rolePermissions: Array<{
        permission: Permission;
      }>;
    };
  }>;
  profile?: UserProfile | null;
}

export interface UserWithProfile extends User {
  profile?: UserProfile | null;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  roleIds?: string[];
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserRegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// ================================
// ROLE TYPES
// ================================

export interface RoleWithPermissions extends Role {
  rolePermissions: Array<{
    permission: Permission;
    isActive: boolean;
  }>;
}

export interface CreateRoleData {
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  permissionIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  displayName?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

// ================================
// PERMISSION TYPES
// ================================

export interface CreatePermissionData {
  name: string;
  displayName: string;
  description?: string;
  resource: string;
  action: string;
}

export interface UpdatePermissionData {
  displayName?: string;
  description?: string;
  resource?: string;
  action?: string;
}

// ================================
// JWT TYPES
// ================================

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// ================================
// AUTH RESPONSE TYPES
// ================================

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isActive: boolean;
    isVerified: boolean;
    roles: Array<{
      id: string;
      name: string;
      displayName: string;
      color?: string;
    }>;
    permissions: string[];
    profile?: {
      bio?: string;
      timezone?: string;
      language?: string;
      theme?: string;
    };
  };
  tokens: JwtTokens;
}

export interface LoginResponse extends AuthResponse {}

export interface RegisterResponse extends AuthResponse {}

export interface RefreshTokenResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    roles: string[];
    permissions: string[];
  };
}

// ================================
// PROFILE TYPES
// ================================

export interface UpdateProfileData {
  bio?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  dateFormat?: string;
  timeFormat?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  desktopNotifications?: boolean;
  profileVisibility?: 'public' | 'private' | 'team';
  showOnlineStatus?: boolean;
  showLastSeen?: boolean;
}

// ================================
// RBAC TYPES
// ================================

export interface PermissionCheck {
  resource: string;
  action: string;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedBy?: string;
}

export interface PermissionGrant {
  roleId: string;
  permissionId: string;
  grantedBy?: string;
}

// ================================
// API REQUEST TYPES
// ================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserQuery extends PaginationQuery {
  search?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface RoleQuery extends PaginationQuery {
  search?: string;
  isActive?: boolean;
  isSystem?: boolean;
}

export interface PermissionQuery extends PaginationQuery {
  search?: string;
  resource?: string;
  action?: string;
}

// ================================
// API RESPONSE TYPES
// ================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// ================================
// ERROR TYPES
// ================================

export interface AuthError extends Error {
  code: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'USER_INACTIVE' | 'USER_NOT_VERIFIED' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'INSUFFICIENT_PERMISSIONS';
  statusCode: number;
}

export interface ValidationError extends Error {
  code: 'VALIDATION_ERROR';
  statusCode: 400;
  errors: Record<string, string[]>;
}
