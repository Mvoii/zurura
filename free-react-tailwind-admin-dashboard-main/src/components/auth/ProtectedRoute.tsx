import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

interface ProtectedRouteProps {
  requiredRole?: 'commuter' | 'operator' | 'driver' | 'admin';
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { 
    isAuthenticated, 
    isOperator, 
    isDriver, 
    isCommuter 
  } = useAuth();
  
  // First check if user is authenticated at all
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to signin');
    return <Navigate to="/auth/signin" replace />;
  }

  // Then check role-based access
  if (requiredRole) {
    let hasRequiredRole = false;
    
    // Check for required role
    switch (requiredRole) {
      case 'operator':
        hasRequiredRole = isOperator;
        break;
      case 'driver':
        hasRequiredRole = isDriver;
        break;
      case 'commuter':
        hasRequiredRole = isCommuter;
        break;
      default:
        hasRequiredRole = false;
    }
    
    // Redirect if user doesn't have the required role
    if (!hasRequiredRole) {
      console.log(`User does not have required role: ${requiredRole}`);
      
      // Redirect based on the user's actual role
      if (isOperator) {
        return <Navigate to="/operator/dashboard" replace />;
      } else if (isDriver) {
        return <Navigate to="/driver/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }
  
  // Allow access if authenticated and has required role (or no role required)
  return <Outlet />;
};

export default ProtectedRoute;