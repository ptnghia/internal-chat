# 🏢 Department & Team Database Schema

## 📋 Overview

Thiết kế database schema cho hệ thống quản lý Department (Phòng ban) và Team (Nhóm) của Internal Chat App, hỗ trợ cấu trúc tổ chức phân cấp và quản lý thành viên.

## 🗄️ Database Tables

### 1. **departments** - Bảng phòng ban

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | UNIQUE, NOT NULL | Department name (slug) |
| displayName | String | NOT NULL | Display name |
| description | String | NULLABLE | Department description |
| code | String | UNIQUE, NULLABLE | Department code (e.g., "IT", "HR") |
| color | String | NULLABLE | UI color code |
| parentId | String | NULLABLE, FOREIGN KEY | Parent department ID |
| email | String | NULLABLE | Department email |
| phone | String | NULLABLE | Department phone |
| address | String | NULLABLE | Department address |
| isActive | Boolean | DEFAULT true | Department status |
| isPublic | Boolean | DEFAULT true | Visibility to all users |
| headUserId | String | NULLABLE, FOREIGN KEY | Department head user ID |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |
| createdBy | String | NULLABLE | Creator user ID |
| updatedBy | String | NULLABLE | Last updater user ID |

### 2. **teams** - Bảng nhóm/team

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | NOT NULL | Team name |
| displayName | String | NOT NULL | Display name |
| description | String | NULLABLE | Team description |
| code | String | NULLABLE | Team code |
| color | String | NULLABLE | UI color code |
| departmentId | String | FOREIGN KEY, NOT NULL | Parent department ID |
| isActive | Boolean | DEFAULT true | Team status |
| isPublic | Boolean | DEFAULT true | Visibility to department |
| maxMembers | Int | NULLABLE | Maximum team size |
| teamType | String | DEFAULT 'permanent' | Team type |
| startDate | DateTime | NULLABLE | Project start date |
| endDate | DateTime | NULLABLE | Project end date |
| leadUserId | String | NULLABLE, FOREIGN KEY | Team lead user ID |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |
| createdBy | String | NULLABLE | Creator user ID |
| updatedBy | String | NULLABLE | Last updater user ID |

**Unique Constraint**: (departmentId, name)

### 3. **user_departments** - Bảng liên kết User-Department

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| departmentId | String | FOREIGN KEY, NOT NULL | Reference to departments.id |
| role | String | DEFAULT 'member' | Role in department |
| isActive | Boolean | DEFAULT true | Assignment status |
| isPrimary | Boolean | DEFAULT false | Primary department flag |
| assignedAt | DateTime | DEFAULT now() | Assignment timestamp |
| assignedBy | String | NULLABLE | Assigner user ID |

**Unique Constraint**: (userId, departmentId)

### 4. **user_teams** - Bảng liên kết User-Team

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| teamId | String | FOREIGN KEY, NOT NULL | Reference to teams.id |
| role | String | DEFAULT 'member' | Role in team |
| isActive | Boolean | DEFAULT true | Assignment status |
| assignedAt | DateTime | DEFAULT now() | Assignment timestamp |
| assignedBy | String | NULLABLE | Assigner user ID |

**Unique Constraint**: (userId, teamId)

## 🔗 Relationships

### Department Relationships
- **Department** ↔ **Department** (Self-referencing hierarchy)
- **Department** ↔ **Team** (One-to-Many)
- **Department** ↔ **UserDepartment** (One-to-Many)
- **Department** ↔ **User** (Department Head, Many-to-One)

### Team Relationships
- **Team** ↔ **Department** (Many-to-One)
- **Team** ↔ **UserTeam** (One-to-Many)
- **Team** ↔ **User** (Team Lead, Many-to-One)

### User Relationships
- **User** ↔ **UserDepartment** (One-to-Many)
- **User** ↔ **UserTeam** (One-to-Many)
- **User** ↔ **Department** (As Head, One-to-Many)
- **User** ↔ **Team** (As Lead, One-to-Many)

## 🏗️ Organizational Structure

### Department Hierarchy
```
Company
├── Executive (EXEC)
├── Human Resources (HR)
│   └── Teams: Recruitment
├── Information Technology (IT)
│   ├── Teams: Backend Development
│   ├── Teams: Frontend Development
│   ├── Teams: DevOps & Infrastructure
│   └── Teams: QA & Testing
├── Sales & Marketing (SALES)
│   ├── Teams: Inside Sales
│   ├── Teams: Field Sales
│   └── Teams: Digital Marketing
├── Finance & Accounting (FIN)
│   └── Teams: Accounting
├── Operations (OPS)
└── Customer Support (CS)
    ├── Teams: Technical Support
    └── Teams: Customer Success
```

## 🎭 Default Departments

### 1. **Executive** 🔴
- **Code**: EXEC
- **Description**: Executive leadership and strategic planning
- **Color**: #8B0000
- **Email**: executive@internal-chat.com

### 2. **Human Resources** 🟠
- **Code**: HR
- **Description**: Employee relations, recruitment, and HR policies
- **Color**: #FF6B6B
- **Email**: hr@internal-chat.com

### 3. **Information Technology** 🔵
- **Code**: IT
- **Description**: Software development, infrastructure, and IT support
- **Color**: #4ECDC4
- **Email**: it@internal-chat.com

### 4. **Sales & Marketing** 🟢
- **Code**: SALES
- **Description**: Sales operations, marketing campaigns, and customer relations
- **Color**: #45B7D1
- **Email**: sales@internal-chat.com

### 5. **Finance & Accounting** 🟡
- **Code**: FIN
- **Description**: Financial planning, accounting, and budget management
- **Color**: #96CEB4
- **Email**: finance@internal-chat.com

### 6. **Operations** 🟠
- **Code**: OPS
- **Description**: Daily operations, logistics, and process management
- **Color**: #FFEAA7
- **Email**: operations@internal-chat.com

### 7. **Customer Support** 🟣
- **Code**: CS
- **Description**: Customer service, technical support, and client relations
- **Color**: #DDA0DD
- **Email**: support@internal-chat.com

## 👥 Default Teams

### IT Department Teams
- **Backend Development** (BE-DEV) - Server-side development, APIs
- **Frontend Development** (FE-DEV) - UI/UX development
- **DevOps & Infrastructure** (DEVOPS) - System administration
- **QA & Testing** (QA) - Quality assurance and testing

### Sales & Marketing Teams
- **Inside Sales** (IN-SALES) - Internal sales operations
- **Field Sales** (FIELD-SALES) - External sales and client relations
- **Digital Marketing** (DIGITAL-MKT) - Online marketing campaigns

### Customer Support Teams
- **Technical Support** (TECH-SUP) - Technical assistance
- **Customer Success** (CS-SUCCESS) - Customer onboarding

### Other Teams
- **Recruitment** (RECRUIT) - Talent acquisition
- **Accounting** (ACCOUNT) - Financial records and reporting

## 🔐 Role System

### Department Roles
- **member**: Regular department member
- **manager**: Department manager with team oversight
- **admin**: Department administrator with full access

### Team Roles
- **member**: Regular team member
- **lead**: Team leader with team management
- **admin**: Team administrator with full access

## 📊 Team Types

### 1. **Permanent Teams**
- Long-term, stable teams
- No end date
- Core business functions

### 2. **Temporary Teams**
- Short-term teams for specific purposes
- Has end date
- Disbanded after completion

### 3. **Project Teams**
- Project-specific teams
- Has start and end dates
- Cross-functional collaboration

## 🚀 Usage Examples

### Get Department with Teams and Members
```typescript
const department = await prisma.department.findUnique({
  where: { id: departmentId },
  include: {
    teams: {
      include: {
        userTeams: {
          include: { user: true }
        },
        lead: true
      }
    },
    userDepartments: {
      include: { user: true }
    },
    head: true,
    parent: true,
    children: true
  }
});
```

### Get User's Departments and Teams
```typescript
const userOrganization = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    userDepartments: {
      include: {
        department: {
          include: { teams: true }
        }
      }
    },
    userTeams: {
      include: {
        team: {
          include: { department: true }
        }
      }
    }
  }
});
```

### Assign User to Department
```typescript
await prisma.userDepartment.create({
  data: {
    userId: userId,
    departmentId: departmentId,
    role: 'member',
    isPrimary: false,
    assignedBy: managerId
  }
});
```

### Create Team with Lead
```typescript
const team = await prisma.team.create({
  data: {
    name: 'Mobile Development',
    displayName: 'Mobile Development Team',
    description: 'iOS and Android app development',
    code: 'MOBILE',
    departmentId: itDepartmentId,
    leadUserId: teamLeadId,
    teamType: 'permanent',
    createdBy: managerId
  }
});
```

## 🔧 Migration Commands

```bash
# Generate Prisma client
cd backend && npm run db:generate

# Push schema changes
cd backend && npm run db:push

# Seed with departments and teams
cd backend && npm run db:seed

# View in Prisma Studio
cd backend && npm run db:studio
```

## 📝 Notes

### Hierarchy Features
- ✅ Department hierarchy support (parent-child)
- ✅ Department heads and team leads
- ✅ Multiple team types (permanent, temporary, project)
- ✅ Primary department designation for users

### Business Rules
- ✅ Users can belong to multiple departments
- ✅ Users can belong to multiple teams
- ✅ Teams belong to exactly one department
- ✅ Departments can have sub-departments
- ✅ Team size limits (maxMembers)

### Data Integrity
- ✅ Cascade delete for department-team relationships
- ✅ Unique constraints for user assignments
- ✅ Audit trails (createdBy, updatedBy)
- ✅ Soft delete capabilities (isActive flags)

---

**Created**: 2025-01-15  
**Status**: ✅ Implemented  
**Next**: Chat & Message Schema (Task 3.3)
