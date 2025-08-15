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
