/**
 * Enhanced security for browser storage
 */

// Simple encryption key - In production, this would be more secure
const ENCRYPTION_KEY = 'zurura-app-secret-key';

/**
 * Basic encryption for sensitive data
 * Note: This is not cryptographically secure for production
 * For real security, use a proper encryption library
 */
function encrypt(data) {
  if (!data) return '';
  
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
    console.error('Encryption error:', error);
    return '';
  }
}

/**
 * Decrypt data from storage
 */
function decrypt(encryptedData) {
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
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Set an item in secure storage
 */
export function setSecureItem(key, value) {
  try {
    const encryptedValue = encrypt(value);
    localStorage.setItem(`secure_${key}`, encryptedValue);
    return true;
  } catch (error) {
    console.error('Error setting secure item:', error);
    return false;
  }
}

/**
 * Get an item from secure storage
 */
export function getSecureItem(key) {
  try {
    const encryptedValue = localStorage.getItem(`secure_${key}`);
    if (!encryptedValue) return null;
    
    const decryptedValue = decrypt(encryptedValue);
    
    // Try to parse as JSON if possible
    try {
      return JSON.parse(decryptedValue);
    } catch (e) {
      // If not JSON, return as is
      return decryptedValue;
    }
  } catch (error) {
    console.error('Error getting secure item:', error);
    return null;
  }
}

/**
 * Remove an item from secure storage
 */
export function removeSecureItem(key) {
  try {
    localStorage.removeItem(`secure_${key}`);
    return true;
  } catch (error) {
    console.error('Error removing secure item:', error);
    return false;
  }
}

/**
 * Clear all secure items from storage
 */
export function clearSecureStorage() {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing secure storage:', error);
    return false;
  }
}
