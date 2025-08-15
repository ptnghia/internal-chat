import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ================================
  // PERMISSIONS SEEDING
  // ================================
  console.log('📋 Creating permissions...');

  const permissions = [
    // User Management
    { name: 'users.create', displayName: 'Create Users', description: 'Create new user accounts', resource: 'users', action: 'create' },
    { name: 'users.read', displayName: 'View Users', description: 'View user information', resource: 'users', action: 'read' },
    { name: 'users.update', displayName: 'Update Users', description: 'Update user information', resource: 'users', action: 'update' },
    { name: 'users.delete', displayName: 'Delete Users', description: 'Delete user accounts', resource: 'users', action: 'delete' },
    { name: 'users.manage_roles', displayName: 'Manage User Roles', description: 'Assign/remove user roles', resource: 'users', action: 'manage_roles' },

    // Department Management
    { name: 'departments.create', displayName: 'Create Departments', description: 'Create new departments', resource: 'departments', action: 'create' },
    { name: 'departments.read', displayName: 'View Departments', description: 'View department information', resource: 'departments', action: 'read' },
    { name: 'departments.update', displayName: 'Update Departments', description: 'Update department information', resource: 'departments', action: 'update' },
    { name: 'departments.delete', displayName: 'Delete Departments', description: 'Delete departments', resource: 'departments', action: 'delete' },
    { name: 'departments.manage_members', displayName: 'Manage Department Members', description: 'Add/remove department members', resource: 'departments', action: 'manage_members' },

    // Team Management
    { name: 'teams.create', displayName: 'Create Teams', description: 'Create new teams', resource: 'teams', action: 'create' },
    { name: 'teams.read', displayName: 'View Teams', description: 'View team information', resource: 'teams', action: 'read' },
    { name: 'teams.update', displayName: 'Update Teams', description: 'Update team information', resource: 'teams', action: 'update' },
    { name: 'teams.delete', displayName: 'Delete Teams', description: 'Delete teams', resource: 'teams', action: 'delete' },
    { name: 'teams.manage_members', displayName: 'Manage Team Members', description: 'Add/remove team members', resource: 'teams', action: 'manage_members' },

    // Chat Management
    { name: 'chats.create', displayName: 'Create Chats', description: 'Create new chat rooms', resource: 'chats', action: 'create' },
    { name: 'chats.read', displayName: 'View Chats', description: 'View chat rooms and messages', resource: 'chats', action: 'read' },
    { name: 'chats.update', displayName: 'Update Chats', description: 'Update chat room settings', resource: 'chats', action: 'update' },
    { name: 'chats.delete', displayName: 'Delete Chats', description: 'Delete chat rooms', resource: 'chats', action: 'delete' },
    { name: 'chats.manage_rooms', displayName: 'Manage Chat Rooms', description: 'Manage chat room members and settings', resource: 'chats', action: 'manage_rooms' },

    // Message Management
    { name: 'messages.create', displayName: 'Send Messages', description: 'Send messages in chats', resource: 'messages', action: 'create' },
    { name: 'messages.read', displayName: 'Read Messages', description: 'Read messages in chats', resource: 'messages', action: 'read' },
    { name: 'messages.update', displayName: 'Edit Messages', description: 'Edit own messages', resource: 'messages', action: 'update' },
    { name: 'messages.delete', displayName: 'Delete Messages', description: 'Delete own messages', resource: 'messages', action: 'delete' },
    { name: 'messages.moderate', displayName: 'Moderate Messages', description: 'Moderate any messages', resource: 'messages', action: 'moderate' },

    // Task Management
    { name: 'tasks.create', displayName: 'Create Tasks', description: 'Create new tasks', resource: 'tasks', action: 'create' },
    { name: 'tasks.read', displayName: 'View Tasks', description: 'View tasks', resource: 'tasks', action: 'read' },
    { name: 'tasks.update', displayName: 'Update Tasks', description: 'Update task information', resource: 'tasks', action: 'update' },
    { name: 'tasks.delete', displayName: 'Delete Tasks', description: 'Delete tasks', resource: 'tasks', action: 'delete' },
    { name: 'tasks.assign', displayName: 'Assign Tasks', description: 'Assign tasks to users', resource: 'tasks', action: 'assign' },
    { name: 'tasks.manage', displayName: 'Manage Tasks', description: 'Full task management', resource: 'tasks', action: 'manage' },

    // File Management
    { name: 'files.create', displayName: 'Upload Files', description: 'Upload files', resource: 'files', action: 'create' },
    { name: 'files.read', displayName: 'View Files', description: 'View file information', resource: 'files', action: 'read' },
    { name: 'files.update', displayName: 'Update Files', description: 'Update file information', resource: 'files', action: 'update' },
    { name: 'files.delete', displayName: 'Delete Files', description: 'Delete files', resource: 'files', action: 'delete' },
    { name: 'files.download', displayName: 'Download Files', description: 'Download files', resource: 'files', action: 'download' },
    { name: 'files.share', displayName: 'Share Files', description: 'Share files with others', resource: 'files', action: 'share' },

    // Reports
    { name: 'reports.create', displayName: 'Create Reports', description: 'Create custom reports', resource: 'reports', action: 'create' },
    { name: 'reports.read', displayName: 'View Reports', description: 'View reports', resource: 'reports', action: 'read' },
    { name: 'reports.export', displayName: 'Export Reports', description: 'Export reports to files', resource: 'reports', action: 'export' },

    // System Settings
    { name: 'settings.read', displayName: 'View Settings', description: 'View system settings', resource: 'settings', action: 'read' },
    { name: 'settings.update', displayName: 'Update Settings', description: 'Update system settings', resource: 'settings', action: 'update' },
    { name: 'settings.manage_system', displayName: 'Manage System', description: 'Full system management', resource: 'settings', action: 'manage_system' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: {
        ...permission,
        isSystem: true,
      },
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // ================================
  // ROLES SEEDING
  // ================================
  console.log('👥 Creating roles...');

  const roles = [
    {
      name: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      color: '#FF0000',
      isSystem: true,
      permissions: permissions.map(p => p.name), // All permissions
    },
    {
      name: 'ADMIN',
      displayName: 'Administrator',
      description: 'Administrative access with most permissions',
      color: '#FF6600',
      isSystem: true,
      permissions: permissions.filter(p => !p.name.includes('settings.manage_system')).map(p => p.name),
    },
    {
      name: 'MANAGER',
      displayName: 'Manager',
      description: 'Department and team management access',
      color: '#0066FF',
      isSystem: true,
      permissions: [
        'users.read', 'users.update',
        'departments.read', 'departments.update', 'departments.manage_members',
        'teams.create', 'teams.read', 'teams.update', 'teams.delete', 'teams.manage_members',
        'chats.create', 'chats.read', 'chats.update', 'chats.manage_rooms',
        'messages.create', 'messages.read', 'messages.update', 'messages.delete', 'messages.moderate',
        'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete', 'tasks.assign', 'tasks.manage',
        'files.create', 'files.read', 'files.update', 'files.delete', 'files.download', 'files.share',
        'reports.create', 'reports.read', 'reports.export',
        'settings.read',
      ],
    },
    {
      name: 'EMPLOYEE',
      displayName: 'Employee',
      description: 'Basic user access for employees',
      color: '#00AA00',
      isSystem: true,
      permissions: [
        'users.read',
        'departments.read',
        'teams.read',
        'chats.create', 'chats.read', 'chats.update',
        'messages.create', 'messages.read', 'messages.update', 'messages.delete',
        'tasks.create', 'tasks.read', 'tasks.update',
        'files.create', 'files.read', 'files.update', 'files.delete', 'files.download', 'files.share',
        'reports.read',
        'settings.read',
      ],
    },
    {
      name: 'GUEST',
      displayName: 'Guest',
      description: 'Limited read-only access',
      color: '#888888',
      isSystem: true,
      permissions: [
        'users.read',
        'departments.read',
        'teams.read',
        'chats.read',
        'messages.read',
        'tasks.read',
        'files.read', 'files.download',
        'reports.read',
        'settings.read',
      ],
    },
  ];

  for (const roleData of roles) {
    const { permissions: rolePermissions, ...roleInfo } = roleData;
    
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleInfo,
    });

    // Assign permissions to role
    for (const permissionName of rolePermissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
            isActive: true,
          },
        });
      }
    }
  }

  console.log(`✅ Created ${roles.length} roles with permissions`);

  // ================================
  // DEFAULT ADMIN USER
  // ================================
  console.log('👤 Creating default admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@internal-chat.com' },
    update: {},
    create: {
      email: 'admin@internal-chat.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
      isVerified: true,
      profile: {
        create: {
          bio: 'System Administrator Account',
          timezone: 'UTC',
          language: 'en',
          theme: 'light',
        },
      },
    },
  });

  // Assign SUPER_ADMIN role to admin user
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        isActive: true,
      },
    });
  }

  console.log('✅ Created default admin user');
  console.log('📧 Email: admin@internal-chat.com');
  console.log('🔑 Password: admin123');

  // ================================
  // DEPARTMENTS SEEDING
  // ================================
  console.log('🏢 Creating departments...');

  const departments = [
    {
      name: 'executive',
      displayName: 'Executive',
      description: 'Executive leadership and strategic planning',
      code: 'EXEC',
      color: '#8B0000',
      email: 'executive@internal-chat.com',
      isPublic: true,
    },
    {
      name: 'human_resources',
      displayName: 'Human Resources',
      description: 'Employee relations, recruitment, and HR policies',
      code: 'HR',
      color: '#FF6B6B',
      email: 'hr@internal-chat.com',
      isPublic: true,
    },
    {
      name: 'information_technology',
      displayName: 'Information Technology',
      description: 'Software development, infrastructure, and IT support',
      code: 'IT',
      color: '#4ECDC4',
      email: 'it@internal-chat.com',
      isPublic: true,
    },
    {
      name: 'sales_marketing',
      displayName: 'Sales & Marketing',
      description: 'Sales operations, marketing campaigns, and customer relations',
      code: 'SALES',
      color: '#45B7D1',
      email: 'sales@internal-chat.com',
      isPublic: true,
    },
    {
      name: 'finance_accounting',
      displayName: 'Finance & Accounting',
      description: 'Financial planning, accounting, and budget management',
      code: 'FIN',
      color: '#96CEB4',
      email: 'finance@internal-chat.com',
      isPublic: true,
    },
    {
      name: 'operations',
      displayName: 'Operations',
      description: 'Daily operations, logistics, and process management',
      code: 'OPS',
      color: '#FFEAA7',
      email: 'operations@internal-chat.com',
      isPublic: true,
    },
    {
      name: 'customer_support',
      displayName: 'Customer Support',
      description: 'Customer service, technical support, and client relations',
      code: 'CS',
      color: '#DDA0DD',
      email: 'support@internal-chat.com',
      isPublic: true,
    },
  ];

  const createdDepartments = [];
  for (const deptData of departments) {
    const department = await prisma.department.upsert({
      where: { name: deptData.name },
      update: {},
      create: {
        ...deptData,
        createdBy: adminUser.id,
      },
    });
    createdDepartments.push(department);
  }

  console.log(`✅ Created ${departments.length} departments`);

  // ================================
  // TEAMS SEEDING
  // ================================
  console.log('👥 Creating teams...');

  const teams = [
    // IT Department Teams
    {
      name: 'Backend Development',
      displayName: 'Backend Development Team',
      description: 'Server-side development, APIs, and database management',
      code: 'BE-DEV',
      color: '#2C3E50',
      departmentName: 'information_technology',
      teamType: 'permanent',
    },
    {
      name: 'Frontend Development',
      displayName: 'Frontend Development Team',
      description: 'User interface development and user experience',
      code: 'FE-DEV',
      color: '#3498DB',
      departmentName: 'information_technology',
      teamType: 'permanent',
    },
    {
      name: 'DevOps & Infrastructure',
      displayName: 'DevOps & Infrastructure Team',
      description: 'System administration, deployment, and infrastructure',
      code: 'DEVOPS',
      color: '#E74C3C',
      departmentName: 'information_technology',
      teamType: 'permanent',
    },
    {
      name: 'QA & Testing',
      displayName: 'Quality Assurance & Testing',
      description: 'Software testing, quality assurance, and automation',
      code: 'QA',
      color: '#9B59B6',
      departmentName: 'information_technology',
      teamType: 'permanent',
    },

    // Sales & Marketing Teams
    {
      name: 'Inside Sales',
      displayName: 'Inside Sales Team',
      description: 'Internal sales operations and lead qualification',
      code: 'IN-SALES',
      color: '#27AE60',
      departmentName: 'sales_marketing',
      teamType: 'permanent',
    },
    {
      name: 'Field Sales',
      displayName: 'Field Sales Team',
      description: 'External sales and client relationship management',
      code: 'FIELD-SALES',
      color: '#16A085',
      departmentName: 'sales_marketing',
      teamType: 'permanent',
    },
    {
      name: 'Digital Marketing',
      displayName: 'Digital Marketing Team',
      description: 'Online marketing, social media, and digital campaigns',
      code: 'DIGITAL-MKT',
      color: '#F39C12',
      departmentName: 'sales_marketing',
      teamType: 'permanent',
    },

    // Customer Support Teams
    {
      name: 'Technical Support',
      displayName: 'Technical Support Team',
      description: 'Technical assistance and troubleshooting',
      code: 'TECH-SUP',
      color: '#8E44AD',
      departmentName: 'customer_support',
      teamType: 'permanent',
    },
    {
      name: 'Customer Success',
      displayName: 'Customer Success Team',
      description: 'Customer onboarding and success management',
      code: 'CS-SUCCESS',
      color: '#2980B9',
      departmentName: 'customer_support',
      teamType: 'permanent',
    },

    // HR Teams
    {
      name: 'Recruitment',
      displayName: 'Recruitment Team',
      description: 'Talent acquisition and recruitment processes',
      code: 'RECRUIT',
      color: '#E67E22',
      departmentName: 'human_resources',
      teamType: 'permanent',
    },

    // Finance Teams
    {
      name: 'Accounting',
      displayName: 'Accounting Team',
      description: 'Financial records, bookkeeping, and reporting',
      code: 'ACCOUNT',
      color: '#34495E',
      departmentName: 'finance_accounting',
      teamType: 'permanent',
    },
  ];

  for (const teamData of teams) {
    const { departmentName, ...teamInfo } = teamData;
    const department = createdDepartments.find(d => d.name === departmentName);

    if (department) {
      await prisma.team.upsert({
        where: {
          departmentId_name: {
            departmentId: department.id,
            name: teamData.name,
          },
        },
        update: {},
        create: {
          ...teamInfo,
          departmentId: department.id,
          createdBy: adminUser.id,
        },
      });
    }
  }

  console.log(`✅ Created ${teams.length} teams`);

  // ================================
  // ASSIGN ADMIN TO DEPARTMENTS
  // ================================
  console.log('🔗 Assigning admin user to departments...');

  // Assign admin to IT department as manager
  const itDepartment = createdDepartments.find(d => d.name === 'information_technology');
  if (itDepartment) {
    await prisma.userDepartment.upsert({
      where: {
        userId_departmentId: {
          userId: adminUser.id,
          departmentId: itDepartment.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        departmentId: itDepartment.id,
        role: 'manager',
        isPrimary: true,
        assignedBy: adminUser.id,
      },
    });

    // Set admin as department head
    await prisma.department.update({
      where: { id: itDepartment.id },
      data: { headUserId: adminUser.id },
    });
  }

  console.log('✅ Assigned admin user to departments');

  // ================================
  // MESSAGE TYPES SEEDING
  // ================================
  console.log('💬 Creating message types...');

  const messageTypes = [
    {
      name: 'text',
      displayName: 'Text Message',
      description: 'Regular text message',
      icon: '💬',
      color: '#333333',
      isSystem: false,
      allowReactions: true,
      allowReplies: true,
      allowEditing: true,
      allowDeleting: true,
    },
    {
      name: 'image',
      displayName: 'Image Message',
      description: 'Image attachment message',
      icon: '🖼️',
      color: '#4CAF50',
      isSystem: false,
      allowReactions: true,
      allowReplies: true,
      allowEditing: false,
      allowDeleting: true,
    },
    {
      name: 'file',
      displayName: 'File Message',
      description: 'File attachment message',
      icon: '📎',
      color: '#2196F3',
      isSystem: false,
      allowReactions: true,
      allowReplies: true,
      allowEditing: false,
      allowDeleting: true,
    },
    {
      name: 'system',
      displayName: 'System Message',
      description: 'System generated message',
      icon: '⚙️',
      color: '#9E9E9E',
      isSystem: true,
      allowReactions: false,
      allowReplies: false,
      allowEditing: false,
      allowDeleting: false,
    },
    {
      name: 'announcement',
      displayName: 'Announcement',
      description: 'Important announcement message',
      icon: '📢',
      color: '#FF9800',
      isSystem: false,
      allowReactions: true,
      allowReplies: true,
      allowEditing: true,
      allowDeleting: true,
    },
  ];

  for (const messageType of messageTypes) {
    await prisma.messageType.upsert({
      where: { name: messageType.name },
      update: {},
      create: messageType,
    });
  }

  console.log(`✅ Created ${messageTypes.length} message types`);

  // ================================
  // DEFAULT CHATS SEEDING
  // ================================
  console.log('💬 Creating default chats...');

  const defaultChats = [
    {
      name: 'General',
      description: 'General company-wide discussion',
      type: 'announcement',
      isPrivate: false,
      allowGuests: false,
      allowFileSharing: true,
      allowReactions: true,
      allowThreads: true,
      departmentId: null,
      teamId: null,
    },
    {
      name: 'Random',
      description: 'Casual conversations and off-topic discussions',
      type: 'group',
      isPrivate: false,
      allowGuests: false,
      allowFileSharing: true,
      allowReactions: true,
      allowThreads: true,
      departmentId: null,
      teamId: null,
    },
  ];

  // Create department-specific chats
  for (const department of createdDepartments) {
    defaultChats.push({
      name: `${department.displayName} General`,
      description: `General discussion for ${department.displayName} department`,
      type: 'department',
      isPrivate: false,
      allowGuests: false,
      allowFileSharing: true,
      allowReactions: true,
      allowThreads: true,
      departmentId: department.id,
      teamId: null,
    });
  }

  // Create team-specific chats for IT teams
  const itDept = createdDepartments.find(d => d.name === 'information_technology');
  if (itDept) {
    const itTeams = await prisma.team.findMany({
      where: { departmentId: itDept.id },
    });

    for (const team of itTeams) {
      defaultChats.push({
        name: `${team.displayName} Team`,
        description: `Team discussion for ${team.displayName}`,
        type: 'team',
        isPrivate: false,
        allowGuests: false,
        allowFileSharing: true,
        allowReactions: true,
        allowThreads: true,
        departmentId: itDept.id,
        teamId: team.id,
      });
    }
  }

  const createdChats = [];
  for (const chatData of defaultChats) {
    const chat = await prisma.chat.create({
      data: {
        ...chatData,
        createdBy: adminUser.id,
      },
    });
    createdChats.push(chat);
  }

  console.log(`✅ Created ${createdChats.length} default chats`);

  // ================================
  // ADD ADMIN TO CHATS
  // ================================
  console.log('👤 Adding admin user to chats...');

  for (const chat of createdChats) {
    await prisma.chatMember.create({
      data: {
        chatId: chat.id,
        userId: adminUser.id,
        role: 'admin',
        canInvite: true,
        canKick: true,
        canPin: true,
        canModerate: true,
        joinedAt: new Date(),
      },
    });
  }

  console.log('✅ Added admin user to all chats');

  // ================================
  // WELCOME MESSAGES
  // ================================
  console.log('💬 Creating welcome messages...');

  const generalChat = createdChats.find(c => c.name === 'General');
  if (generalChat) {
    await prisma.message.create({
      data: {
        chatId: generalChat.id,
        senderId: adminUser.id,
        content: '🎉 Welcome to Internal Chat! This is the general channel for company-wide announcements and discussions.',
        type: 'announcement',
        isPinned: true,
      },
    });

    // Pin the welcome message
    const welcomeMessage = await prisma.message.findFirst({
      where: { chatId: generalChat.id },
      orderBy: { createdAt: 'asc' },
    });

    if (welcomeMessage) {
      await prisma.pinnedMessage.create({
        data: {
          chatId: generalChat.id,
          messageId: welcomeMessage.id,
          pinnedBy: adminUser.id,
          reason: 'Welcome message',
        },
      });
    }
  }

  console.log('✅ Created welcome messages');

  // ================================
  // TASK MANAGEMENT SEEDING
  // ================================
  console.log('📋 Creating task management data...');

  // Task Priorities
  const taskPriorities = [
    { name: 'critical', displayName: 'Critical', description: 'Critical priority - immediate attention required', color: '#FF0000', icon: '🔥', level: 1 },
    { name: 'high', displayName: 'High', description: 'High priority - important task', color: '#FF6600', icon: '⬆️', level: 2 },
    { name: 'medium', displayName: 'Medium', description: 'Medium priority - normal task', color: '#FFA500', icon: '➡️', level: 3, isDefault: true },
    { name: 'low', displayName: 'Low', description: 'Low priority - can be done later', color: '#00AA00', icon: '⬇️', level: 4 },
    { name: 'minimal', displayName: 'Minimal', description: 'Minimal priority - nice to have', color: '#888888', icon: '⏬', level: 5 },
  ];

  for (const priority of taskPriorities) {
    await prisma.taskPriority.upsert({
      where: { name: priority.name },
      update: {},
      create: priority,
    });
  }

  // Task Statuses
  const taskStatuses = [
    { name: 'todo', displayName: 'To Do', description: 'Task is ready to be worked on', color: '#6B7280', icon: '📝', order: 1, category: 'backlog', isDefault: true },
    { name: 'in_progress', displayName: 'In Progress', description: 'Task is currently being worked on', color: '#3B82F6', icon: '🔄', order: 2, category: 'active' },
    { name: 'review', displayName: 'In Review', description: 'Task is under review', color: '#F59E0B', icon: '👀', order: 3, category: 'active' },
    { name: 'testing', displayName: 'Testing', description: 'Task is being tested', color: '#8B5CF6', icon: '🧪', order: 4, category: 'active' },
    { name: 'done', displayName: 'Done', description: 'Task is completed', color: '#10B981', icon: '✅', order: 5, category: 'done', isFinal: true },
    { name: 'cancelled', displayName: 'Cancelled', description: 'Task was cancelled', color: '#EF4444', icon: '❌', order: 6, category: 'cancelled', isFinal: true },
  ];

  for (const status of taskStatuses) {
    await prisma.taskStatus.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    });
  }

  // Task Types
  const taskTypes = [
    { name: 'task', displayName: 'Task', description: 'General task', color: '#3B82F6', icon: '📋', isDefault: true, allowSubtasks: true, allowTimeTracking: true },
    { name: 'bug', displayName: 'Bug', description: 'Bug fix task', color: '#EF4444', icon: '🐛', allowSubtasks: false, allowTimeTracking: true, requireEstimate: true },
    { name: 'feature', displayName: 'Feature', description: 'New feature development', color: '#10B981', icon: '✨', allowSubtasks: true, allowTimeTracking: true, requireEstimate: true },
    { name: 'epic', displayName: 'Epic', description: 'Large feature or initiative', color: '#8B5CF6', icon: '🎯', allowSubtasks: true, allowTimeTracking: false },
    { name: 'story', displayName: 'User Story', description: 'User story', color: '#F59E0B', icon: '📖', allowSubtasks: true, allowTimeTracking: true },
  ];

  for (const type of taskTypes) {
    await prisma.taskType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  console.log('✅ Created task priorities, statuses, and types');

  // ================================
  // SAMPLE TASKS SEEDING
  // ================================
  console.log('📋 Creating sample tasks...');

  // Get IT department for sample tasks (reuse existing variable)
  const backendTeam = await prisma.team.findFirst({
    where: { name: 'Backend Development', departmentId: itDepartment?.id },
  });
  const frontendTeam = await prisma.team.findFirst({
    where: { name: 'Frontend Development', departmentId: itDepartment?.id },
  });

  if (itDepartment && backendTeam && frontendTeam) {
    // Epic: Internal Chat App Development
    const epic = await prisma.task.create({
      data: {
        title: 'Internal Chat App Development',
        description: 'Complete development of the internal chat application for company-wide communication',
        type: 'epic',
        priority: 'high',
        status: 'in_progress',
        departmentId: itDepartment.id,
        estimatedHours: 500,
        startDate: new Date('2025-01-01'),
        dueDate: new Date('2025-03-31'),
        labels: ['internal-tools', 'communication', 'priority'],
        tags: ['chat', 'real-time', 'web-app'],
        createdBy: adminUser.id,
      },
    });

    // Backend Stories
    const backendStories = [
      {
        title: 'Database Schema Design',
        description: 'Design and implement comprehensive database schema for users, chats, messages, and tasks',
        type: 'story',
        priority: 'high',
        status: 'done',
        teamId: backendTeam.id,
        estimatedHours: 20,
        actualHours: 18,
        storyPoints: 8,
        completedAt: new Date(),
        labels: ['database', 'schema'],
        tags: ['prisma', 'postgresql'],
      },
      {
        title: 'Authentication System',
        description: 'Implement JWT-based authentication with role-based access control',
        type: 'story',
        priority: 'high',
        status: 'todo',
        teamId: backendTeam.id,
        estimatedHours: 30,
        storyPoints: 13,
        labels: ['auth', 'security'],
        tags: ['jwt', 'rbac'],
      },
      {
        title: 'Real-time Chat API',
        description: 'Develop Socket.io based real-time messaging API with chat rooms',
        type: 'story',
        priority: 'high',
        status: 'todo',
        teamId: backendTeam.id,
        estimatedHours: 40,
        storyPoints: 21,
        labels: ['real-time', 'api'],
        tags: ['socket.io', 'messaging'],
      },
    ];

    // Frontend Stories
    const frontendStories = [
      {
        title: 'UI Component Library',
        description: 'Create reusable UI components using Material-UI',
        type: 'story',
        priority: 'medium',
        status: 'todo',
        teamId: frontendTeam.id,
        estimatedHours: 25,
        storyPoints: 8,
        labels: ['ui', 'components'],
        tags: ['material-ui', 'react'],
      },
      {
        title: 'Chat Interface',
        description: 'Build responsive chat interface with message history and real-time updates',
        type: 'story',
        priority: 'high',
        status: 'todo',
        teamId: frontendTeam.id,
        estimatedHours: 35,
        storyPoints: 13,
        labels: ['chat', 'ui'],
        tags: ['react', 'real-time'],
      },
    ];

    // Create backend stories
    for (const storyData of backendStories) {
      await prisma.task.create({
        data: {
          ...storyData,
          departmentId: itDepartment.id,
          epicId: epic.id,
          createdBy: adminUser.id,
        },
      });
    }

    // Create frontend stories
    for (const storyData of frontendStories) {
      await prisma.task.create({
        data: {
          ...storyData,
          departmentId: itDepartment.id,
          epicId: epic.id,
          createdBy: adminUser.id,
        },
      });
    }

    // Assign admin to epic
    await prisma.taskAssignment.create({
      data: {
        taskId: epic.id,
        userId: adminUser.id,
        role: 'assignee',
        acceptedAt: new Date(),
      },
    });

    // Add admin as watcher to all tasks
    const allTasks = await prisma.task.findMany({
      where: { epicId: epic.id },
    });

    for (const task of allTasks) {
      await prisma.taskWatcher.create({
        data: {
          taskId: task.id,
          userId: adminUser.id,
        },
      });
    }

    console.log(`✅ Created epic with ${backendStories.length + frontendStories.length} stories`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
