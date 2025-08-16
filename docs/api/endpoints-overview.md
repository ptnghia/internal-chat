# 🔗 API Endpoints Overview

**Status**: ✅ Phase 1 Complete - All endpoints implemented and tested  
**Base URL**: `http://localhost:3001/api` (Development)  
**Production URL**: `https://your-domain.com/api`  
**Last Updated**: January 16, 2025

## 🔐 Authentication

All API endpoints (except public ones) require JWT authentication via `Authorization: Bearer <token>` header.

### Public Endpoints:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /health` - Health check

## 📋 API Endpoints Summary

### 🔐 Authentication Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| `POST` | `/auth/login` | User login with email/username | ✅ Complete |
| `POST` | `/auth/register` | User registration | ✅ Complete |
| `POST` | `/auth/logout` | User logout | ✅ Complete |
| `POST` | `/auth/refresh` | Refresh access token | ✅ Complete |
| `GET` | `/auth/profile` | Get current user profile | ✅ Complete |
| `GET` | `/auth/check` | Check token validity | ✅ Complete |

### 👥 User Management Endpoints
| Method | Endpoint | Description | RBAC Required | Status |
|--------|----------|-------------|---------------|---------|
| `GET` | `/users` | List all users | `users:read` | ✅ Complete |
| `GET` | `/users/:id` | Get user by ID | `users:read` | ✅ Complete |
| `POST` | `/users` | Create new user | `users:create` | ✅ Complete |
| `PUT` | `/users/:id` | Update user | `users:update` | ✅ Complete |
| `DELETE` | `/users/:id` | Delete user | `users:delete` | ✅ Complete |
| `GET` | `/users/:id/roles` | Get user roles | `users:read` | ✅ Complete |
| `POST` | `/users/:id/roles` | Assign role to user | `users:update` | ✅ Complete |

### 🏢 Department Management Endpoints
| Method | Endpoint | Description | RBAC Required | Status |
|--------|----------|-------------|---------------|---------|
| `GET` | `/departments` | List all departments | `departments:read` | ✅ Complete |
| `GET` | `/departments/:id` | Get department by ID | `departments:read` | ✅ Complete |
| `POST` | `/departments` | Create department | `departments:create` | ✅ Complete |
| `PUT` | `/departments/:id` | Update department | `departments:update` | ✅ Complete |
| `DELETE` | `/departments/:id` | Delete department | `departments:delete` | ✅ Complete |
| `GET` | `/departments/:id/teams` | Get department teams | `departments:read` | ✅ Complete |
| `GET` | `/departments/:id/users` | Get department users | `departments:read` | ✅ Complete |

### 👥 Team Management Endpoints
| Method | Endpoint | Description | RBAC Required | Status |
|--------|----------|-------------|---------------|---------|
| `GET` | `/teams` | List all teams | `teams:read` | ✅ Complete |
| `GET` | `/teams/:id` | Get team by ID | `teams:read` | ✅ Complete |
| `POST` | `/teams` | Create team | `teams:create` | ✅ Complete |
| `PUT` | `/teams/:id` | Update team | `teams:update` | ✅ Complete |
| `DELETE` | `/teams/:id` | Delete team | `teams:delete` | ✅ Complete |
| `GET` | `/teams/:id/members` | Get team members | `teams:read` | ✅ Complete |
| `POST` | `/teams/:id/members` | Add team member | `teams:update` | ✅ Complete |
| `DELETE` | `/teams/:id/members/:userId` | Remove team member | `teams:update` | ✅ Complete |

### 💬 Chat Management Endpoints
| Method | Endpoint | Description | RBAC Required | Status |
|--------|----------|-------------|---------------|---------|
| `GET` | `/chats` | List user's chats | `chats:read` | ✅ Complete |
| `GET` | `/chats/:id` | Get chat by ID | `chats:read` | ✅ Complete |
| `POST` | `/chats` | Create new chat | `chats:create` | ✅ Complete |
| `PUT` | `/chats/:id` | Update chat | `chats:update` | ✅ Complete |
| `DELETE` | `/chats/:id` | Delete chat | `chats:delete` | ✅ Complete |
| `GET` | `/chats/:id/messages` | Get chat messages | `chats:read` | ✅ Complete |
| `POST` | `/chats/:id/messages` | Send message | `chats:create` | ✅ Complete |
| `GET` | `/chats/:id/members` | Get chat members | `chats:read` | ✅ Complete |
| `POST` | `/chats/:id/members` | Add chat member | `chats:update` | ✅ Complete |

### 📝 Task Management Endpoints
| Method | Endpoint | Description | RBAC Required | Status |
|--------|----------|-------------|---------------|---------|
| `GET` | `/tasks` | List all tasks | `tasks:read` | ✅ Complete |
| `GET` | `/tasks/:id` | Get task by ID | `tasks:read` | ✅ Complete |
| `POST` | `/tasks` | Create new task | `tasks:create` | ✅ Complete |
| `PUT` | `/tasks/:id` | Update task | `tasks:update` | ✅ Complete |
| `DELETE` | `/tasks/:id` | Delete task | `tasks:delete` | ✅ Complete |
| `GET` | `/tasks/:id/assignments` | Get task assignments | `tasks:read` | ✅ Complete |
| `POST` | `/tasks/:id/assignments` | Assign task | `tasks:update` | ✅ Complete |
| `PUT` | `/tasks/:id/status` | Update task status | `tasks:update` | ✅ Complete |

## 🔒 RBAC Permissions

### Available Permissions (43 total):
```javascript
// User Management
'users:create', 'users:read', 'users:update', 'users:delete',

// Department Management  
'departments:create', 'departments:read', 'departments:update', 'departments:delete',

// Team Management
'teams:create', 'teams:read', 'teams:update', 'teams:delete',

// Chat Management
'chats:create', 'chats:read', 'chats:update', 'chats:delete',

// Task Management
'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete',

// File Management
'files:create', 'files:read', 'files:update', 'files:delete',

// Notification Management
'notifications:create', 'notifications:read', 'notifications:update', 'notifications:delete',

// System Administration
'system:admin', 'system:config', 'system:logs', 'system:backup',

// Role Management
'roles:create', 'roles:read', 'roles:update', 'roles:delete',
'roles:assign', 'roles:revoke',

// Permission Management
'permissions:create', 'permissions:read', 'permissions:update', 'permissions:delete',
'permissions:assign', 'permissions:revoke',

// Report Management
'reports:create', 'reports:read', 'reports:update', 'reports:delete',
'reports:export'
```

### Default Roles:
- **Super Admin**: All permissions
- **Admin**: Most permissions except system admin
- **Manager**: Department and team management
- **Employee**: Basic read/write permissions
- **Guest**: Read-only permissions

## 📊 Response Format

### Success Response:
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  },
  "timestamp": "2025-01-16T10:30:00.000Z"
}
```

## 🔌 Real-time Events (Socket.io)

### Connection:
```javascript
// Client connection with JWT
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});
```

### Events:
| Event | Direction | Description | Status |
|-------|-----------|-------------|---------|
| `chat:join` | Client → Server | Join chat room | ✅ Complete |
| `chat:leave` | Client → Server | Leave chat room | ✅ Complete |
| `message:send` | Client → Server | Send message | ✅ Complete |
| `message:new` | Server → Client | New message received | ✅ Complete |
| `typing:start` | Client → Server | Start typing | ✅ Complete |
| `typing:stop` | Client → Server | Stop typing | ✅ Complete |
| `user:online` | Server → Client | User came online | ✅ Complete |
| `user:offline` | Server → Client | User went offline | ✅ Complete |

## 📈 API Statistics

- **Total Endpoints**: 50+
- **Authentication Endpoints**: 6
- **CRUD Endpoints**: 40+
- **Real-time Events**: 8
- **RBAC Permissions**: 43
- **Default Roles**: 5

**🎉 All endpoints implemented and tested in Phase 1!**

---

**Next Phase**: Advanced features, file upload endpoints, and API optimizations in Phase 2.
