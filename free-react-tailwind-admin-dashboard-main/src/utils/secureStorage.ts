/**
 * Enhanced security for browser storage with TypeScript support
 */

// Simple encryption key - In production, this would be more secure
const ENCRYPTION_KEY = 'zurura-app-secret-key';

/**
 * Helper to format errors consistently
 */
function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

/**
 * Basic encryption for sensitive data
 * Note: This is not cryptographically secure for production
 * For real security, use a proper encryption library
 */
function encrypt(data: unknown): string {
  if (data === undefined || data === null) return '';
  
  try {
    // Convert to string if it's not already
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Simple XOR encryption with key
    let result = '';
    for (let i = 0; i < stringData.length; i++) {
      const charCode = stringData.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    
    // Convert to base64 for storage
    return btoa(result);
  } catch (error) {
    console.error('Encryption error:', formatError(error));
    return '';
  }
}

/**
 * Decrypt data from storage
 */
function decrypt(encryptedData: string): string | null {
  if (!encryptedData) return null;
  
  try {
    // Decode from base64
    const data = atob(encryptedData);
    
    // Reverse the XOR operation
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch (error) {
    console.error('Decryption error:', formatError(error));
    return null;
  }
}

/**
 * Set an item in secure storage
 */
export function setSecureItem(key: string, value: unknown): boolean {
  if (!key) {
    console.error('Error setting secure item: Key is required');
    return false;
  }

  try {
    const encryptedValue = encrypt(value);
    localStorage.setItem(`secure_${key}`, encryptedValue);
    return true;
  } catch (error) {
    console.error('Error setting secure item:', formatError(error));
    return false;
  }
}

/**
 * Get an item from secure storage
 * @template T - The expected type of the stored value
 */
export function getSecureItem<T = unknown>(key: string): T | null {
  if (!key) {
    console.error('Error getting secure item: Key is required');
    return null;
  }

  try {
    const encryptedValue = localStorage.getItem(`secure_${key}`);
    if (!encryptedValue) return null;
    
    const decryptedValue = decrypt(encryptedValue);
    if (decryptedValue === null) return null;
    
    // Try to parse as JSON if possible
    try {
      return JSON.parse(decryptedValue) as T;
    } catch {
      // If it's not valid JSON and T is expected to be a string, return as string
      return typeof decryptedValue === 'string' 
        ? (decryptedValue as unknown as T) 
        : null;
    }
  } catch (error) {
    console.error('Error getting secure item:', formatError(error));
    return null;
  }
}

/**
 * Remove an item from secure storage
 */
export function removeSecureItem(key: string): boolean {
  if (!key) {
    console.error('Error removing secure item: Key is required');
    return false;
  }

  try {
    localStorage.removeItem(`secure_${key}`);
    return true;
  } catch (error) {
    console.error('Error removing secure item:', formatError(error));
    return false;
  }
}

/**
 * Clear all secure items from storage
 */
export function clearSecureStorage(): boolean {
  try {
    const keysToRemove: string[] = [];
    
    // First collect all the keys to avoid modification during iteration
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('secure_')) {
        keysToRemove.push(key);
      }
    }
    
    // Then remove all collected keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error('Error clearing secure storage:', formatError(error));
    return false;
  }
}