/**
 * Token utility functions for handling JWTs
 */

/**
 * Parse a JWT token without using a library
 * @param {string} token - The JWT token to parse
 * @returns {object|null} The parsed token payload or null if invalid
 */
export function parseToken(token) {
  try {
    if (!token) return null;
    
    // Split the token into its parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

/**
 * Check if a token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if the token is expired, false otherwise
 */
export function isTokenExpired(token) {
  const payload = parseToken(token);
  if (!payload || !payload.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}

/**
 * Get the remaining time before token expiration
 * @param {string} token - The JWT token to check
 * @returns {number} Remaining time in milliseconds, 0 if expired
 */
export function getTokenRemainingTime(token) {
  const payload = parseToken(token);
  if (!payload || !payload.exp) return 0;
  
  const expirationTime = payload.exp * 1000;
  const remainingTime = expirationTime - Date.now();
  
  return remainingTime > 0 ? remainingTime : 0;
}

/**
 * Extract user role from token
 * @param {string} token - The JWT token
 * @returns {string|null} The user role or null if not found
 */
export function getUserRole(token) {
  const payload = parseToken(token);
  return payload?.role || null;
}

/**
 * Get token from localStorage with expiration check
 * @returns {string|null} The valid token or null if expired/nonexistent
 */
export function getValidToken() {
  const token = localStorage.getItem('token');
  
  if (!token || isTokenExpired(token)) {
    // Clean up expired token
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return null;
  }
  
  return token;
}

/**
 * Store token with additional security measures
 * @param {string} token - The JWT token to store
 * @param {object} user - The user object to store
 */
export function storeAuthData(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Store expiration time for additional validation
  const payload = parseToken(token);
  if (payload && payload.exp) {
    localStorage.setItem('token_exp', payload.exp.toString());
  }
}

/**
 * Clear all authentication data
 */
export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('token_exp');
}
