import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/hooks/useAuth';

/**
 * Role-based guard component for route-based protection
 * @param {Object} props - Component props
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access the route
 * @param {string} [props.redirectPath='/'] - Path to redirect to if role is not allowed
 * @returns {JSX.Element} The protected outlet for nested routes
 */
export default function RoleGuard({ allowedRoles, redirectPath = '/' }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // Check if user has allowed role
  const userRole = user?.role;
  const hasAllowedRole = Array.isArray(allowedRoles) 
    ? allowedRoles.includes(userRole)
    : userRole === allowedRoles;
  
  // Redirect if not authorized
  if (!hasAllowedRole) {
    // Redirect to appropriate dashboard based on actual role
    if (userRole === 'operator') {
      return <Navigate to="/operator/dashboard" replace />;
    } else {
      return <Navigate to="/routes" replace />;
    }
  }
  
  // Render the protected content
  return <Outlet />;
}