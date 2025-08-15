import { Department, Team, UserDepartment, UserTeam, User } from '@prisma/client';

// ================================
// DEPARTMENT TYPES
// ================================

export interface DepartmentWithRelations extends Department {
  parent?: Department | null;
  children?: Department[];
  teams?: Team[];
  userDepartments?: Array<UserDepartment & { user: User }>;
  head?: User | null;
}

export interface DepartmentWithMembers extends Department {
  userDepartments: Array<{
    user: User;
    role: string;
    isActive: boolean;
    isPrimary: boolean;
    assignedAt: Date;
  }>;
  teams: Team[];
  head?: User | null;
  _count?: {
    userDepartments: number;
    teams: number;
  };
}

export interface CreateDepartmentData {
  name: string;
  displayName: string;
  description?: string;
  code?: string;
  color?: string;
  parentId?: string;
  email?: string;
  phone?: string;
  address?: string;
  isPublic?: boolean;
  headUserId?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  displayName?: string;
  description?: string;
  code?: string;
  color?: string;
  parentId?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  isPublic?: boolean;
  headUserId?: string;
}

// ================================
// TEAM TYPES
// ================================

export interface TeamWithRelations extends Team {
  department: Department;
  userTeams?: Array<UserTeam & { user: User }>;
  lead?: User | null;
}

export interface TeamWithMembers extends Team {
  department: Department;
  userTeams: Array<{
    user: User;
    role: string;
    isActive: boolean;
    assignedAt: Date;
  }>;
  lead?: User | null;
  _count?: {
    userTeams: number;
  };
}

export interface CreateTeamData {
  name: string;
  displayName: string;
  description?: string;
  code?: string;
  color?: string;
  departmentId: string;
  isPublic?: boolean;
  maxMembers?: number;
  teamType?: 'permanent' | 'temporary' | 'project';
  startDate?: Date;
  endDate?: Date;
  leadUserId?: string;
}

export interface UpdateTeamData {
  name?: string;
  displayName?: string;
  description?: string;
  code?: string;
  color?: string;
  departmentId?: string;
  isActive?: boolean;
  isPublic?: boolean;
  maxMembers?: number;
  teamType?: 'permanent' | 'temporary' | 'project';
  startDate?: Date;
  endDate?: Date;
  leadUserId?: string;
}

// ================================
// USER ASSIGNMENT TYPES
// ================================

export interface UserDepartmentAssignment {
  userId: string;
  departmentId: string;
  role: 'member' | 'manager' | 'admin';
  isPrimary?: boolean;
  assignedBy?: string;
}

export interface UserTeamAssignment {
  userId: string;
  teamId: string;
  role: 'member' | 'lead' | 'admin';
  assignedBy?: string;
}

export interface DepartmentMember {
  id: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isActive: boolean;
  };
  role: string;
  isActive: boolean;
  isPrimary: boolean;
  assignedAt: Date;
}

export interface TeamMember {
  id: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isActive: boolean;
  };
  role: string;
  isActive: boolean;
  assignedAt: Date;
}

// ================================
// ORGANIZATION HIERARCHY TYPES
// ================================

export interface DepartmentHierarchy {
  id: string;
  name: string;
  displayName: string;
  code?: string;
  color?: string;
  isActive: boolean;
  memberCount: number;
  teamCount: number;
  children: DepartmentHierarchy[];
  head?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface OrganizationStructure {
  departments: DepartmentHierarchy[];
  totalDepartments: number;
  totalTeams: number;
  totalMembers: number;
}

// ================================
// QUERY TYPES
// ================================

export interface DepartmentQuery {
  search?: string;
  parentId?: string;
  isActive?: boolean;
  isPublic?: boolean;
  hasHead?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'displayName' | 'createdAt' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
}

export interface TeamQuery {
  search?: string;
  departmentId?: string;
  teamType?: 'permanent' | 'temporary' | 'project';
  isActive?: boolean;
  isPublic?: boolean;
  hasLead?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'displayName' | 'createdAt' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
}

export interface MemberQuery {
  search?: string;
  role?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'assignedAt';
  sortOrder?: 'asc' | 'desc';
}

// ================================
// STATISTICS TYPES
// ================================

export interface DepartmentStats {
  id: string;
  name: string;
  displayName: string;
  totalMembers: number;
  activeMembers: number;
  totalTeams: number;
  activeTeams: number;
  averageTeamSize: number;
  membersByRole: {
    member: number;
    manager: number;
    admin: number;
  };
}

export interface TeamStats {
  id: string;
  name: string;
  displayName: string;
  department: {
    id: string;
    name: string;
    displayName: string;
  };
  totalMembers: number;
  activeMembers: number;
  membersByRole: {
    member: number;
    lead: number;
    admin: number;
  };
  teamType: string;
  isActive: boolean;
}

export interface OrganizationStats {
  totalDepartments: number;
  activeDepartments: number;
  totalTeams: number;
  activeTeams: number;
  totalMembers: number;
  activeMembers: number;
  averageDepartmentSize: number;
  averageTeamSize: number;
  departmentStats: DepartmentStats[];
  teamStats: TeamStats[];
}

// ================================
// API RESPONSE TYPES
// ================================

export interface DepartmentResponse {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  code?: string;
  color?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  isPublic: boolean;
  memberCount: number;
  teamCount: number;
  parent?: {
    id: string;
    name: string;
    displayName: string;
  };
  head?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamResponse {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  code?: string;
  color?: string;
  teamType: string;
  isActive: boolean;
  isPublic: boolean;
  maxMembers?: number;
  memberCount: number;
  startDate?: Date;
  endDate?: Date;
  department: {
    id: string;
    name: string;
    displayName: string;
    code?: string;
  };
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ================================
// ERROR TYPES
// ================================

export interface OrganizationError extends Error {
  code: 
    | 'DEPARTMENT_NOT_FOUND'
    | 'TEAM_NOT_FOUND'
    | 'DEPARTMENT_NAME_EXISTS'
    | 'TEAM_NAME_EXISTS'
    | 'INVALID_HIERARCHY'
    | 'CIRCULAR_REFERENCE'
    | 'CANNOT_DELETE_WITH_MEMBERS'
    | 'CANNOT_DELETE_WITH_TEAMS'
    | 'MAX_MEMBERS_EXCEEDED'
    | 'USER_ALREADY_MEMBER'
    | 'USER_NOT_MEMBER'
    | 'INSUFFICIENT_PERMISSIONS';
  statusCode: number;
}
