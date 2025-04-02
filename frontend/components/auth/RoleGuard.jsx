import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';

/**
 * Role-based guard component
 * @param {Object} props - Component props
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access the route
 * @param {string} [props.redirectPath='/'] - Path to redirect to if role is not allowed
 * @returns {JSX.Element} The protected route with role check
 */
export default function RoleGuard({ allowedRoles, redirectPath = '/' }) {
  const { user, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Check if user has allowed role
  const userRole = user?.role;
  const hasAllowedRole = Array.isArray(allowedRoles) 
    ? allowedRoles.includes(userRole)
    : userRole === allowedRoles;
  
  // Redirect if not authorized
  if (!hasAllowedRole) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Render the protected content
  return <Outlet />;
}
