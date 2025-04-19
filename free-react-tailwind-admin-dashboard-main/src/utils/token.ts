import { getSecureItem, setSecureItem, removeSecureItem } from './secureStorage';

/**
 * Token utility functions for handling JWTs
 */

interface TokenPayload {
  exp?: number;
  role?: string;
  user_id?: string;
  email?: string;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Parse a JWT token without using a library
 * @param token - The JWT token to parse
 * @returns The parsed token payload or null if invalid
 */
export function parseToken(token: string): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  
  try {
    // Split the token into its parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
    
    return payload as TokenPayload;
  } catch (error) {
    console.error('Error parsing token:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - The JWT token to check
 * @returns True if the token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  
  const payload = parseToken(token);
  if (!payload || !payload.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}

/**
 * Get the remaining time before token expiration
 * @param token - The JWT token to check
 * @returns Remaining time in milliseconds, 0 if expired
 */
export function getTokenRemainingTime(token: string): number {
  if (!token) return 0;
  
  const payload = parseToken(token);
  if (!payload || !payload.exp) return 0;
  
  const expirationTime = payload.exp * 1000;
  const remainingTime = expirationTime - Date.now();
  
  return remainingTime > 0 ? remainingTime : 0;
}

/**
 * Extract user role from token
 * @param token - The JWT token
 * @returns The user role or null if not found
 */
export function getUserRole(token: string): string | null {
  if (!token) return null;
  
  const payload = parseToken(token);
  return payload?.role || null;
}

/**
 * Extract user ID from token
 * @param token - The JWT token
 * @returns The user ID or null if not found
 */
export function getUserId(token: string): string | null {
  if (!token) return null;
  
  const payload = parseToken(token);
  return payload?.user_id || null;
}

/**
 * Get token from secure storage with expiration check
 * @returns The valid token or null if expired/nonexistent
 */
export function getValidToken(): string | null {
  const token = getSecureItem<string>('auth-token');
  if (!token) return null;
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    // Clean up expired token
    clearAuthData();
    return null;
  }
  
  return token;
}

/**
 * Store token with additional security measures
 * @param token - The JWT token to store
 * @param user - The user object to store
 */
export function storeAuthData(token: string, user: User): void {
  if (!token || !user) {
    console.error('Cannot store auth data: Token and user are required');
    return;
  }
  
  setSecureItem('auth-token', token);
  setSecureItem('user', user);
  
  // Store expiration time for additional validation
  const payload = parseToken(token);
  if (payload && payload.exp) {
    setSecureItem('token-exp', payload.exp.toString());
  }
}

/**
 * Get current authenticated user
 * @returns User object or null if not authenticated
 */
export function getCurrentUser(): User | null {
  return getSecureItem<User>('user');
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  removeSecureItem('auth-token');
  removeSecureItem('user');
  removeSecureItem('token-exp');
}

/**
 * Check if user has specific role
 * @param role - The role to check
 * @returns True if user has the specified role
 */
export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  return Boolean(user?.role && user.role === role);
}

/**
 * Check if current user is an operator
 * @returns True if user is an operator
 */
export function isOperator(): boolean {
  return hasRole('operator');
}

/**
 * Check if current user is a driver
 * @returns True if user is a driver
 */
export function isDriver(): boolean {
  return hasRole('driver');
}

/**
 * Check if current user is a commuter (default role)
 * @returns True if user is a commuter
 */
export function isCommuter(): boolean {
  const user = getCurrentUser();
  // If user has no specific role or role is 'user' or 'commuter', they're a commuter
  return Boolean(user && (!user.role || user.role === 'user' || user.role === 'commuter'));
}

/**
 * Verify if user is authenticated
 * @returns True if user is authenticated with a valid token
 */
export function isAuthenticated(): boolean {
  return getValidToken() !== null;
}