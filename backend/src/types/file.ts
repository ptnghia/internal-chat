import { File, FileFolder, FileShare, FileVersion, FileTag, User, Department, Team } from '@prisma/client';

// ================================
// FILE TYPES
// ================================

export interface FileWithRelations extends File {
  uploader: User;
  folder?: FileFolder | null;
  shares?: Array<FileShare & { sharer: User }>;
  versions?: Array<FileVersion & { creator: User }>;
  tags?: Array<FileTag & { creator: User }>;
  _count?: {
    shares: number;
    versions: number;
    tags: number;
  };
}

export interface FileWithMetadata extends File {
  uploader: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  folder?: {
    id: string;
    name: string;
  } | null;
  isSharedWithMe?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  shareCount: number;
  versionCount: number;
  tagCount: number;
  latestVersion?: {
    versionNumber: number;
    createdAt: Date;
  };
}

export interface CreateFileData {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other';
  category?: 'avatar' | 'attachment' | 'document' | 'media' | 'temp';
  folderId?: string;
  isPublic?: boolean;
  isTemporary?: boolean;
  expiresAt?: Date;
  storageProvider?: string;
  externalId?: string;
  externalUrl?: string;
  tags?: string[];
}

export interface UpdateFileData {
  fileName?: string;
  folderId?: string;
  isPublic?: boolean;
  isTemporary?: boolean;
  expiresAt?: Date;
  isActive?: boolean;
}

// ================================
// FILE FOLDER TYPES
// ================================

export interface FileFolderWithRelations extends FileFolder {
  parent?: FileFolder | null;
  children?: FileFolder[];
  files?: File[];
  department?: Department | null;
  team?: Team | null;
  _count?: {
    files: number;
    children: number;
  };
}

export interface CreateFileFolderData {
  name: string;
  description?: string;
  parentId?: string;
  departmentId?: string;
  teamId?: string;
  isPublic?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export interface UpdateFileFolderData {
  name?: string;
  description?: string;
  parentId?: string;
  isPublic?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
}

// ================================
// FILE SHARE TYPES
// ================================

export interface FileShareWithRelations extends FileShare {
  file: File;
  sharer: User;
}

export interface CreateFileShareData {
  fileId: string;
  sharedWith: string; // User ID or 'public'
  canView?: boolean;
  canDownload?: boolean;
  canEdit?: boolean;
  canShare?: boolean;
  expiresAt?: Date;
}

export interface UpdateFileShareData {
  canView?: boolean;
  canDownload?: boolean;
  canEdit?: boolean;
  canShare?: boolean;
  expiresAt?: Date;
  isActive?: boolean;
}

// ================================
// FILE VERSION TYPES
// ================================

export interface FileVersionWithRelations extends FileVersion {
  file: File;
  creator: User;
}

export interface CreateFileVersionData {
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  changeLog?: string;
}

// ================================
// FILE TAG TYPES
// ================================

export interface FileTagWithRelations extends FileTag {
  file: File;
  creator: User;
}

export interface CreateFileTagData {
  fileId: string;
  tagName: string;
  tagColor?: string;
}

// ================================
// QUERY TYPES
// ================================

export interface FileQuery {
  search?: string;
  fileType?: string;
  category?: string;
  folderId?: string;
  uploadedBy?: string;
  isPublic?: boolean;
  isTemporary?: boolean;
  isActive?: boolean;
  hasShares?: boolean;
  hasVersions?: boolean;
  tags?: string[];
  minSize?: number;
  maxSize?: number;
  uploadedAfter?: Date;
  uploadedBefore?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'fileName' | 'fileSize' | 'uploadedAt' | 'downloadCount';
  sortOrder?: 'asc' | 'desc';
}

export interface FileFolderQuery {
  search?: string;
  parentId?: string;
  departmentId?: string;
  teamId?: string;
  isPublic?: boolean;
  isSystem?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'fileCount';
  sortOrder?: 'asc' | 'desc';
}

// ================================
// STATISTICS TYPES
// ================================

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  totalDownloads: number;
  filesByType: Record<string, number>;
  filesByCategory: Record<string, number>;
  averageFileSize: number;
  mostDownloadedFiles: Array<{
    id: string;
    fileName: string;
    downloadCount: number;
  }>;
  recentUploads: Array<{
    id: string;
    fileName: string;
    uploadedAt: Date;
    uploader: string;
  }>;
}

export interface UserFileStats {
  userId: string;
  uploadedFiles: number;
  totalUploadSize: number;
  sharedFiles: number;
  receivedShares: number;
  storageUsed: number;
  storageLimit: number;
}

// ================================
// API RESPONSE TYPES
// ================================

export interface FileResponse {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  category: string;
  isPublic: boolean;
  isTemporary: boolean;
  downloadCount: number;
  uploader: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  folder?: {
    id: string;
    name: string;
  };
  tags: Array<{
    tagName: string;
    tagColor?: string;
  }>;
  shareCount: number;
  versionCount: number;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  downloadUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  updatedAt: Date;
}

// ================================
// ERROR TYPES
// ================================

export interface FileError extends Error {
  code: 
    | 'FILE_NOT_FOUND'
    | 'FOLDER_NOT_FOUND'
    | 'SHARE_NOT_FOUND'
    | 'VERSION_NOT_FOUND'
    | 'FILE_TOO_LARGE'
    | 'INVALID_FILE_TYPE'
    | 'INSUFFICIENT_STORAGE'
    | 'INSUFFICIENT_PERMISSIONS'
    | 'FILE_ALREADY_EXISTS'
    | 'FOLDER_NOT_EMPTY'
    | 'CIRCULAR_FOLDER_REFERENCE'
    | 'SHARE_EXPIRED'
    | 'UPLOAD_FAILED'
    | 'DOWNLOAD_FAILED'
    | 'VIRUS_DETECTED'
    | 'STORAGE_PROVIDER_ERROR';
  statusCode: number;
}
