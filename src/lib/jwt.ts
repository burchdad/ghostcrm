/**
 * Shared JWT utility for consistent token signing and verification
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set');
  throw new Error('JWT_SECRET must be configured');
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  tenantId?: string;
  exp?: number;
  iat?: number;
}

/**
 * Sign a JWT token with consistent payload structure
 */
export function signJwtToken(payload: Omit<JwtPayload, 'exp' | 'iat'>, expiresIn: string = '24h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token
 */
export function verifyJwtToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Get JWT secret (for compatibility with existing code)
 */
export function getJwtSecret(): string {
  return JWT_SECRET;
}

/**
 * Check if JWT secret is configured
 */
export function hasJwtSecret(): boolean {
  return !!JWT_SECRET;
}