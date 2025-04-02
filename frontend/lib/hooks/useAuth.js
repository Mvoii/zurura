import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Simple hook to use the authentication context
 * @returns {Object} The authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
