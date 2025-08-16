import { z } from 'zod';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

// Email validation schema
const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase();

// Username validation schema
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username must not exceed 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .toLowerCase();

// Name validation schema
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, apostrophes, and hyphens')
  .trim();

// Phone validation schema
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

// ================================
// AUTHENTICATION SCHEMAS
// ================================

// Register schema
export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  departmentId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Login schema
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Resend verification email schema
export const resendVerificationSchema = z.object({
  email: emailSchema,
});

// Update profile schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  timezone: z.string().optional(),
  language: z.string().min(2).max(5).optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
  }).optional(),
});

// ================================
// TWO-FACTOR AUTHENTICATION SCHEMAS
// ================================

// Enable 2FA schema
export const enable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// Verify 2FA setup schema
export const verify2FASetupSchema = z.object({
  token: z.string().length(6, 'TOTP token must be 6 digits').regex(/^\d+$/, 'TOTP token must contain only digits'),
  backupCodes: z.array(z.string()).optional(),
});

// Verify 2FA login schema
export const verify2FALoginSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  type: z.enum(['totp', 'backup'], {
    errorMap: () => ({ message: 'Token type must be either "totp" or "backup"' }),
  }),
});

// Disable 2FA schema
export const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
  token: z.string().length(6, 'TOTP token must be 6 digits').regex(/^\d+$/, 'TOTP token must contain only digits'),
});

// Generate backup codes schema
export const generateBackupCodesSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// ================================
// SESSION MANAGEMENT SCHEMAS
// ================================

// Logout schema
export const logoutSchema = z.object({
  allDevices: z.boolean().optional().default(false),
});

// Revoke session schema
export const revokeSessionSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID'),
});

// ================================
// API KEY SCHEMAS
// ================================

// Create API key schema
export const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100, 'Name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().datetime().optional(),
});

// Update API key schema
export const updateApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100, 'Name must not exceed 100 characters').optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required').optional(),
  isActive: z.boolean().optional(),
});

// ================================
// ADMIN SCHEMAS
// ================================

// Create user schema (admin only)
export const createUserSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema.optional(),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  departmentId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  roles: z.array(z.string().cuid()).min(1, 'At least one role is required'),
  isActive: z.boolean().optional().default(true),
  isEmailVerified: z.boolean().optional().default(false),
  sendWelcomeEmail: z.boolean().optional().default(true),
});

// Update user schema (admin only)
export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  username: usernameSchema.optional(),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  departmentId: z.string().cuid().optional(),
  teamId: z.string().cuid().optional(),
  roles: z.array(z.string().cuid()).optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
});

// Assign role schema
export const assignRoleSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  roleId: z.string().cuid('Invalid role ID'),
});

// Remove role schema
export const removeRoleSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  roleId: z.string().cuid('Invalid role ID'),
});

// ================================
// VALIDATION HELPERS
// ================================

// Validate password strength
export const validatePasswordStrength = (password: string) => {
  const result = passwordSchema.safeParse(password);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.errors.map(err => err.message),
  };
};

// Validate email format
export const validateEmail = (email: string) => {
  const result = emailSchema.safeParse(email);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.errors.map(err => err.message),
  };
};

// Validate username format
export const validateUsername = (username: string) => {
  const result = usernameSchema.safeParse(username);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.errors.map(err => err.message),
  };
};

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;
export type Verify2FASetupInput = z.infer<typeof verify2FASetupSchema>;
export type Verify2FALoginInput = z.infer<typeof verify2FALoginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
