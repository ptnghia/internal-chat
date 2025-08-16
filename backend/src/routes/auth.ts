import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { authenticate, optionalAuth } from '@/middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ================================
// PUBLIC ROUTES (No authentication required)
// ================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', passwordResetLimiter, AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', authLimiter, AuthController.resetPassword);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', AuthController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification', passwordResetLimiter, AuthController.resendVerification);

/**
 * @route   GET /api/auth/check
 * @desc    Check authentication status
 * @access  Public (but returns user if authenticated)
 */
router.get('/check', optionalAuth, AuthController.checkAuth);

// ================================
// PROTECTED ROUTES (Authentication required)
// ================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticate, AuthController.changePassword);

/**
 * @route   GET /api/auth/permissions
 * @desc    Get user roles and permissions
 * @access  Private
 */
router.get('/permissions', authenticate, AuthController.getPermissions);

export default router;
