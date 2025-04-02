import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to protect routes in components
 * @param {Object} options - Hook options
 * @param {string} [options.redirectPath='/auth/login'] - Path to redirect to if not authenticated
 * @param {string|string[]} [options.requiredRoles] - Required role(s) to access the route
 * @returns {Object} Authentication state information
 */
export function useProtectedRoute({ redirectPath = '/auth/login', requiredRoles = null } = {}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Skip check if still loading
    if (isLoading) return;
    
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate(redirectPath, { replace: true });
      return;
    }
    
    // Check role requirements if specified
    if (requiredRoles && user) {
      const userRole = user.role;
      const hasRequiredRole = Array.isArray(requiredRoles)
        ? requiredRoles.includes(userRole)
        : userRole === requiredRoles;
      
      if (!hasRequiredRole) {
        // Default redirect based on role
        const roleBasedPath = userRole === 'operator' 
          ? '/operator/dashboard' 
          : '/commuter/routes';
        
        navigate(roleBasedPath, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, navigate, redirectPath]);
  
  return { isAuthenticated, user, isLoading };
}
