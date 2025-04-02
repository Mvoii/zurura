import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';

/**
 * Protected route component that checks authentication
 * @param {Object} props - Component props
 * @param {string} [props.redirectPath='/auth/login'] - Path to redirect to if not authenticated
 * @returns {JSX.Element} The protected route
 */
export default function ProtectedRoute({ redirectPath = '/auth/login' }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Render the protected content
  return <Outlet />;
}
