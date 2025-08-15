# 📋 Task Management Database Schema

## 📋 Overview

Thiết kế database schema cho hệ thống Task Management của Internal Chat App, hỗ trợ project management, task tracking, time logging, và team collaboration.

## 🗄️ Database Tables

### 1. **tasks** - Bảng task chính

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| title | String | NOT NULL | Task title |
| description | String | NULLABLE | Task description |
| type | String | DEFAULT 'task' | Task type |
| priority | String | DEFAULT 'medium' | Task priority |
| status | String | DEFAULT 'todo' | Task status |
| departmentId | String | NULLABLE, FOREIGN KEY | Department association |
| teamId | String | NULLABLE, FOREIGN KEY | Team association |
| parentId | String | NULLABLE, FOREIGN KEY | Parent task (subtasks) |
| epicId | String | NULLABLE, FOREIGN KEY | Epic association |
| estimatedHours | Float | NULLABLE | Estimated work hours |
| actualHours | Float | NULLABLE | Actual work hours |
| storyPoints | Int | NULLABLE | Story points (Agile) |
| startDate | DateTime | NULLABLE | Task start date |
| dueDate | DateTime | NULLABLE | Task due date |
| completedAt | DateTime | NULLABLE | Completion timestamp |
| isArchived | Boolean | DEFAULT false | Archive status |
| isTemplate | Boolean | DEFAULT false | Template flag |
| isRecurring | Boolean | DEFAULT false | Recurring task flag |
| recurringPattern | String | NULLABLE | Recurrence pattern |
| labels | String[] | ARRAY | Task labels |
| tags | String[] | ARRAY | Task tags |
| externalId | String | NULLABLE | External system ID |
| externalUrl | String | NULLABLE | External system URL |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |
| createdBy | String | NULLABLE | Creator user ID |
| updatedBy | String | NULLABLE | Last updater user ID |

### 2. **task_assignments** - Bảng phân công task

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| taskId | String | FOREIGN KEY, NOT NULL | Reference to tasks.id |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| role | String | DEFAULT 'assignee' | Assignment role |
| isActive | Boolean | DEFAULT true | Assignment status |
| assignedAt | DateTime | DEFAULT now() | Assignment timestamp |
| assignedBy | String | NULLABLE | Assigner user ID |
| acceptedAt | DateTime | NULLABLE | Acceptance timestamp |
| hoursWorked | Float | DEFAULT 0 | Hours worked |
| progress | Int | DEFAULT 0 | Progress percentage |

**Unique Constraint**: (taskId, userId, role)

### 3. **task_comments** - Bảng comment task

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| taskId | String | FOREIGN KEY, NOT NULL | Reference to tasks.id |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| content | String | NOT NULL | Comment content |
| type | String | DEFAULT 'comment' | Comment type |
| isInternal | Boolean | DEFAULT false | Internal comment flag |
| isEdited | Boolean | DEFAULT false | Edit status |
| isDeleted | Boolean | DEFAULT false | Delete status |
| replyToId | String | NULLABLE, FOREIGN KEY | Reply to comment ID |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |
| editedAt | DateTime | NULLABLE | Edit timestamp |
| deletedAt | DateTime | NULLABLE | Delete timestamp |

### 4. **task_attachments** - Bảng file đính kèm

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| taskId | String | FOREIGN KEY, NOT NULL | Reference to tasks.id |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| fileName | String | NOT NULL | File name |
| fileSize | Int | NOT NULL | File size in bytes |
| fileType | String | NOT NULL | File type |
| filePath | String | NOT NULL | File storage path |
| originalName | String | NOT NULL | Original file name |
| mimeType | String | NOT NULL | MIME type |
| isImage | Boolean | DEFAULT false | Image file flag |
| thumbnailPath | String | NULLABLE | Thumbnail path |
| uploadedAt | DateTime | DEFAULT now() | Upload timestamp |

### 5. **task_time_entries** - Bảng time tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| taskId | String | FOREIGN KEY, NOT NULL | Reference to tasks.id |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| hours | Float | NOT NULL | Hours worked |
| description | String | NULLABLE | Work description |
| date | DateTime | DEFAULT now() | Work date |
| billable | Boolean | DEFAULT false | Billable hours flag |
| hourlyRate | Float | NULLABLE | Hourly rate |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

### 6. **task_dependencies** - Bảng task dependencies

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| taskId | String | FOREIGN KEY, NOT NULL | Dependent task ID |
| dependsOnId | String | FOREIGN KEY, NOT NULL | Dependency task ID |
| type | String | DEFAULT 'finish_to_start' | Dependency type |
| lag | Int | DEFAULT 0 | Lag time in hours |
| isActive | Boolean | DEFAULT true | Dependency status |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| createdBy | String | NULLABLE | Creator user ID |

**Unique Constraint**: (taskId, dependsOnId)

### 7. **task_watchers** - Bảng task watchers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| taskId | String | FOREIGN KEY, NOT NULL | Reference to tasks.id |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| isActive | Boolean | DEFAULT true | Watcher status |
| watchedAt | DateTime | DEFAULT now() | Watch timestamp |
| notifyOnUpdate | Boolean | DEFAULT true | Update notifications |
| notifyOnComment | Boolean | DEFAULT true | Comment notifications |
| notifyOnAssignment | Boolean | DEFAULT true | Assignment notifications |
| notifyOnStatusChange | Boolean | DEFAULT true | Status change notifications |

**Unique Constraint**: (taskId, userId)

### 8. **task_statuses** - Bảng trạng thái task

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | UNIQUE, NOT NULL | Status name |
| displayName | String | NOT NULL | Display name |
| description | String | NULLABLE | Status description |
| color | String | NULLABLE | Status color |
| icon | String | NULLABLE | Status icon |
| isDefault | Boolean | DEFAULT false | Default status flag |
| isActive | Boolean | DEFAULT true | Status active flag |
| isFinal | Boolean | DEFAULT false | Final status flag |
| order | Int | DEFAULT 0 | Display order |
| category | String | DEFAULT 'active' | Status category |
| allowedRoles | String[] | ARRAY | Allowed roles |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

### 9. **task_types** - Bảng loại task

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | UNIQUE, NOT NULL | Type name |
| displayName | String | NOT NULL | Display name |
| description | String | NULLABLE | Type description |
| color | String | NULLABLE | Type color |
| icon | String | NULLABLE | Type icon |
| isDefault | Boolean | DEFAULT false | Default type flag |
| isActive | Boolean | DEFAULT true | Type active flag |
| defaultPriority | String | DEFAULT 'medium' | Default priority |
| defaultStatus | String | DEFAULT 'todo' | Default status |
| allowSubtasks | Boolean | DEFAULT true | Allow subtasks |
| allowTimeTracking | Boolean | DEFAULT true | Allow time tracking |
| requireEstimate | Boolean | DEFAULT false | Require estimate |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

### 10. **task_priorities** - Bảng độ ưu tiên

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | UNIQUE, NOT NULL | Priority name |
| displayName | String | NOT NULL | Display name |
| description | String | NULLABLE | Priority description |
| color | String | NULLABLE | Priority color |
| icon | String | NULLABLE | Priority icon |
| level | Int | UNIQUE, NOT NULL | Priority level (1-5) |
| isDefault | Boolean | DEFAULT false | Default priority flag |
| isActive | Boolean | DEFAULT true | Priority active flag |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

## 🔗 Relationships

### Task Relationships
- **Task** ↔ **Department** (Many-to-One, optional)
- **Task** ↔ **Team** (Many-to-One, optional)
- **Task** ↔ **Task** (Parent-Child, Self-referencing)
- **Task** ↔ **Task** (Epic-Stories, Self-referencing)
- **Task** ↔ **TaskAssignment** (One-to-Many)
- **Task** ↔ **TaskComment** (One-to-Many)
- **Task** ↔ **TaskAttachment** (One-to-Many)
- **Task** ↔ **TaskTimeEntry** (One-to-Many)
- **Task** ↔ **TaskDependency** (One-to-Many, both directions)
- **Task** ↔ **TaskWatcher** (One-to-Many)

### User Relationships
- **User** ↔ **TaskAssignment** (One-to-Many)
- **User** ↔ **TaskComment** (One-to-Many)
- **User** ↔ **TaskAttachment** (One-to-Many)
- **User** ↔ **TaskTimeEntry** (One-to-Many)
- **User** ↔ **TaskWatcher** (One-to-Many)

## 📋 Task Types

### 1. **Task** (`task`) 📋
- General work item
- Default type for most work
- Allows subtasks and time tracking

### 2. **Bug** (`bug`) 🐛
- Bug fix or issue resolution
- High priority by default
- Requires time estimate

### 3. **Feature** (`feature`) ✨
- New feature development
- Allows subtasks
- Requires time estimate

### 4. **Epic** (`epic`) 🎯
- Large initiative or theme
- Contains multiple stories
- No direct time tracking

### 5. **User Story** (`story`) 📖
- User-focused requirement
- Part of an epic
- Allows subtasks and time tracking

## 🎯 Task Priorities

### 1. **Critical** (`critical`) 🔥
- Level 1 - Immediate attention
- Red color (#FF0000)
- System outages, security issues

### 2. **High** (`high`) ⬆️
- Level 2 - Important work
- Orange color (#FF6600)
- Important features, major bugs

### 3. **Medium** (`medium`) ➡️
- Level 3 - Normal priority (Default)
- Yellow color (#FFA500)
- Regular development work

### 4. **Low** (`low`) ⬇️
- Level 4 - Can wait
- Green color (#00AA00)
- Nice-to-have features

### 5. **Minimal** (`minimal`) ⏬
- Level 5 - Lowest priority
- Gray color (#888888)
- Future considerations

## 📊 Task Statuses

### Backlog Category
- **To Do** (`todo`) 📝 - Ready to start (Default)

### Active Category
- **In Progress** (`in_progress`) 🔄 - Currently working
- **In Review** (`review`) 👀 - Under review
- **Testing** (`testing`) 🧪 - Being tested

### Final Categories
- **Done** (`done`) ✅ - Completed successfully
- **Cancelled** (`cancelled`) ❌ - Work cancelled

## 🔄 Assignment Roles

### Task Assignment Roles
- **assignee**: Primary person responsible
- **reviewer**: Reviews completed work
- **approver**: Approves final result
- **watcher**: Receives notifications only

## 🚀 Default Data

### Sample Epic: Internal Chat App Development
- **Type**: Epic
- **Priority**: High
- **Status**: In Progress
- **Department**: Information Technology
- **Estimated**: 500 hours

### Sample Stories:
1. **Database Schema Design** (Backend Team)
   - Status: Done
   - Story Points: 8
   - Hours: 18/20

2. **Authentication System** (Backend Team)
   - Status: To Do
   - Story Points: 13
   - Estimated: 30 hours

3. **Real-time Chat API** (Backend Team)
   - Status: To Do
   - Story Points: 21
   - Estimated: 40 hours

4. **UI Component Library** (Frontend Team)
   - Status: To Do
   - Story Points: 8
   - Estimated: 25 hours

5. **Chat Interface** (Frontend Team)
   - Status: To Do
   - Story Points: 13
   - Estimated: 35 hours

### Admin Setup
- Admin assigned to epic as assignee
- Admin watching all stories
- All tasks linked to appropriate teams

## 🔧 Advanced Features

### Task Hierarchy
- **Parent-Child**: Subtask relationships
- **Epic-Stories**: Agile methodology support
- **Dependencies**: Task blocking relationships

### Time Tracking
- **Time Entries**: Detailed work logging
- **Billable Hours**: Client billing support
- **Hourly Rates**: Cost calculation

### Collaboration
- **Comments**: Discussion threads
- **Attachments**: File sharing
- **Watchers**: Notification system
- **Assignments**: Multi-role support

### Project Management
- **Templates**: Reusable task structures
- **Recurring Tasks**: Automated creation
- **Labels & Tags**: Flexible categorization
- **External Integration**: Third-party system links

## 🚀 Usage Examples

### Create Epic with Stories
```typescript
const epic = await prisma.task.create({
  data: {
    title: 'Mobile App Development',
    type: 'epic',
    priority: 'high',
    departmentId: itDepartmentId,
    estimatedHours: 200,
    stories: {
      create: [
        {
          title: 'User Authentication',
          type: 'story',
          storyPoints: 8,
          teamId: backendTeamId
        },
        {
          title: 'Chat Interface',
          type: 'story', 
          storyPoints: 13,
          teamId: frontendTeamId
        }
      ]
    }
  }
});
```

### Assign Task with Time Tracking
```typescript
await prisma.taskAssignment.create({
  data: {
    taskId: taskId,
    userId: developerId,
    role: 'assignee',
    acceptedAt: new Date()
  }
});

await prisma.taskTimeEntry.create({
  data: {
    taskId: taskId,
    userId: developerId,
    hours: 4.5,
    description: 'Implemented user authentication',
    billable: true,
    hourlyRate: 75
  }
});
```

### Add Comment with Attachments
```typescript
const comment = await prisma.taskComment.create({
  data: {
    taskId: taskId,
    userId: userId,
    content: 'Please review the attached mockups',
    type: 'comment'
  }
});

await prisma.taskAttachment.create({
  data: {
    taskId: taskId,
    userId: userId,
    fileName: 'mockups.pdf',
    fileSize: 2048000,
    fileType: 'pdf',
    filePath: '/uploads/tasks/mockups.pdf',
    originalName: 'UI Mockups.pdf',
    mimeType: 'application/pdf'
  }
});
```

## 🔧 Migration Commands

```bash
# Generate Prisma client
cd backend && npm run db:generate

# Push schema changes
cd backend && npm run db:push

# Seed with task management data
cd backend && npm run db:seed

# View in Prisma Studio
cd backend && npm run db:studio
```

## 📝 Notes

### Agile Support
- ✅ Epic-Story hierarchy
- ✅ Story points estimation
- ✅ Sprint planning ready
- ✅ Burndown chart data

### Project Management
- ✅ Gantt chart support (dependencies)
- ✅ Resource allocation (assignments)
- ✅ Time tracking and billing
- ✅ Progress reporting

### Collaboration
- ✅ Team-based task assignment
- ✅ Comment threads and discussions
- ✅ File sharing and attachments
- ✅ Notification system

### Scalability
- ✅ Efficient indexing on key fields
- ✅ Soft delete for audit trails
- ✅ Flexible labeling system
- ✅ External system integration

---

**Created**: 2025-01-15  
**Status**: ✅ Implemented  
**Next**: File & Notification Schema (Task 3.5)
