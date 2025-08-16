# 📁🔔 File & Notification Database Schema

## 📋 Overview

Thiết kế database schema cho hệ thống File Management và Notification của Internal Chat App, hỗ trợ file sharing, versioning, notification system, và system settings.

## 🗄️ Database Tables

### 📁 **FILE MANAGEMENT TABLES**

#### 1. **files** - Bảng file chính

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| fileName | String | NOT NULL | Current file name |
| originalName | String | NOT NULL | Original upload name |
| filePath | String | NOT NULL | Storage path |
| fileSize | Int | NOT NULL | File size in bytes |
| mimeType | String | NOT NULL | MIME type |
| fileType | String | NOT NULL | File category |
| category | String | DEFAULT 'general' | Usage category |
| isImage | Boolean | DEFAULT false | Image file flag |
| imageWidth | Int | NULLABLE | Image width |
| imageHeight | Int | NULLABLE | Image height |
| thumbnailPath | String | NULLABLE | Thumbnail path |
| previewPath | String | NULLABLE | Preview path |
| folderId | String | NULLABLE, FOREIGN KEY | Parent folder |
| isPublic | Boolean | DEFAULT false | Public access |
| isTemporary | Boolean | DEFAULT false | Temporary file |
| expiresAt | DateTime | NULLABLE | Expiration date |
| isActive | Boolean | DEFAULT true | File status |
| isDeleted | Boolean | DEFAULT false | Soft delete |
| deletedAt | DateTime | NULLABLE | Delete timestamp |
| uploadedBy | String | FOREIGN KEY, NOT NULL | Uploader user ID |
| uploadedAt | DateTime | DEFAULT now() | Upload timestamp |
| downloadCount | Int | DEFAULT 0 | Download counter |
| lastDownloadAt | DateTime | NULLABLE | Last download time |
| storageProvider | String | DEFAULT 'local' | Storage provider |
| externalId | String | NULLABLE | External storage ID |
| externalUrl | String | NULLABLE | External URL |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Update timestamp |

#### 2. **file_folders** - Bảng thư mục

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | NOT NULL | Folder name |
| description | String | NULLABLE | Folder description |
| parentId | String | NULLABLE, FOREIGN KEY | Parent folder |
| departmentId | String | NULLABLE, FOREIGN KEY | Department association |
| teamId | String | NULLABLE, FOREIGN KEY | Team association |
| isPublic | Boolean | DEFAULT false | Public access |
| isSystem | Boolean | DEFAULT false | System folder |
| maxFileSize | Int | NULLABLE | Max file size limit |
| allowedTypes | String[] | ARRAY | Allowed file types |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Update timestamp |
| createdBy | String | NULLABLE | Creator user ID |

#### 3. **file_shares** - Bảng chia sẻ file

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| fileId | String | FOREIGN KEY, NOT NULL | Reference to files.id |
| sharedWith | String | NOT NULL | User ID or 'public' |
| canView | Boolean | DEFAULT true | View permission |
| canDownload | Boolean | DEFAULT true | Download permission |
| canEdit | Boolean | DEFAULT false | Edit permission |
| canShare | Boolean | DEFAULT false | Share permission |
| expiresAt | DateTime | NULLABLE | Share expiration |
| isActive | Boolean | DEFAULT true | Share status |
| sharedBy | String | FOREIGN KEY, NOT NULL | Sharer user ID |
| sharedAt | DateTime | DEFAULT now() | Share timestamp |
| accessCount | Int | DEFAULT 0 | Access counter |
| lastAccessAt | DateTime | NULLABLE | Last access time |

**Unique Constraint**: (fileId, sharedWith)

#### 4. **file_versions** - Bảng phiên bản file

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| fileId | String | FOREIGN KEY, NOT NULL | Reference to files.id |
| versionNumber | Int | NOT NULL | Version number |
| fileName | String | NOT NULL | Version file name |
| filePath | String | NOT NULL | Version file path |
| fileSize | Int | NOT NULL | Version file size |
| changeLog | String | NULLABLE | Change description |
| isActive | Boolean | DEFAULT false | Active version |
| createdBy | String | FOREIGN KEY, NOT NULL | Creator user ID |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |

**Unique Constraint**: (fileId, versionNumber)

#### 5. **file_tags** - Bảng tag file

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| fileId | String | FOREIGN KEY, NOT NULL | Reference to files.id |
| tagName | String | NOT NULL | Tag name |
| tagColor | String | NULLABLE | Tag color |
| createdBy | String | FOREIGN KEY, NOT NULL | Creator user ID |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |

**Unique Constraint**: (fileId, tagName)

### 🔔 **NOTIFICATION TABLES**

#### 6. **notifications** - Bảng thông báo

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| recipientId | String | FOREIGN KEY, NOT NULL | Recipient user ID |
| title | String | NOT NULL | Notification title |
| message | String | NOT NULL | Notification message |
| type | String | NOT NULL | Notification type |
| category | String | DEFAULT 'general' | Notification category |
| data | Json | NULLABLE | Additional data |
| actionUrl | String | NULLABLE | Action URL |
| actionText | String | NULLABLE | Action button text |
| sourceType | String | NULLABLE | Source entity type |
| sourceId | String | NULLABLE | Source entity ID |
| senderId | String | NULLABLE, FOREIGN KEY | Sender user ID |
| senderName | String | NULLABLE | Sender name |
| isRead | Boolean | DEFAULT false | Read status |
| isArchived | Boolean | DEFAULT false | Archive status |
| isPinned | Boolean | DEFAULT false | Pin status |
| deliveryMethod | String[] | DEFAULT ["in_app"] | Delivery methods |
| isDelivered | Boolean | DEFAULT false | Delivery status |
| deliveredAt | DateTime | NULLABLE | Delivery timestamp |
| readAt | DateTime | NULLABLE | Read timestamp |
| expiresAt | DateTime | NULLABLE | Expiration date |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Update timestamp |

#### 7. **notification_preferences** - Bảng cài đặt thông báo

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| userId | String | UNIQUE, FOREIGN KEY | User ID |
| chatMessages | Boolean | DEFAULT true | Chat message notifications |
| chatMentions | Boolean | DEFAULT true | Chat mention notifications |
| taskAssignments | Boolean | DEFAULT true | Task assignment notifications |
| taskUpdates | Boolean | DEFAULT true | Task update notifications |
| taskComments | Boolean | DEFAULT true | Task comment notifications |
| taskDeadlines | Boolean | DEFAULT true | Task deadline notifications |
| fileShares | Boolean | DEFAULT true | File share notifications |
| systemUpdates | Boolean | DEFAULT true | System update notifications |
| userActivities | Boolean | DEFAULT false | User activity notifications |
| emailEnabled | Boolean | DEFAULT true | Email delivery |
| pushEnabled | Boolean | DEFAULT true | Push delivery |
| smsEnabled | Boolean | DEFAULT false | SMS delivery |
| quietHoursStart | String | NULLABLE | Quiet hours start (HH:MM) |
| quietHoursEnd | String | NULLABLE | Quiet hours end (HH:MM) |
| weekendNotifications | Boolean | DEFAULT false | Weekend notifications |
| instantNotifications | Boolean | DEFAULT true | Instant delivery |
| dailyDigest | Boolean | DEFAULT false | Daily digest |
| weeklyDigest | Boolean | DEFAULT false | Weekly digest |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Update timestamp |

#### 8. **notification_templates** - Bảng template thông báo

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | UNIQUE, NOT NULL | Template name |
| displayName | String | NOT NULL | Display name |
| description | String | NULLABLE | Template description |
| titleTemplate | String | NOT NULL | Title template |
| messageTemplate | String | NOT NULL | Message template |
| category | String | NOT NULL | Template category |
| type | String | NOT NULL | Template type |
| isActive | Boolean | DEFAULT true | Template status |
| isSystem | Boolean | DEFAULT false | System template |
| defaultDeliveryMethods | String[] | DEFAULT ["in_app"] | Default delivery |
| defaultActionUrl | String | NULLABLE | Default action URL |
| defaultActionText | String | NULLABLE | Default action text |
| variables | Json | NULLABLE | Template variables |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Update timestamp |
| createdBy | String | NULLABLE | Creator user ID |

### ⚙️ **SYSTEM TABLES**

#### 9. **system_settings** - Bảng cài đặt hệ thống

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| key | String | UNIQUE, NOT NULL | Setting key |
| value | String | NOT NULL | Setting value |
| type | String | DEFAULT 'string' | Value type |
| category | String | DEFAULT 'general' | Setting category |
| displayName | String | NULLABLE | Display name |
| description | String | NULLABLE | Setting description |
| isPublic | Boolean | DEFAULT false | Public readable |
| isEditable | Boolean | DEFAULT true | User editable |
| validationRules | Json | NULLABLE | Validation rules |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Update timestamp |
| updatedBy | String | NULLABLE | Last updater |

#### 10. **audit_logs** - Bảng audit log

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| userId | String | NULLABLE, FOREIGN KEY | User ID |
| action | String | NOT NULL | Action performed |
| resource | String | NOT NULL | Resource type |
| resourceId | String | NULLABLE | Resource ID |
| oldValues | Json | NULLABLE | Previous values |
| newValues | Json | NULLABLE | New values |
| changes | Json | NULLABLE | Changed fields |
| ipAddress | String | NULLABLE | Client IP |
| userAgent | String | NULLABLE | User agent |
| method | String | NULLABLE | HTTP method |
| endpoint | String | NULLABLE | API endpoint |
| metadata | Json | NULLABLE | Additional data |
| createdAt | DateTime | DEFAULT now() | Action timestamp |

## 🔗 Relationships

### File Relationships
- **File** ↔ **User** (Uploader, Many-to-One)
- **File** ↔ **FileFolder** (Many-to-One, optional)
- **File** ↔ **FileShare** (One-to-Many)
- **File** ↔ **FileVersion** (One-to-Many)
- **File** ↔ **FileTag** (One-to-Many)

### Folder Relationships
- **FileFolder** ↔ **FileFolder** (Parent-Child, Self-referencing)
- **FileFolder** ↔ **Department** (Many-to-One, optional)
- **FileFolder** ↔ **Team** (Many-to-One, optional)
- **FileFolder** ↔ **File** (One-to-Many)

### Notification Relationships
- **Notification** ↔ **User** (Recipient, Many-to-One)
- **Notification** ↔ **User** (Sender, Many-to-One, optional)
- **NotificationPreference** ↔ **User** (One-to-One)

## 📁 File Categories

### File Types
- **image**: jpg, jpeg, png, gif, svg, webp
- **document**: pdf, doc, docx, txt, md, rtf
- **video**: mp4, avi, mov, wmv, flv
- **audio**: mp3, wav, flac, aac, ogg
- **archive**: zip, rar, 7z, tar, gz
- **other**: All other file types

### Usage Categories
- **avatar**: User profile pictures
- **attachment**: Chat and task attachments
- **document**: General documents
- **media**: Images, videos, audio files
- **temp**: Temporary files

## 🔔 Notification Types

### Notification Categories
- **general**: General notifications
- **chat**: Chat-related notifications
- **task**: Task-related notifications
- **file**: File-related notifications
- **system**: System notifications
- **user**: User activity notifications

### Notification Types
- **info**: Informational notifications
- **success**: Success notifications
- **warning**: Warning notifications
- **error**: Error notifications
- **mention**: User mention notifications
- **assignment**: Task assignment notifications

## 🚀 Default Data

### File Folders Created
- **Documents** - General documents (PDF, DOC, TXT)
- **Images** - Image files (JPG, PNG, GIF)
- **Avatars** - User profile pictures (Public)
- **Attachments** - Chat/task attachments (All types)
- **Templates** - Document templates (Public)
- **Department Folders** - One per department (7 folders)

### Notification Templates
- **task_assigned** - Task assignment notifications
- **chat_mention** - Chat mention notifications
- **file_shared** - File sharing notifications
- **task_deadline** - Task deadline warnings
- **system_announcement** - System announcements

### System Settings
- **app_name**: "Internal Chat"
- **app_version**: "1.0.0"
- **max_file_size**: 100MB
- **allowed_file_types**: Common file extensions
- **chat_message_retention_days**: 365 days
- **enable_file_versioning**: true
- **enable_audit_logging**: true

### Admin Setup
- ✅ Notification preferences configured
- ✅ Welcome notification created
- ✅ All file folders accessible
- ✅ System settings initialized

## 🔧 Advanced Features

### File Management
- **File Versioning**: Multiple versions with changelog
- **File Sharing**: Granular permissions with expiration
- **File Tagging**: Flexible categorization system
- **Folder Hierarchy**: Nested folder structure
- **Storage Providers**: Local, S3, Cloudinary support
- **Access Control**: Public/private files with permissions

### Notification System
- **Template Engine**: Dynamic notification generation
- **Multi-channel Delivery**: In-app, email, push, SMS
- **User Preferences**: Granular notification settings
- **Quiet Hours**: Time-based notification blocking
- **Digest Notifications**: Daily/weekly summaries
- **Expiration**: Auto-cleanup of old notifications

### System Management
- **Audit Logging**: Complete action tracking
- **System Settings**: Configurable application settings
- **Performance Monitoring**: File and notification metrics
- **Security**: Access control and permission management

## 🚀 Usage Examples

### Upload File with Folder
```typescript
const file = await prisma.file.create({
  data: {
    fileName: 'project-proposal.pdf',
    originalName: 'Project Proposal v2.pdf',
    filePath: '/uploads/documents/project-proposal.pdf',
    fileSize: 2048000,
    mimeType: 'application/pdf',
    fileType: 'document',
    category: 'document',
    folderId: documentsFolder.id,
    uploadedBy: userId,
    tags: {
      create: [
        { tagName: 'proposal', tagColor: '#3B82F6', createdBy: userId },
        { tagName: 'important', tagColor: '#EF4444', createdBy: userId }
      ]
    }
  }
});
```

### Share File with Permissions
```typescript
await prisma.fileShare.create({
  data: {
    fileId: file.id,
    sharedWith: recipientId,
    canView: true,
    canDownload: true,
    canEdit: false,
    canShare: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    sharedBy: userId
  }
});
```

### Send Notification from Template
```typescript
const notification = await prisma.notification.create({
  data: {
    recipientId: userId,
    title: 'New Task Assigned: Database Schema Design',
    message: 'You have been assigned to task "Database Schema Design" by John Doe',
    type: 'assignment',
    category: 'task',
    senderId: assignerId,
    sourceType: 'task',
    sourceId: taskId,
    actionUrl: `/tasks/${taskId}`,
    actionText: 'View Task',
    deliveryMethod: ['in_app', 'email'],
    data: {
      taskId: taskId,
      taskTitle: 'Database Schema Design',
      assignerName: 'John Doe'
    }
  }
});
```

### Update Notification Preferences
```typescript
await prisma.notificationPreference.upsert({
  where: { userId: userId },
  update: {
    chatMentions: true,
    taskDeadlines: true,
    emailEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weeklyDigest: true
  },
  create: {
    userId: userId,
    chatMentions: true,
    taskDeadlines: true,
    emailEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weeklyDigest: true
  }
});
```

## 🔧 Migration Commands

```bash
# Generate Prisma client
cd backend && npm run db:generate

# Push schema changes
cd backend && npm run db:push

# Seed with file and notification data
cd backend && npm run db:seed

# View in Prisma Studio
cd backend && npm run db:studio
```

## 📝 Notes

### File Management Ready
- ✅ Multi-provider storage support
- ✅ File versioning and history
- ✅ Granular sharing permissions
- ✅ Folder organization structure
- ✅ File tagging and search
- ✅ Thumbnail and preview generation

### Notification System Ready
- ✅ Template-based notifications
- ✅ Multi-channel delivery
- ✅ User preference management
- ✅ Batch processing support
- ✅ Digest notifications
- ✅ Real-time delivery

### System Management Ready
- ✅ Comprehensive audit logging
- ✅ Configurable system settings
- ✅ Performance monitoring
- ✅ Security and access control

### Scalability Considerations
- ✅ Efficient indexing on key fields
- ✅ Soft delete for file recovery
- ✅ Notification expiration cleanup
- ✅ Audit log rotation support

---

**Created**: 2025-01-15  
**Status**: ✅ Implemented  
**Next**: Backend API Implementation (Task 1.1)
