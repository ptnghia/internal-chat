import { prisma } from '@/utils/database';
import { JWTUtils, TokenPair } from '@/utils/jwt';
import { PasswordUtils } from '@/utils/password';
import { authLogger, logAuth } from '@/utils/logger';
import { AuthenticationError, ConflictError, NotFoundError, ValidationError } from '@/middleware/errorHandler';
import { RegisterInput, LoginInput, ChangePasswordInput, ResetPasswordInput } from '@/schemas/auth';
import crypto from 'crypto';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput): Promise<{
    user: any;
    tokens: TokenPair;
    verificationToken: string;
  }> {
    try {
      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new ConflictError('Email already registered');
      }

      // Check if username already exists
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUsername) {
        throw new ConflictError('Username already taken');
      }

      // Validate department and team if provided
      if (data.departmentId) {
        const department = await prisma.department.findUnique({
          where: { id: data.departmentId },
        });
        if (!department) {
          throw new ValidationError('Invalid department ID');
        }
      }

      if (data.teamId) {
        const team = await prisma.team.findUnique({
          where: { id: data.teamId },
        });
        if (!team) {
          throw new ValidationError('Invalid team ID');
        }
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hashPassword(data.password);

      // Generate verification token
      const verificationToken = PasswordUtils.generateVerificationToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: data.email,
            username: data.username,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
            isActive: true,
            isEmailVerified: false,
          },
        });

        // Assign default EMPLOYEE role
        const employeeRole = await tx.role.findUnique({
          where: { name: 'EMPLOYEE' },
        });

        if (employeeRole) {
          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: employeeRole.id,
            },
          });
        }

        // Add to department if specified
        if (data.departmentId) {
          await tx.userDepartment.create({
            data: {
              userId: user.id,
              departmentId: data.departmentId,
            },
          });
        }

        // Add to team if specified
        if (data.teamId) {
          await tx.userTeam.create({
            data: {
              userId: user.id,
              teamId: data.teamId,
            },
          });
        }

        return user;
      });

      // Get user with roles and permissions for token generation
      const userWithRoles = await this.getUserWithRoles(result.id);

      // Generate tokens
      const tokenId = crypto.randomUUID();
      const tokens = JWTUtils.generateTokenPair(
        {
          userId: userWithRoles.id,
          email: userWithRoles.email,
          username: userWithRoles.username,
          roles: userWithRoles.roles,
          permissions: userWithRoles.permissions,
        },
        tokenId
      );

      // Store refresh token
      await this.storeRefreshToken(userWithRoles.id, tokenId, tokens.refreshToken);

      logAuth('user_registered', userWithRoles.id, true, {
        email: data.email,
        username: data.username,
      });

      return {
        user: this.sanitizeUser(userWithRoles),
        tokens,
        verificationToken,
      };
    } catch (error) {
      authLogger.error('User registration failed', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginInput, ipAddress?: string): Promise<{
    user: any;
    tokens: TokenPair;
    requiresTwoFactor?: boolean;
    tempToken?: string;
  }> {
    try {
      // Find user by email or username
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.identifier.toLowerCase() },
            { username: data.identifier.toLowerCase() },
          ],
        },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        logAuth('login_failed', undefined, false, {
          identifier: data.identifier,
          reason: 'user_not_found',
          ipAddress,
        });
        throw new AuthenticationError('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        logAuth('login_failed', user.id, false, {
          reason: 'account_inactive',
          ipAddress,
        });
        throw new AuthenticationError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await PasswordUtils.verifyPassword(data.password, user.password);
      if (!isPasswordValid) {
        logAuth('login_failed', user.id, false, {
          reason: 'invalid_password',
          ipAddress,
        });
        throw new AuthenticationError('Invalid credentials');
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Generate temporary token for 2FA verification
        const tempToken = crypto.randomUUID();
        const tempTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
          where: { id: user.id },
          data: {
            tempToken,
            tempTokenExpires,
          },
        });

        logAuth('login_2fa_required', user.id, true, {
          ipAddress,
        });

        return {
          user: this.sanitizeUser(user),
          tokens: {} as TokenPair, // Empty tokens
          requiresTwoFactor: true,
          tempToken,
        };
      }

      // Generate tokens
      const tokenId = crypto.randomUUID();
      const roles = user.userRoles.map(ur => ur.role.name);
      const permissions = user.userRoles.flatMap(ur =>
        ur.role.permissions.map(rp => rp.permission.name)
      );

      const tokens = JWTUtils.generateTokenPair(
        {
          userId: user.id,
          email: user.email,
          username: user.username,
          roles,
          permissions: [...new Set(permissions)],
        },
        tokenId
      );

      // Store refresh token
      await this.storeRefreshToken(user.id, tokenId, tokens.refreshToken);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
        },
      });

      logAuth('login_success', user.id, true, {
        ipAddress,
        rememberMe: data.rememberMe,
      });

      return {
        user: this.sanitizeUser(user),
        tokens,
      };
    } catch (error) {
      authLogger.error('User login failed', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = JWTUtils.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: {
          userId_tokenId: {
            userId: payload.userId,
            tokenId: payload.tokenId,
          },
        },
        include: {
          user: {
            include: {
              userRoles: {
                include: {
                  role: {
                    include: {
                      rolePermissions: {
                        include: {
                          permission: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!storedToken || !storedToken.isActive) {
        throw new AuthenticationError('Invalid refresh token');
      }

      if (storedToken.expiresAt < new Date()) {
        throw new AuthenticationError('Refresh token expired');
      }

      // Check if user is still active
      if (!storedToken.user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Generate new token pair
      const newTokenId = crypto.randomUUID();
      const roles = storedToken.user.userRoles.map(ur => ur.role.name);
      const permissions = storedToken.user.userRoles.flatMap(ur =>
        ur.role.rolePermissions.map(rp => rp.permission.name)
      );

      const tokens = JWTUtils.generateTokenPair(
        {
          userId: storedToken.user.id,
          email: storedToken.user.email,
          username: storedToken.user.username,
          roles,
          permissions: [...new Set(permissions)],
        },
        newTokenId
      );

      // Update refresh token in database
      await prisma.$transaction(async (tx) => {
        // Deactivate old token
        await tx.refreshToken.update({
          where: { id: storedToken.id },
          data: { isActive: false },
        });

        // Store new refresh token
        await this.storeRefreshToken(storedToken.user.id, newTokenId, tokens.refreshToken, tx);
      });

      logAuth('token_refreshed', storedToken.user.id, true);

      return tokens;
    } catch (error) {
      authLogger.error('Token refresh failed', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string, tokenId?: string, allDevices: boolean = false): Promise<void> {
    try {
      if (allDevices) {
        // Deactivate all refresh tokens for user
        await prisma.refreshToken.updateMany({
          where: { userId },
          data: { isActive: false },
        });

        logAuth('logout_all_devices', userId, true);
      } else if (tokenId) {
        // Deactivate specific refresh token
        await prisma.refreshToken.updateMany({
          where: { userId, tokenId },
          data: { isActive: false },
        });

        logAuth('logout_single_device', userId, true, { tokenId });
      }
    } catch (error) {
      authLogger.error('Logout failed', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordUtils.verifyPassword(
        data.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await PasswordUtils.hashPassword(data.newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
      });

      // Deactivate all refresh tokens to force re-login
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      logAuth('password_changed', userId, true);
    } catch (error) {
      authLogger.error('Password change failed', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<void> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid or expired verification token');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });

      logAuth('email_verified', user.id, true);
    } catch (error) {
      authLogger.error('Email verification failed', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<string> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if email exists
        logAuth('password_reset_requested', undefined, false, {
          email,
          reason: 'user_not_found',
        });
        return 'reset_token'; // Return dummy token
      }

      const resetToken = PasswordUtils.generateResetToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        },
      });

      logAuth('password_reset_requested', user.id, true);
      return resetToken;
    } catch (error) {
      authLogger.error('Password reset request failed', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(data: ResetPasswordInput): Promise<void> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: data.token,
          passwordResetExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      const hashedPassword = await PasswordUtils.hashPassword(data.password);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          passwordChangedAt: new Date(),
        },
      });

      // Deactivate all refresh tokens
      await prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { isActive: false },
      });

      logAuth('password_reset', user.id, true);
    } catch (error) {
      authLogger.error('Password reset failed', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private static async getUserWithRoles(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );

    return {
      ...user,
      roles,
      permissions: [...new Set(permissions)],
    };
  }

  private static async storeRefreshToken(
    userId: string,
    tokenId: string,
    refreshToken: string,
    tx?: any
  ) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const client = tx || prisma;

    await client.refreshToken.create({
      data: {
        userId,
        tokenId,
        token: refreshToken,
        expiresAt,
        isActive: true,
      },
    });
  }

  private static sanitizeUser(user: any) {
    const { password, emailVerificationToken, passwordResetToken, tempToken, ...sanitized } = user;
    return sanitized;
  }
}

export default AuthService;
