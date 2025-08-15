# 👥 User & Role Database Schema

## 📋 Overview

Thiết kế database schema cho hệ thống User và Role-Based Access Control (RBAC) của Internal Chat App.

## 🗄️ Database Tables

### 1. **users** - Bảng người dùng chính

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| email | String | UNIQUE, NOT NULL | Email address |
| username | String | UNIQUE, NOT NULL | Username |
| password | String | NOT NULL | Hashed password |
| firstName | String | NOT NULL | First name |
| lastName | String | NOT NULL | Last name |
| avatar | String | NULLABLE | Avatar image URL |
| phone | String | NULLABLE | Phone number |
| isActive | Boolean | DEFAULT true | Account status |
| isVerified | Boolean | DEFAULT false | Email verification status |
| lastLoginAt | DateTime | NULLABLE | Last login timestamp |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |
| createdBy | String | NULLABLE | Creator user ID |
| updatedBy | String | NULLABLE | Last updater user ID |

### 2. **roles** - Bảng vai trò

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | UNIQUE, NOT NULL | Role name (e.g., ADMIN) |
| displayName | String | NOT NULL | Display name |
| description | String | NULLABLE | Role description |
| color | String | NULLABLE | UI color code |
| isSystem | Boolean | DEFAULT false | System role flag |
| isActive | Boolean | DEFAULT true | Role status |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |
| createdBy | String | NULLABLE | Creator user ID |
| updatedBy | String | NULLABLE | Last updater user ID |

### 3. **user_roles** - Bảng liên kết User-Role (Many-to-Many)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| roleId | String | FOREIGN KEY, NOT NULL | Reference to roles.id |
| isActive | Boolean | DEFAULT true | Assignment status |
| assignedAt | DateTime | DEFAULT now() | Assignment timestamp |
| assignedBy | String | NULLABLE | Assigner user ID |

**Unique Constraint**: (userId, roleId)

### 4. **permissions** - Bảng quyền hạn

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | UNIQUE, NOT NULL | Permission name |
| displayName | String | NOT NULL | Display name |
| description | String | NULLABLE | Permission description |
| resource | String | NOT NULL | Resource type |
| action | String | NOT NULL | Action type |
| isSystem | Boolean | DEFAULT false | System permission flag |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

**Unique Constraint**: (resource, action)

### 5. **role_permissions** - Bảng liên kết Role-Permission (Many-to-Many)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| roleId | String | FOREIGN KEY, NOT NULL | Reference to roles.id |
| permissionId | String | FOREIGN KEY, NOT NULL | Reference to permissions.id |
| isActive | Boolean | DEFAULT true | Permission status |
| grantedAt | DateTime | DEFAULT now() | Grant timestamp |
| grantedBy | String | NULLABLE | Granter user ID |

**Unique Constraint**: (roleId, permissionId)

### 6. **user_profiles** - Bảng thông tin profile người dùng

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| userId | String | UNIQUE, FOREIGN KEY | Reference to users.id |
| bio | String | NULLABLE | User biography |
| timezone | String | DEFAULT 'UTC' | User timezone |
| language | String | DEFAULT 'en' | Preferred language |
| theme | String | DEFAULT 'light' | UI theme preference |
| dateFormat | String | DEFAULT 'DD/MM/YYYY' | Date format preference |
| timeFormat | String | DEFAULT '24h' | Time format preference |
| emailNotifications | Boolean | DEFAULT true | Email notification setting |
| pushNotifications | Boolean | DEFAULT true | Push notification setting |
| desktopNotifications | Boolean | DEFAULT true | Desktop notification setting |
| profileVisibility | String | DEFAULT 'public' | Profile visibility |
| showOnlineStatus | Boolean | DEFAULT true | Show online status |
| showLastSeen | Boolean | DEFAULT true | Show last seen |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

## 🔗 Relationships

### User Relationships
- **User** ↔ **UserRole** (One-to-Many)
- **User** ↔ **UserProfile** (One-to-One)

### Role Relationships
- **Role** ↔ **UserRole** (One-to-Many)
- **Role** ↔ **RolePermission** (One-to-Many)

### Permission Relationships
- **Permission** ↔ **RolePermission** (One-to-Many)

## 🎭 Default System Roles

### 1. **SUPER_ADMIN** 🔴
- **Description**: Full system access with all permissions
- **Color**: #FF0000
- **Permissions**: ALL (42 permissions)
- **Use Case**: System administrators

### 2. **ADMIN** 🟠
- **Description**: Administrative access with most permissions
- **Color**: #FF6600
- **Permissions**: 41/42 (excludes settings.manage_system)
- **Use Case**: Company administrators

### 3. **MANAGER** 🔵
- **Description**: Department and team management access
- **Color**: #0066FF
- **Permissions**: 25/42 (management-focused)
- **Use Case**: Department heads, team leaders

### 4. **EMPLOYEE** 🟢
- **Description**: Basic user access for employees
- **Color**: #00AA00
- **Permissions**: 18/42 (standard user)
- **Use Case**: Regular employees

### 5. **GUEST** ⚫
- **Description**: Limited read-only access
- **Color**: #888888
- **Permissions**: 10/42 (read-only)
- **Use Case**: External users, contractors

## 🔐 Permission System

### Permission Structure
```
{resource}.{action}
```

### Resources
- **users**: User management
- **departments**: Department management
- **teams**: Team management
- **chats**: Chat room management
- **messages**: Message management
- **tasks**: Task management
- **files**: File management
- **reports**: Report management
- **settings**: System settings

### Actions
- **create**: Create new records
- **read**: View/read records
- **update**: Modify existing records
- **delete**: Remove records
- **manage**: Full management access
- **assign**: Assign to others
- **moderate**: Moderation capabilities
- **export**: Export data
- **download**: Download files
- **share**: Share with others

### Example Permissions
```
users.create          # Create new users
users.read            # View user information
users.update          # Update user data
users.delete          # Delete users
users.manage_roles     # Assign/remove roles

chats.create          # Create chat rooms
chats.read            # View chat rooms
chats.manage_rooms    # Manage room settings

messages.create       # Send messages
messages.moderate     # Moderate any messages

tasks.assign          # Assign tasks to users
files.share           # Share files with others
```

## 🔄 RBAC Flow

### 1. **User Authentication**
```
User Login → Verify Credentials → Load User + Roles + Permissions
```

### 2. **Permission Check**
```
API Request → Extract JWT → Check Required Permission → Allow/Deny
```

### 3. **Role Assignment**
```
Admin → Select User → Assign Role → Update user_roles table
```

### 4. **Permission Grant**
```
Admin → Select Role → Grant Permission → Update role_permissions table
```

## 📊 Sample Data

### Default Admin User
```
Email: admin@internal-chat.com
Password: admin123
Role: SUPER_ADMIN
Status: Active, Verified
```

### Permission Examples
```sql
-- User Management Permissions
users.create, users.read, users.update, users.delete, users.manage_roles

-- Chat Management Permissions  
chats.create, chats.read, chats.update, chats.delete, chats.manage_rooms

-- Message Permissions
messages.create, messages.read, messages.update, messages.delete, messages.moderate
```

## 🚀 Usage Examples

### Check User Permissions
```typescript
// Check if user can create tasks
const canCreateTasks = await checkPermission(userId, 'tasks.create');

// Check if user can manage chat rooms
const canManageRooms = await checkPermission(userId, 'chats.manage_rooms');
```

### Get User with Roles
```typescript
const userWithRoles = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    userRoles: {
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    },
    profile: true
  }
});
```

### Assign Role to User
```typescript
await prisma.userRole.create({
  data: {
    userId: userId,
    roleId: roleId,
    assignedBy: adminUserId
  }
});
```

## 🔧 Migration Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Seed database with default data
npm run db:seed

# Reset database
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## 📝 Notes

### Security Considerations
- ✅ Passwords are hashed with bcrypt (12 rounds)
- ✅ JWT tokens with expiration
- ✅ Role-based access control
- ✅ Audit trails (createdBy, updatedBy)
- ✅ Soft delete capabilities (isActive flags)

### Performance Optimizations
- ✅ Indexed foreign keys
- ✅ Unique constraints
- ✅ Efficient relationship queries
- ✅ Pagination support

### Extensibility
- ✅ Custom roles and permissions
- ✅ User profile customization
- ✅ Audit logging ready
- ✅ Multi-tenant ready structure

---

**Created**: 2025-01-15  
**Status**: ✅ Implemented  
**Next**: Setup Express Server (Task 1.2)
