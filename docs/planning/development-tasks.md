# 📋 Development Tasks - Internal Chat App

## 🎯 Quy Trình Làm Việc

### 🔄 Workflow Steps:
1. **Kiểm tra task** → Chọn task cần làm → Cập nhật trạng thái task → Thực hiện task
2. **Commit và push** lên git sau khi xong mỗi task
3. **Cập nhật trạng thái hoàn thành** cho task và cập nhật tiến độ trong `docs/planning/`
4. **Quay lại bước 1** để làm việc với task tiếp theo cho đến khi mọi task đều hoàn thành

### 📊 Task Status:
- `[ ]` = NOT_STARTED (chưa bắt đầu)
- `[/]` = IN_PROGRESS (đang thực hiện)
- `[x]` = COMPLETE (hoàn thành)
- `[-]` = CANCELLED (hủy bỏ)

---

## 🔧 1. Setup Backend API
**Status**: `[ ]` NOT_STARTED  
**Description**: Tạo Node.js server với Express + Prisma cho Internal Chat App

### Subtasks:
- `[ ]` **1.1 Khởi tạo Backend Project**
  - Tạo cấu trúc thư mục backend
  - Setup package.json với dependencies
  - Cấu hình TypeScript (tsconfig.json)
  - Setup build scripts và development scripts
  - **Estimated Time**: 30 phút

- `[ ]` **1.2 Setup Express Server**
  - Cài đặt Express.js và types
  - Tạo basic server setup
  - Cấu hình middleware (cors, helmet, morgan)
  - Setup error handling middleware
  - **Estimated Time**: 45 phút

- `[ ]` **1.3 Setup Prisma ORM**
  - Cài đặt Prisma CLI và client
  - Tạo prisma/schema.prisma cơ bản
  - Cấu hình database connection
  - Setup Prisma generate và migrate scripts
  - **Estimated Time**: 1 giờ

- `[ ]` **1.4 Environment Configuration**
  - Tạo .env template và .env.example
  - Setup environment validation
  - Cấu hình different environments (dev, staging, prod)
  - **Estimated Time**: 30 phút

- `[ ]` **1.5 Basic API Structure**
  - Tạo folder structure (routes, controllers, middleware, services)
  - Setup basic health check endpoint
  - Tạo API versioning structure
  - Setup request/response types
  - **Estimated Time**: 45 phút

**Total Estimated Time**: 3 giờ 30 phút

---

## 🎨 2. Setup Frontend
**Status**: `[ ]` NOT_STARTED  
**Description**: Tạo React app với Material-UI cho Internal Chat App

### Subtasks:
- `[ ]` **2.1 Khởi tạo React Project**
  - Tạo React app với Vite + TypeScript
  - Cấu hình Vite config và build settings
  - Setup folder structure chuẩn
  - Cấu hình ESLint và Prettier
  - **Estimated Time**: 45 phút

- `[ ]` **2.2 Setup Material-UI**
  - Cài đặt MUI packages (@mui/material, @emotion/react, @emotion/styled)
  - Tạo theme system (colors, typography, spacing)
  - Setup ThemeProvider và CssBaseline
  - Tạo custom theme với dark/light mode
  - **Estimated Time**: 1 giờ

- `[ ]` **2.3 Setup Redux Toolkit**
  - Cài đặt Redux Toolkit và React-Redux
  - Cấu hình store và root reducer
  - Setup RTK Query cho API calls
  - Tạo basic slices (auth, ui)
  - **Estimated Time**: 1 giờ 15 phút

- `[ ]` **2.4 Setup Routing**
  - Cài đặt React Router v6
  - Tạo route configuration
  - Setup protected routes component
  - Cấu hình navigation guards
  - **Estimated Time**: 45 phút

- `[ ]` **2.5 Basic Layout Components**
  - Tạo Header component với navigation
  - Tạo Sidebar component với menu
  - Tạo Main layout wrapper
  - Setup responsive design breakpoints
  - **Estimated Time**: 1 giờ 30 phút

**Total Estimated Time**: 5 giờ 15 phút

---

## 🗄️ 3. Database Schema
**Status**: `[/]` IN_PROGRESS (4/5 completed)
**Description**: Thiết kế database schema cho chat app với các bảng chính

### Subtasks:
- `[x]` **3.1 User & Role Schema** ✅ **COMPLETED**
  - Thiết kế bảng Users (id, email, password, profile info)
  - Thiết kế bảng Roles (id, name, permissions)
  - Thiết kế bảng UserRoles (many-to-many relationship)
  - Setup RBAC permissions structure
  - **Estimated Time**: 1 giờ ✅ **DONE**
  - **Completed**: 2025-01-15
  - **Results**: 6 database tables, 5 system roles, 43 permissions, default admin user

- `[x]` **3.2 Department & Team Schema** ✅ **COMPLETED**
  - Thiết kế bảng Departments (id, name, description, hierarchy)
  - Thiết kế bảng Teams (id, name, department_id)
  - Thiết kế bảng UserDepartments và UserTeams
  - Setup organizational hierarchy
  - **Estimated Time**: 45 phút ✅ **DONE**
  - **Completed**: 2025-01-15
  - **Results**: 4 new tables, 7 departments, 11 teams, organizational hierarchy

- `[x]` **3.3 Chat & Message Schema** ✅ **COMPLETED**
  - Thiết kế bảng Chats (id, name, type, participants)
  - Thiết kế bảng Messages (id, chat_id, sender_id, content, timestamp)
  - Thiết kế bảng MessageTypes và MessageReactions
  - Setup message threading và replies
  - **Estimated Time**: 1 giờ 15 phút ✅ **DONE**
  - **Completed**: 2025-01-15
  - **Results**: 6 new tables, 13 chats, 5 message types, real-time messaging foundation

- `[x]` **3.4 Task Management Schema** ✅ **COMPLETED**
  - Thiết kế bảng Tasks (id, title, description, status, priority)
  - Thiết kế bảng TaskAssignments (task_id, user_id, role)
  - Thiết kế bảng TaskComments và TaskAttachments
  - Setup task workflow và dependencies
  - **Estimated Time**: 1 giờ 30 phút ✅ **DONE**
  - **Completed**: 2025-01-15
  - **Results**: 10 new tables, epic with 5 stories, complete project management system

- `[ ]` **3.5 File & Notification Schema**
  - Thiết kế bảng Files (id, name, path, size, type)
  - Thiết kế bảng Notifications (id, user_id, type, content)
  - Thiết kế bảng UserSettings và SystemSettings
  - Setup audit logs và activity tracking
  - **Estimated Time**: 1 giờ

**Total Estimated Time**: 5 giờ 30 phút

---

## 🔐 4. Authentication
**Status**: `[ ]` NOT_STARTED  
**Description**: Implement JWT authentication system với login, register và RBAC

### Subtasks:
- `[ ]` **4.1 JWT Setup & Configuration**
  - Cài đặt jsonwebtoken và @types/jsonwebtoken
  - Tạo JWT utilities (generate, verify, decode)
  - Setup JWT middleware cho protected routes
  - Cấu hình access token và refresh token
  - **Estimated Time**: 1 giờ

- `[ ]` **4.2 Password Hashing**
  - Cài đặt bcrypt và @types/bcrypt
  - Tạo password hashing utilities
  - Setup password validation rules
  - Implement password reset functionality
  - **Estimated Time**: 45 phút

- `[ ]` **4.3 Auth API Endpoints**
  - Tạo POST /auth/register endpoint
  - Tạo POST /auth/login endpoint
  - Tạo POST /auth/logout endpoint
  - Tạo POST /auth/refresh endpoint
  - Setup input validation và error handling
  - **Estimated Time**: 2 giờ

- `[ ]` **4.4 RBAC Middleware**
  - Tạo role checking middleware
  - Implement permission-based access control
  - Setup route protection by roles
  - Tạo admin-only endpoints
  - **Estimated Time**: 1 giờ 30 phút

- `[ ]` **4.5 Auth Frontend Integration**
  - Tạo Login và Register components
  - Setup auth Redux slice và actions
  - Implement protected route wrapper
  - Tạo auth context và hooks
  - **Estimated Time**: 2 giờ 30 phút

**Total Estimated Time**: 7 giờ 45 phút

---

## ⚡ 5. Real-time Chat
**Status**: `[ ]` NOT_STARTED  
**Description**: Setup Socket.io cho real-time messaging và chat functionality

### Subtasks:
- `[ ]` **5.1 Socket.io Server Setup**
  - Cài đặt socket.io và @types/socket.io
  - Tích hợp Socket.io với Express server
  - Setup CORS cho Socket.io connections
  - Cấu hình Socket.io namespaces
  - **Estimated Time**: 1 giờ

- `[ ]` **5.2 Socket Authentication**
  - Tích hợp JWT authentication với Socket.io
  - Setup socket middleware cho auth verification
  - Implement user session management
  - Handle authentication errors
  - **Estimated Time**: 1 giờ 30 phút

- `[ ]` **5.3 Chat Room Management**
  - Implement join/leave room functionality
  - Setup user presence tracking (online/offline)
  - Tạo room-based message broadcasting
  - Handle multiple chat rooms per user
  - **Estimated Time**: 2 giờ

- `[ ]` **5.4 Message Broadcasting**
  - Implement real-time message sending
  - Setup message persistence to database
  - Handle message delivery confirmation
  - Implement typing indicators
  - **Estimated Time**: 2 giờ 30 phút

- `[ ]` **5.5 Frontend Socket Integration**
  - Cài đặt socket.io-client
  - Tạo Socket context và hooks
  - Implement real-time message UI
  - Setup connection status indicators
  - **Estimated Time**: 2 giờ 30 phút

**Total Estimated Time**: 9 giờ 30 phút

---

## 📊 Progress Summary

### Overall Progress: 4/25 tasks completed (16%)

### By Main Category:
- **🔧 Backend API**: 0/5 tasks (0%)
- **🎨 Frontend**: 0/5 tasks (0%)
- **🗄️ Database Schema**: 4/5 tasks (80%) ✅ 3.1 User & Role ✅ 3.2 Department & Team ✅ 3.3 Chat & Message ✅ 3.4 Task Management
- **🔐 Authentication**: 0/5 tasks (0%)
- **⚡ Real-time Chat**: 0/5 tasks (0%)

### Total Estimated Time: 31 giờ 30 phút

### Recommended Order:
1. **Database Schema** (foundation)
2. **Backend API** (server setup)
3. **Authentication** (security layer)
4. **Frontend** (user interface)
5. **Real-time Chat** (advanced features)

---

## 📝 Notes

### Dependencies:
- Database Schema phải hoàn thành trước Backend API
- Backend API phải hoàn thành trước Authentication
- Authentication phải hoàn thành trước Real-time Chat
- Frontend có thể develop song song với Backend

### Git Commit Convention:
```
feat: add user authentication system
fix: resolve database connection issue
docs: update API documentation
style: format code with prettier
refactor: restructure auth middleware
test: add unit tests for auth service
chore: update dependencies
```

---

**Last Updated**: 2025-01-15 21:15
**Current Task**: 3.5 File & Notification Schema
**Next Recommended**: Complete Database Schema foundation
