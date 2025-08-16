import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from './validateEnv';
import { authLogger } from './logger';

// Password utilities class
export class PasswordUtils {
  private static get saltRounds() {
    return config.security.bcryptRounds;
  }

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      authLogger.debug('Password hashed successfully');
      return hashedPassword;
    } catch (error) {
      authLogger.error('Password hashing failed', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hashedPassword);
      
      authLogger.debug('Password verification completed', { isValid });
      return isValid;
    } catch (error) {
      authLogger.error('Password verification failed', error);
      throw new Error('Password verification failed');
    }
  }

  /**
   * Generate secure random password
   */
  static generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    authLogger.debug('Random password generated', { length });
    return password;
  }

  /**
   * Generate password reset token
   */
  static generateResetToken(): string {
    const token = crypto.randomBytes(32).toString('hex');
    authLogger.debug('Password reset token generated');
    return token;
  }

  /**
   * Generate email verification token
   */
  static generateVerificationToken(): string {
    const token = crypto.randomBytes(32).toString('hex');
    authLogger.debug('Email verification token generated');
    return token;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Number check
    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Common patterns check
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i,
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        feedback.push('Password contains common patterns and is easily guessable');
        score -= 1;
        break;
      }
    }

    // Sequential characters check
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Password should not contain repeated characters');
      score -= 1;
    }

    const isValid = feedback.length === 0 && score >= 4;

    authLogger.debug('Password strength validated', {
      score,
      isValid,
      feedbackCount: feedback.length,
    });

    return {
      isValid,
      score: Math.max(0, Math.min(5, score)),
      feedback,
    };
  }

  /**
   * Generate secure session ID
   */
  static generateSessionId(): string {
    const sessionId = crypto.randomBytes(32).toString('hex');
    authLogger.debug('Session ID generated');
    return sessionId;
  }

  /**
   * Generate API key
   */
  static generateApiKey(): string {
    const apiKey = crypto.randomBytes(32).toString('base64url');
    authLogger.debug('API key generated');
    return apiKey;
  }

  /**
   * Hash API key for storage
   */
  static async hashApiKey(apiKey: string): Promise<string> {
    try {
      // Use SHA-256 for API keys (faster than bcrypt for this use case)
      const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
      authLogger.debug('API key hashed successfully');
      return hash;
    } catch (error) {
      authLogger.error('API key hashing failed', error);
      throw new Error('API key hashing failed');
    }
  }

  /**
   * Verify API key against hash
   */
  static async verifyApiKey(apiKey: string, hashedApiKey: string): Promise<boolean> {
    try {
      const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
      const isValid = crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(hashedApiKey, 'hex')
      );
      
      authLogger.debug('API key verification completed', { isValid });
      return isValid;
    } catch (error) {
      authLogger.error('API key verification failed', error);
      throw new Error('API key verification failed');
    }
  }

  /**
   * Generate TOTP secret for 2FA
   */
  static generateTOTPSecret(): string {
    const secret = crypto.randomBytes(20).toString('base32');
    authLogger.debug('TOTP secret generated');
    return secret;
  }

  /**
   * Generate backup codes for 2FA
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    authLogger.debug('Backup codes generated', { count });
    return codes;
  }

  /**
   * Hash backup code for storage
   */
  static async hashBackupCode(code: string): Promise<string> {
    try {
      const hash = crypto.createHash('sha256').update(code.toLowerCase()).digest('hex');
      authLogger.debug('Backup code hashed successfully');
      return hash;
    } catch (error) {
      authLogger.error('Backup code hashing failed', error);
      throw new Error('Backup code hashing failed');
    }
  }

  /**
   * Verify backup code against hash
   */
  static async verifyBackupCode(code: string, hashedCode: string): Promise<boolean> {
    try {
      const hash = crypto.createHash('sha256').update(code.toLowerCase()).digest('hex');
      const isValid = crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(hashedCode, 'hex')
      );
      
      authLogger.debug('Backup code verification completed', { isValid });
      return isValid;
    } catch (error) {
      authLogger.error('Backup code verification failed', error);
      throw new Error('Backup code verification failed');
    }
  }
}

// Export convenience functions
export const {
  hashPassword,
  verifyPassword,
  generateRandomPassword,
  generateResetToken,
  generateVerificationToken,
  validatePasswordStrength,
  generateSessionId,
  generateApiKey,
  hashApiKey,
  verifyApiKey,
  generateTOTPSecret,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} = PasswordUtils;

export default PasswordUtils;
