import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLogger } from '@/utils/logger';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema,
} from '@/schemas/auth';

export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body);
    
    const result = await AuthService.register(validatedData);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
      meta: {
        requiresEmailVerification: true,
      },
    });
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body);
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await AuthService.login(validatedData, ipAddress);

    if (result.requiresTwoFactor) {
      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication required',
        data: {
          requiresTwoFactor: true,
          tempToken: result.tempToken,
        },
      });
    }

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: result.tokens.refreshExpiresIn * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
    });
  });

  /**
   * Refresh access token
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // Try to get refresh token from cookie first, then from body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.refreshExpiresIn * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    });
  });

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const { allDevices = false } = req.body;
    const refreshToken = req.cookies.refreshToken;

    if (req.user && refreshToken) {
      try {
        // Extract token ID from refresh token for single device logout
        const payload = require('jsonwebtoken').decode(refreshToken);
        const tokenId = payload?.tokenId;

        await AuthService.logout(req.user.id, tokenId, allDevices);
      } catch (error) {
        authLogger.warn('Error during logout', error);
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: allDevices ? 'Logged out from all devices' : 'Logout successful',
    });
  });

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user,
      },
    });
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const validatedData = changePasswordSchema.parse(req.body);

    await AuthService.changePassword(req.user.id, validatedData);

    // Clear refresh token cookie to force re-login
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  });

  /**
   * Request password reset
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = forgotPasswordSchema.parse(req.body);

    const resetToken = await AuthService.requestPasswordReset(validatedData.email);

    // In production, send email instead of returning token
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
        data: {
          resetToken, // Only for development
        },
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset email has been sent',
      });
    }
  });

  /**
   * Reset password
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = resetPasswordSchema.parse(req.body);

    await AuthService.resetPassword(validatedData);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  });

  /**
   * Verify email
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = emailVerificationSchema.parse(req.body);

    await AuthService.verifyEmail(validatedData.token);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  });

  /**
   * Resend verification email
   */
  static resendVerification = asyncHandler(async (req: Request, res: Response) => {
    // Implementation would depend on email service
    res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  });

  /**
   * Check authentication status
   */
  static checkAuth = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Authenticated',
      data: {
        user: req.user,
      },
    });
  });

  /**
   * Get user permissions
   */
  static getPermissions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Permissions retrieved successfully',
      data: {
        roles: req.user.roles,
        permissions: req.user.permissions,
      },
    });
  });
}

export default AuthController;
