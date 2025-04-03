import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/hooks/useAuth';

export default function ProtectedRoute({ element, role }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Show loading indicator
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
  
  // Check role requirements
  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on actual role
    if (user.role === 'operator') {
      return <Navigate to="/operator/dashboard" replace />;
    } else {
      return <Navigate to="/routes" replace />;
    }
  }
  
  // User is authenticated and has correct role, render the protected component
  return element;
}