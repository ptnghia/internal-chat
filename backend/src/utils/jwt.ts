import jwt from 'jsonwebtoken';
import { config } from './validateEnv';
import { logger, authLogger } from './logger';

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

// Refresh token payload interface
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// Token pair interface
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

// JWT utilities class
export class JWTUtils {
  private static get accessTokenSecret() {
    return config.jwt.secret;
  }

  private static get refreshTokenSecret() {
    return config.jwt.refreshSecret;
  }

  private static get accessTokenExpiry() {
    return config.jwt.expiresIn;
  }

  private static get refreshTokenExpiry() {
    return config.jwt.refreshExpiresIn;
  }

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      const token = jwt.sign(payload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        issuer: 'internal-chat-api',
        audience: 'internal-chat-app',
      });

      authLogger.debug('Access token generated', {
        userId: payload.userId,
        expiresIn: this.accessTokenExpiry,
      });

      return token;
    } catch (error) {
      authLogger.error('Failed to generate access token', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    try {
      const token = jwt.sign(payload, this.refreshTokenSecret, {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'internal-chat-api',
        audience: 'internal-chat-app',
      });

      authLogger.debug('Refresh token generated', {
        userId: payload.userId,
        tokenId: payload.tokenId,
        expiresIn: this.refreshTokenExpiry,
      });

      return token;
    } catch (error) {
      authLogger.error('Failed to generate refresh token', error);
      throw new Error('Refresh token generation failed');
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(
    userPayload: Omit<JWTPayload, 'iat' | 'exp'>,
    tokenId: string
  ): TokenPair {
    const accessToken = this.generateAccessToken(userPayload);
    const refreshToken = this.generateRefreshToken({
      userId: userPayload.userId,
      tokenId,
    });

    // Calculate expiry times in seconds
    const accessExpiresIn = this.parseExpiry(this.accessTokenExpiry);
    const refreshExpiresIn = this.parseExpiry(this.refreshTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn: refreshExpiresIn,
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'internal-chat-api',
        audience: 'internal-chat-app',
      }) as JWTPayload;

      authLogger.debug('Access token verified', {
        userId: decoded.userId,
        exp: decoded.exp,
      });

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        authLogger.warn('Access token expired', { error: error.message });
        throw new Error('Token expired');
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        authLogger.warn('Invalid access token', { error: error.message });
        throw new Error('Invalid token');
      }

      authLogger.error('Access token verification failed', error);
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'internal-chat-api',
        audience: 'internal-chat-app',
      }) as RefreshTokenPayload;

      authLogger.debug('Refresh token verified', {
        userId: decoded.userId,
        tokenId: decoded.tokenId,
        exp: decoded.exp,
      });

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        authLogger.warn('Refresh token expired', { error: error.message });
        throw new Error('Refresh token expired');
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        authLogger.warn('Invalid refresh token', { error: error.message });
        throw new Error('Invalid refresh token');
      }

      authLogger.error('Refresh token verification failed', error);
      throw new Error('Refresh token verification failed');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      authLogger.error('Token decode failed', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiry time
   */
  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse expiry string to seconds
   */
  private static parseExpiry(expiry: string): number {
    const units: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
    };

    const match = expiry.match(/^(\d+)([smhdw])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Create token blacklist key for Redis
   */
  static createBlacklistKey(tokenId: string): string {
    return `blacklist:token:${tokenId}`;
  }

  /**
   * Create refresh token key for Redis
   */
  static createRefreshTokenKey(userId: string, tokenId: string): string {
    return `refresh:${userId}:${tokenId}`;
  }
}

// Export convenience functions
export const {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiry,
  extractTokenFromHeader,
} = JWTUtils;

export default JWTUtils;
